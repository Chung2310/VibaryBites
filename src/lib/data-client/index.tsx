'use client';
import { useEffect, useMemo, useState, type DependencyList } from 'react';
import { createRequestCache } from './request-cache';
import { useToast } from '@/hooks/use-toast';

// Small compatibility bridge for existing screens. All data travels through the
// Next.js REST API; no MongoDB credentials or database driver enter the browser.
type Row = Record<string, any> & { id: string };
type Constraint = { field: string; value: string | number };
type Reference = { path: string; id?: string; constraints: Constraint[] };
const database = Object.freeze({ backend: 'mongodb' });
const changed = 'vibary:data-changed';
export const useDatabase = () => database;
export const useDataMemo = <T,>(factory: () => T, deps: DependencyList) => useMemo(factory, deps);
export const collection = (_database: unknown, path: string): Reference => ({ path, constraints: [] });
export const collectionGroup = collection;
export const doc = (_database: unknown, path: string, id: string): Reference => ({ path, id, constraints: [] });
export const where = (field: string, operation: string, value: string): Constraint => {
  if (operation !== '==' || !['slug', 'categorySlug'].includes(field)) throw new Error('Unsupported filter');
  return { field, value };
};
export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc'): Constraint => ({ field: 'sort', value: `${field}:${direction}` });
export const limit = (value: number): Constraint => ({ field: 'limit', value });
export const query = (reference: Reference, ...constraints: Constraint[]): Reference => ({ ...reference, constraints: [...reference.constraints, ...constraints] });
const publicResources = new Set(['cakes', 'categories', 'news_articles', 'birthday_cake_sizes']);
const dataCache = createRequestCache(15000);
export function clearDataCache() { dataCache.invalidate(); }
export function invalidateData(resource: string) {
  dataCache.invalidate('/api/data/' + encodeURIComponent(resource));
  window.dispatchEvent(new CustomEvent(changed, { detail: resource }));
}
export async function apiFetch(url: string, options: RequestInit = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const perform = async () => {
    const headers = new Headers(options.headers);

    if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
    const response = await fetch(url, { ...options, headers, credentials: 'same-origin', cache: 'no-store' });
    if (response.status === 204) return null;
    const payload = await response.json();
    if (!response.ok) throw Object.assign(new Error(payload.error || 'Không thể tải dữ liệu.'), { status: response.status });
    return payload;
  };
  return method === 'GET' ? dataCache.get(url, perform) : perform();
}

function urlFor(reference: Reference, skip = 0) {
  const params = new URLSearchParams({ limit: '200', skip: String(skip) });
  for (const constraint of reference.constraints) {
    if (constraint.field === 'sort') {
      const [field, direction] = String(constraint.value).split(':');
      params.set('sort', field); params.set('direction', direction);
    } else params.set(constraint.field, String(constraint.value));
  }
  return `/api/data/${encodeURIComponent(reference.path)}${reference.id ? `/${encodeURIComponent(reference.id)}` : ''}?${params}`;
}
async function read(reference: Reference): Promise<Row[] | Row | null> {
  if (reference.id) {
    try { return (await apiFetch(urlFor(reference))).data; }
    catch (error) { if ((error as { status?: number }).status === 404) return null; throw error; }
  }
  const rows: Row[] = [];
  const explicitLimit = reference.constraints.some(item => item.field === 'limit');
  for (let skip = 0; ; skip += 200) {
    const page = (await apiFetch(urlFor(reference, skip))).data as Row[];
    rows.push(...page);
    if (explicitLimit || page.length < 200) return rows;
  }
}
export async function getDocs(reference: Reference) {
  const rows = await read(reference) as Row[];
  return { empty: rows.length === 0, docs: rows.map(row => ({ id: row.id, data: () => row })) };
}
export async function setDoc(reference: Reference, data: unknown, options?: { merge?: boolean }) {
  await apiFetch(urlFor(reference), { method: options?.merge ? 'PATCH' : 'PUT', body: JSON.stringify(data) });
  invalidateData(reference.path);
  if (reference.path === 'orders') invalidateData('cakes');
}
export async function deleteDoc(reference: Reference) {
  await apiFetch(urlFor(reference), { method: 'DELETE' });
  invalidateData(reference.path);
}
function useData<T>(reference: Reference | null | undefined, initialData?: T) {
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [isLoading, setLoading] = useState(!!reference && initialData === undefined);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const key = JSON.stringify(reference);
  useEffect(() => {
    let active = true;
    let generation = 0;
    let lastFetched = 0;
    const ref = key ? JSON.parse(key) as Reference | null : null;
    setData(initialData ?? null); setError(null); setLoading(!!ref && initialData === undefined);
    if (!ref) return;
    const refresh = async () => {
      const request = ++generation;
      try {
        const result = await read(ref);
        if (active && request === generation) {
          setData(result as T);
          setError(null);
          lastFetched = Date.now();
        }
      } catch (error) {
        if (active && request === generation) {
          setError(error as Error);
          toast({ variant: 'destructive', title: 'Không thể tải dữ liệu', description: (error as Error).message });
        }
      } finally { if (active && request === generation) setLoading(false); }
    };
    if (initialData === undefined) void refresh();
    const onChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail === ref.path) void refresh();
    };
    const onAuth = () => {
      // Khi auth thay doi, refresh ngam du lieu ma khong xoa data cu tranh giat lag man hinh
      if (!publicResources.has(ref.path)) void refresh();
    };
    const onFocus = () => {
      // Throttle onFocus: chi refresh neu da qua it nhat 60s ke tu lan fetch truoc
      if (document.visibilityState === 'visible' && Date.now() - lastFetched > 60_000) {
        void refresh();
      }
    };
    window.addEventListener(changed, onChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('vibary:auth-changed', onAuth);
    return () => { active = false; window.removeEventListener(changed, onChange); window.removeEventListener('focus', onFocus); window.removeEventListener('vibary:auth-changed', onAuth); };
  }, [key, initialData, toast]);
  return { data, isLoading, error };
}
export const useCollection = <T,>(reference: Reference | null | undefined, initialData?: (T & { id: string })[]) => useData<(T & { id: string })[]>(reference, initialData);
export const useDoc = <T,>(reference: Reference | null | undefined) => useData<T & { id: string }>(reference);
