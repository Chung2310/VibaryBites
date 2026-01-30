"use client";

import type { CartItem } from "@/lib/types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useToast } from "./use-toast";

interface AppContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
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
  
  // Load cart from localStorage on initial client-side render
  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            const storedCart = localStorage.getItem("vibary-cart");
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem("vibary-cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);


  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    // Note: Stock checking logic is now expected to be handled in the component
    // that calls this function, before calling it.
    const quantityToAdd = item.quantity || 1;
    const itemToAdd = { ...item, quantity: quantityToAdd };

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.id === item.id && i.size === item.size
      );
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + quantityToAdd }
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
    // Note: Stock checking logic is handled in the component.
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
