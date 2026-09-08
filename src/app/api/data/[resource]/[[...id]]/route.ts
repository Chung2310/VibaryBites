import { changeOrderStatus } from '@/lib/backend/orders';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, serialize, type StoreDocument } from '@/lib/backend/mongodb';
import { requireAdmin } from '@/lib/backend/auth';
import { apiError, HttpError, readJson } from '@/lib/backend/http';
import { idSchema, resourceName, resourceSchemas, publicResources, orderStatusSchema } from '@/lib/backend/schemas';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ resource: string; id?: string[] }> };
async function target(context: Context) {
  const params = await context.params;
  const resource = resourceName.parse(params.resource);
  if ((params.id?.length || 0) > 1) throw new HttpError(404, 'Không tìm thấy.');
  const id = params.id?.[0] ? idSchema.parse(params.id[0]) : undefined;
  return { resource, id };
}
export async function GET(request: Request, context: Context) {
  try {
    const { resource, id } = await target(context);
    if (!publicResources.has(resource)) await requireAdmin(request);
    const collection = (await getDb()).collection<StoreDocument>(resource);
    if (id) {
      const result = await collection.findOne({ _id: id });
      if (!result) throw new HttpError(404, 'Không tìm thấy.');
      return NextResponse.json({ data: serialize(result) });
    }
    const params = new URL(request.url).searchParams;
    const limit = z.coerce.number().int().min(1).max(200).parse(params.get('limit') || 100);
    const skip = z.coerce.number().int().min(0).max(1_000_000).parse(params.get('skip') || 0);
    const sort = z.enum(['name', 'order', 'publicationDate', 'orderDate', '_id']).parse(params.get('sort') || '_id');
    const direction = z.enum(['asc', 'desc']).parse(params.get('direction') || 'asc');
    const filter: Record<string, string> = {};
    for (const field of ['slug', 'categorySlug']) if (params.has(field)) filter[field] = idSchema.parse(params.get(field));
    const results = await collection.find(filter).sort({ [sort]: direction === 'asc' ? 1 : -1, ...(sort !== '_id' ? { _id: 1 as const } : {}) }).skip(skip).limit(limit).toArray();
    return NextResponse.json({ data: results.map(serialize) });
  } catch (error) { return apiError(error); }
}
async function write(request: Request, context: Context, merge: boolean) {
  try {
    await requireAdmin(request);
    const { resource, id } = await target(context);
    if (!id) throw new HttpError(400, 'Thiếu mã bản ghi.');
    const collection = (await getDb()).collection<StoreDocument>(resource);
    const input = await readJson(request);
    if (resource === 'customers') throw new HttpError(405, 'Khách hàng được tạo qua đơn hàng.');
    if (resource === 'orders') {
      if (!merge) throw new HttpError(405, 'Đơn hàng được tạo qua thanh toán.');
      const data = orderStatusSchema.parse(input);
      await changeOrderStatus(id, data.orderStatus);
      return NextResponse.json({ data: { id, ...data } });
    }
    const schema = resourceSchemas[resource];
    const existing = merge ? await collection.findOne({ _id: id }) : null;
    const partial = schema.partial().parse(input);
    const data = schema.parse(merge ? { ...existing, ...partial } : input);
    if (merge) await collection.updateOne({ _id: id }, { $set: partial }, { upsert: true });
    else await collection.replaceOne({ _id: id }, { _id: id, ...data }, { upsert: true });
    return NextResponse.json({ data: { ...data, id } });
  } catch (error) { return apiError(error); }
}
export const PUT = (request: Request, context: Context) => write(request, context, false);
export const PATCH = (request: Request, context: Context) => write(request, context, true);
export async function DELETE(request: Request, context: Context) {
  try {
    await requireAdmin(request);
    const { resource, id } = await target(context);
    if (!id) throw new HttpError(400, 'Thiếu mã bản ghi.');
    if (resource === 'orders' || resource === 'customers') throw new HttpError(405, 'Không hỗ trợ xóa đơn hàng và khách hàng.');
    const result = await (await getDb()).collection<StoreDocument>(resource).deleteOne({ _id: id });
    if (!result.deletedCount) throw new HttpError(404, 'Không tìm thấy.');
    return new NextResponse(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
