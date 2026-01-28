"use client";

import type { CartItem, Product } from "@/lib/types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useToast } from "./use-toast";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

interface AppContextType {
  // Cart
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
  // Products
  products: Product[];
  isLoadingProducts: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
  
  // Fetch live data from Firestore
  const { data: firestoreProducts, isLoading: isLoadingFirestore } = useCollection<Product>(productsCollection);

  // Loading is true only if we have no products yet AND we're still fetching from the server.
  const isLoadingProducts = products.length === 0 && isLoadingFirestore;
  
  // Load cart and products from localStorage on initial client-side render
  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            const storedCart = localStorage.getItem("vibary-cart");
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
            const storedProducts = localStorage.getItem("vibary-products");
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            }
        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }
    }
  }, []);

  // Effect to update products state and cache in localStorage when new data arrives from Firestore.
  useEffect(() => {
    if (firestoreProducts && firestoreProducts.length > 0) {
      // Only update state and localStorage if the data has actually changed.
      if (JSON.stringify(products) !== JSON.stringify(firestoreProducts)) {
        setProducts(firestoreProducts);
        localStorage.setItem("vibary-products", JSON.stringify(firestoreProducts));
      }
    }
  }, [firestoreProducts, products]);


  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem("vibary-cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Effect to sync cart items with the products from the database/cache
  useEffect(() => {
    // This effect runs when products are loaded from cache or updated from Firestore.
    if (products.length > 0 && cartItems.length > 0) {
      const productMap = new Map(products.map(p => [p.id, p]));
      const validCartItems: CartItem[] = [];
      const removedItems: string[] = [];

      cartItems.forEach(item => {
        const productInDb = productMap.get(item.id);
        if (productInDb) {
          // Sync price, image, and slug from DB to ensure consistency
          const updatedItem = {
            ...item,
            price: productInDb.sizes?.find(s => s.name === item.size)?.price || productInDb.price,
            imageUrl: productInDb.imageUrl,
            slug: productInDb.slug
          };
          validCartItems.push(updatedItem);
        } else {
          removedItems.push(item.name);
        }
      });

      if (removedItems.length > 0) {
        setCartItems(validCartItems);
        toast({
          variant: "destructive",
          title: "Giỏ hàng đã được cập nhật",
          description: `${removedItems.length} sản phẩm không còn khả dụng và đã được tự động xóa khỏi giỏ hàng.`,
        });
      } else if (JSON.stringify(cartItems) !== JSON.stringify(validCartItems)) {
        // Update cart if other details like price changed
        setCartItems(validCartItems);
      }
    }
  }, [products, cartItems, toast]);


  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const quantityToAdd = item.quantity || 1;
    const product = products.find(p => p.id === item.id);

    if (!product || product.stock === undefined) {
      toast({
        variant: "destructive",
        title: "Không thể thêm sản phẩm",
        description: "Thông tin tồn kho của sản phẩm này không có sẵn.",
      });
      return;
    }
    
    const existingItem = cartItems.find(
      (i) => i.id === item.id && i.size === item.size
    );
    const newQuantity = (existingItem?.quantity || 0) + quantityToAdd;

    if (product.stock < newQuantity) {
      toast({
        variant: "destructive",
        title: "Số lượng tồn kho không đủ",
        description: `Rất tiếc, chỉ còn ${product.stock} sản phẩm "${product.name}" trong kho.`,
      });
      return;
    }
    
    const imageUrl = item.imageUrl || product.imageUrl || '';
    const itemToAdd = { ...item, imageUrl, quantity: quantityToAdd };

    setCartItems((prevItems) => {
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: newQuantity }
            : i
        );
      }
      return [...prevItems, itemToAdd];
    });
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${item.name} ${item.size ? `(${item.size})` : ''} (x${quantityToAdd}) đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.size === size))
    );
     toast({
      title: "Đã xóa khỏi giỏ hàng",
      description: `Sản phẩm đã được xóa khỏi giỏ hàng của bạn.`,
    });
  };

  const updateQuantity = (id: string, quantity: number, size?: string) => {
    const product = products.find(p => p.id === id);
    if (product && product.stock !== undefined && quantity > product.stock) {
      toast({
        variant: "destructive",
        title: "Số lượng tồn kho không đủ",
        description: `Chỉ còn ${product.stock} sản phẩm "${product.name}" trong kho.`,
      });
      return;
    }

    if (quantity < 1) {
      removeFromCart(id, size);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <AppContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        totalPrice,
        products,
        isLoadingProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
