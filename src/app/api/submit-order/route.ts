import { NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import { getDb, getMongoClient, type StoreDocument } from '@/lib/backend/mongodb';
import { apiError, HttpError, readJson } from '@/lib/backend/http';
import { checkoutSchema } from '@/lib/backend/schemas';
import type { Product, BirthdayCakeSize, CartItem } from '@/lib/types';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const input = checkoutSchema.parse(await readJson(request));
    const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const db = await getDb();
    const client = await getMongoClient();
    const result = await client.withSession(session => session.withTransaction(async () => {
      const orders = db.collection<StoreDocument>('orders');
      const previous = await orders.findOne({ _id: input.idempotencyKey }, { session });
      if (previous) {
        if (previous.fingerprint !== fingerprint) throw new HttpError(409, 'Mã yêu cầu đã được sử dụng. Vui lòng tải lại trang.');
        return { orderId: previous._id, totalAmount: previous.totalAmount };
      }
      const products = db.collection<Product & { _id: string }>('cakes');
      const birthdaySizes = await db.collection<BirthdayCakeSize>('birthday_cake_sizes').find({}, { session }).toArray();
      const items: CartItem[] = [];
      // Sequential conditional updates inside the transaction prevent overselling,
      // including duplicate cart rows and competing checkout requests.
      for (const item of input.items) {
        const product = await products.findOne({ _id: item.id }, { session });
        if (!product) throw new HttpError(400, 'Sản phẩm không còn tồn tại.');
        const sizes = product.categorySlug === 'banh-sinh-nhat' ? birthdaySizes : product.sizes || [];
        const size = sizes.find(size => size.name === item.size);
        if ((sizes.length > 0 && !size) || (item.size && !size)) throw new HttpError(400, 'Vui lòng chọn cỡ bánh hợp lệ.');
        const price = size ? size.price : product.price;
        if (!Number.isFinite(price) || price <= 0) throw new HttpError(400, 'Sản phẩm cần liên hệ để báo giá.');
        const updated = await products.updateOne({ _id: item.id, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { session });
        if (!updated.modifiedCount) throw new HttpError(409, `${product.name} không đủ hàng.`);
        items.push({ id: item.id, name: product.name, slug: product.slug, imageUrl: product.imageUrl, price, quantity: item.quantity, ...(size ? { size: size.name } : {}) });
      }
      const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
      const customerId = randomUUID();
      // Each order gets its own contact snapshot; guest submissions cannot overwrite another customer's profile.
      const customer = { firstName: input.customerName, lastName: '', email: '', phoneNumber: input.phone, address: input.address };
      await db.collection<StoreDocument>('customers').insertOne({ _id: customerId, ...customer }, { session });
      await orders.insertOne({
        _id: input.idempotencyKey, fingerprint, customerId, customer: { id: customerId, ...customer },
        orderDate: new Date().toISOString(), deliveryAddress: input.address, deliveryDate: '',
        paymentMethod: 'cod', totalAmount, orderStatus: 'new', notes: input.notes, items,
      }, { session });
      return { orderId: input.idempotencyKey, totalAmount };
    }));
    return NextResponse.json({ result: 'success', ...result }, { status: 201 });
  } catch (error) { return apiError(error); }
}
