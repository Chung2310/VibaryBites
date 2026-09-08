'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { AdminUser } from './types';
type AuthState = { user: AdminUser | null; isUserLoading: boolean; userError: Error | null };
type AuthActions = { signIn: (username: string, password: string) => Promise<void>; signOut: () => Promise<void>; refresh: () => Promise<void> };
const Context = createContext<(AuthState & { auth: AuthActions }) | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isUserLoading: true, userError: null });
  const generation = useRef(0);
  const lastUserId = useRef<string | null | undefined>(undefined);
  const lastFocusCheck = useRef(0);
  const perform = useCallback(async (endpoint: string, body?: unknown) => {
    const current = ++generation.current;
    try {
      const response = await fetch('/api/auth/' + endpoint, { method: body === undefined ? 'GET' : 'POST', headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể xác thực tài khoản.');
      if (current === generation.current) {
        setState({ user: data.user, isUserLoading: false, userError: null });
        const newUserId = data.user?.id ?? null;
        if (lastUserId.current !== newUserId) {
          lastUserId.current = newUserId;
          window.dispatchEvent(new Event('vibary:auth-changed'));
        }
      }
    } catch (error) {
      if (current === generation.current) {
        setState(previous => ({ ...previous, isUserLoading: false, userError: error as Error }));
        if (lastUserId.current !== null) {
          lastUserId.current = null;
          window.dispatchEvent(new Event('vibary:auth-changed'));
        }
      }
      throw error;
    }
  }, []);
  const refresh = useCallback(() => perform('session'), [perform]);
  const signIn = useCallback((username: string, password: string) => perform('login', { username, password }), [perform]);
  const signOut = useCallback(() => perform('logout', {}), [perform]);
  useEffect(() => {
    void refresh().catch(() => {});
    const onFocus = () => {
      const now = Date.now();
      if (now - lastFocusCheck.current > 60_000) {
        lastFocusCheck.current = now;
        void refresh().catch(() => {});
      }
    };
    window.addEventListener('focus', onFocus);
    return () => { ++generation.current; window.removeEventListener('focus', onFocus); };
  }, [refresh]);
  return <Context.Provider value={{ ...state, auth: { signIn, signOut, refresh } }}>{children}</Context.Provider>;
}
function useAuthState() {
  const value = useContext(Context);
  if (!value) throw new Error('Admin authentication requires AuthProvider');
  return value;
}
export const useAuth = () => useAuthState().auth;
export const useUser = () => {
  const { user, isUserLoading, userError } = useAuthState();
  return { user, isUserLoading, userError };
};
