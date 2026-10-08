import { config } from 'dotenv';
import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { MongoClient } from 'mongodb';
import { getMongoConfig } from '../src/lib/backend/mongodb-config';
import { resourceSchemas } from '../src/lib/backend/schemas';

config({ path: '.env' });

const sourceRoot = path.resolve('Danh mục các loại bánh');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function slugify(value: string) {
  return value
    .toLocaleLowerCase('vi')
    .replaceAll('đ', 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function shortHash(value: string) {
  return createHash('sha1').update(value).digest('hex').slice(0, 12);
}

async function getExistingCatalogImages() {
  const images = new Map<string, string>();
  let nextCursor: string | undefined;
  do {
    const response = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      prefix: 'vibary/catalog/',
      max_results: 500,
      next_cursor: nextCursor,
    });
    for (const resource of response.resources || []) {
      images.set(resource.public_id, resource.secure_url);
    }
    nextCursor = response.next_cursor;
  } while (nextCursor);
  return images;
}

async function resolveCatalogImage(filePath: string, categorySlug: string, fingerprint: string, existingImages: Map<string, string>) {
  const publicId = `vibary/catalog/${categorySlug}/${fingerprint}`;
  const existingUrl = existingImages.get(publicId);
  if (existingUrl) return existingUrl;
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  }) as UploadApiResponse;
  return result.secure_url;
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }));
  return results;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const cloudinaryOnly = process.argv.includes('--cloudinary-only');
  const directoryEntries = await readdir(sourceRoot, { withFileTypes: true });
  const categoryNames = directoryEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, 'vi'));

  const categories: Array<Record<string, unknown> & { _id: string }> = [];
  const products: Array<Record<string, unknown> & { _id: string }> = [];
  const existingImages = dryRun ? new Map<string, string>() : await getExistingCatalogImages();
  if (!dryRun) console.log(`Found ${existingImages.size} existing catalog images on Cloudinary.`);
  let resolvedCount = 0;

  for (const [categoryIndex, categoryName] of categoryNames.entries()) {
    const categorySlug = slugify(categoryName);
    const categoryDirectory = path.join(sourceRoot, categoryName);
    const entries = await readdir(categoryDirectory, { withFileTypes: true });
    const imageNames = entries
      .filter(entry => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
      .map(entry => entry.name)
      .sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));

    const categoryProducts = await mapWithConcurrency(imageNames, 5, async (imageName, imageIndex) => {
      const relativeSource = `${categoryName}/${imageName}`;
      const fingerprint = shortHash(relativeSource);
      const imageUrl = dryRun
        ? `https://res.cloudinary.com/example/image/upload/vibary/catalog/${categorySlug}/${fingerprint}`
        : await resolveCatalogImage(path.join(categoryDirectory, imageName), categorySlug, fingerprint, existingImages);
      if (!dryRun) {
        resolvedCount += 1;
        if (resolvedCount % 25 === 0 || resolvedCount === 191) {
          console.log(`Resolved ${resolvedCount}/191 Cloudinary images.`);
        }
      }
      const displayNumber = String(imageIndex + 1).padStart(2, '0');
      const data = resourceSchemas.cakes.parse({
        slug: `${categorySlug}-${fingerprint}`,
        name: `Mẫu bánh ${categoryName} ${displayNumber}`,
        subtitle: categoryName,
        description: `Mẫu bánh tham khảo thuộc danh mục ${categoryName}. Vui lòng liên hệ để được tư vấn kích thước, hương vị và báo giá.`,
        detailedDescription: {
          flavor: 'Hương vị và cốt bánh được điều chỉnh theo yêu cầu khi đặt bánh.',
          ingredients: 'Nguyên liệu được xác nhận khi tư vấn và chốt đơn.',
          storage: 'Bảo quản trong ngăn mát tủ lạnh và dùng theo hướng dẫn của cửa hàng.',
          dimensions: 'Kích thước làm theo yêu cầu.',
          accessories: [],
        },
        price: 0,
        imageUrl,
        categorySlug,
        stock: 1,
      });
      return { _id: `catalog-${fingerprint}`, ...data, importSource: relativeSource };
    });
    products.push(...categoryProducts);
    const representativeImage = categoryProducts[0]?.imageUrl as string | undefined;

    const categoryData = resourceSchemas.categories.parse({
      slug: categorySlug,
      title: categoryName,
      subtitle: imageNames.length > 0 ? `${imageNames.length} mẫu bánh tham khảo` : 'Danh mục đang được cập nhật',
      description: `Các mẫu bánh dành cho ${categoryName.toLocaleLowerCase('vi')}.`,
      imageUrl: representativeImage,
      order: categoryIndex,
      source: 'cake-catalog',
    });
    categories.push({ _id: categorySlug, ...categoryData, importSource: categoryName });
  }

  if (dryRun) {
    console.log(`Dry run: ${categories.length} categories and ${products.length} products are valid.`);
    return;
  }

  if (cloudinaryOnly) {
    console.log(`${products.length} images across ${categories.length} categories are available on Cloudinary.`);
    return;
  }

  const { uri, options } = getMongoConfig();
  const client = new MongoClient(uri, options);
  try {
    await client.connect();
    const db = client.db();
    if (categories.length > 0) {
      await db.collection<Record<string, unknown> & { _id: string }>('categories').bulkWrite(categories.map(({ _id, ...data }) => ({
        updateOne: {
          filter: { slug: data.slug },
          update: { $set: data, $setOnInsert: { _id } },
          upsert: true,
        },
      })));
    }
    if (products.length > 0) {
      await db.collection<Record<string, unknown> & { _id: string }>('cakes').bulkWrite(products.map(({ _id, ...data }) => ({
        updateOne: { filter: { _id }, update: { $set: data }, upsert: true },
      })));
    }
    console.log(`Imported ${categories.length} categories and ${products.length} products.`);
  } finally {
    await client.close();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
