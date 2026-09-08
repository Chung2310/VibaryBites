import { getDb, getMongoClient, type StoreDocument } from './mongodb';
import { HttpError } from './http';
import type { OrderStatus, CartItem } from '@/lib/types';
const transitions: Record<OrderStatus, OrderStatus[]> = {
  new: ['processing', 'cancelled'], processing: ['shipping', 'cancelled'],
  shipping: ['completed'], completed: [], cancelled: [],
};
export async function changeOrderStatus(id: string, status: OrderStatus) {
  const db = await getDb();
  return (await getMongoClient()).withSession(session => session.withTransaction(async () => {
    const orders = db.collection<StoreDocument>('orders');
    const order = await orders.findOne({ _id: id }, { session });
    if (!order) throw new HttpError(404, 'Không tìm thấy đơn hàng.');
    if (order.orderStatus === status) return;
    if (!transitions[order.orderStatus as OrderStatus]?.includes(status)) throw new HttpError(409, 'Không thể chuyển trạng thái đơn hàng.');
    if (status === 'cancelled') {
      for (const item of (order.items || []) as CartItem[]) {
        await db.collection<StoreDocument>('cakes').updateOne({ _id: item.id }, { $inc: { stock: item.quantity } }, { session });
      }
    }
    await orders.updateOne({ _id: id }, { $set: { orderStatus: status } }, { session });
  }));
}
