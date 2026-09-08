import type { Order } from './types';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
});
export function shopDateKey(value: string | Date) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const parts = dateFormatter.formatToParts(date);
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}
export function summarizeOrders(orders: Order[], now = new Date()) {
  const today = shopDateKey(now);
  const month = today.slice(0, 7);
  let orderValueToday = 0;
  let newOrders = 0;
  let processingOrders = 0;
  const products = new Map<string, { id: string; name: string; sold: number }>();
  for (const order of orders) {
    const date = shopDateKey(order.orderDate);
    if (date === today && order.orderStatus !== 'cancelled') orderValueToday += order.totalAmount;
    if (order.orderStatus === 'new') newOrders++;
    if (order.orderStatus === 'processing') processingOrders++;
    if (order.orderStatus === 'completed' && date.startsWith(month)) {
      for (const item of order.items || []) {
        const product = products.get(item.id) || { id: item.id, name: item.name, sold: 0 };
        product.sold += item.quantity;
        products.set(item.id, product);
      }
    }
  }
  return {
    orderValueToday, newOrders, processingOrders,
    topProducts: [...products.values()].sort((a, b) => b.sold - a.sold).slice(0, 5),
    recentOrders: [...orders].sort((a, b) => (Date.parse(b.orderDate) || 0) - (Date.parse(a.orderDate) || 0)).slice(0, 5),
  };
}
