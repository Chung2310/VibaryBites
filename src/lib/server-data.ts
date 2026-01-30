'use server';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, query, where, limit, orderBy, getDocs, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { Product, NewsArticle, ProductCategory } from '@/lib/types';

let app: FirebaseApp;
let db: Firestore;

if (!getApps().length) {  
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
db = getFirestore(app);


export async function getProducts(options: { categorySlug?: string; limit?: number } = {}): Promise<Product[]> {
    const productsRef = collection(db, 'cakes');
    
    const constraints = [];
    if (options.categorySlug) {
        constraints.push(where('categorySlug', '==', options.categorySlug));
    }
    if (options.limit) {
        constraints.push(limit(options.limit));
    }

    const q = query(productsRef, ...constraints);

    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getNewsArticles(options: { limit?: number; orderBy?: string; order?: 'asc' | 'desc' } = {}): Promise<NewsArticle[]> {
    const articlesRef = collection(db, 'news_articles');

    const constraints = [];
    if (options.orderBy && options.order) {
        constraints.push(orderBy(options.orderBy, options.order));
    }
    if (options.limit) {
        constraints.push(limit(options.limit));
    }
    
    const q = query(articlesRef, ...constraints);
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
}

export async function getCategories(): Promise<ProductCategory[]> {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductCategory));
}
