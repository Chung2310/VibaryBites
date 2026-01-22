

export type RecipeItem = {
  ingredientId: string;
  quantity: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  description: string;
  detailedDescription: {
    flavor: string;
    ingredients: string;
    serving: string;
    storage: string;
    dimensions: string;
    accessories: string[];
  };
  price: number;
  sizes?: {
    name: string;
    price: number;
  }[];
  imageUrls: string[]; // Changed from imageUrl: string to support multiple images
  collection: string;
  categorySlug: string;
  flavorProfile?: string[];
  structure?: string[];
  recipe?: RecipeItem[];
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageId: string;
};

// This is a legacy type, prefer NewsArticle
export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageId: string;
  content: string;
};

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publicationDate: string;
  category: string;
  imageUrl: string;
}

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type NavLink = {
  href: string;
  label: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string; // Will use the first image from product.imageUrls
  slug: string;
  size?: string;
};

// Admin Types
export type OrderStatus = "new" | "processing" | "shipping" | "completed" | "cancelled";

export type Order = {
  id: string;
  customerName: string;
  customerAvatar: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
};

export type Ingredient = {
    id: string;
    name: string;
    stock: number;
    unit: 'g' | 'kg' | 'ml' | 'l' | 'units';
    parLevel: number;
};

export type ProductCategory = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
}
    

