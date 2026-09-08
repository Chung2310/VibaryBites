'use client';
import { apiFetch } from '@/lib/data-client';

// Match the first page requested by each screen. Do not preload whole collections.
const resources: Record<string, [string, string?][]> = {
  '/admin': [['orders', 'orderDate:desc'], ['ingredients']],
  '/admin/orders': [['orders', 'orderDate:desc']],
  '/admin/products': [['cakes'], ['categories']],
  '/admin/categories': [['categories']],
  '/admin/inventory': [['ingredients']],
  '/admin/customers': [['customers']],
  '/admin/news': [['news_articles']],
  '/admin/attributes': [['cakes']],
  '/admin/recipes': [['cakes', 'name:asc']],
  '/admin/birthday-sizes': [['birthday_cake_sizes', 'order:asc']],
};
export function prefetchAdminData(href: string) {
  for (const [resource, sort] of resources[href] || []) {
    const params = new URLSearchParams({ limit: '200', skip: '0' });
    if (sort) {
      const [field, direction] = sort.split(':');
      params.set('sort', field);
      params.set('direction', direction);
    }
    // apiFetch shares in-flight requests and expires entries after 15 seconds.
    void apiFetch('/api/data/' + resource + '?' + params).catch(() => {});
  }
}
