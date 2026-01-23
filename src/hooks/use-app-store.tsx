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
import { useAuth, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { usePathname } from "next/navigation";

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
  const { toast } = useToast();
  const pathname = usePathname();

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
  const { data: productsData, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);

  const products = productsData || [];

  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            const storedCart = localStorage.getItem("cart");
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        } catch (e) {
            console.error("Failed to parse cart from localStorage", e);
            setCartItems([]);
        }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

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
    
    const imageUrl = item.imageUrl || (product.imageUrls && product.imageUrls[0]) || '';
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
