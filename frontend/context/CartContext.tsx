"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Product = {
  id: string | number;
  name: string;
  price: number;
  discount: number;
  image: string;
  weight: string;
  category: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        // Validate: Ensure product and image exist, but don't be too strict about the path format
        // to avoid purging valid items during site updates.
        const valid = parsed.filter(
          (item) => item?.product?.id && item?.product?.image
        );
        setCart(valid);
        // If we cleaned up corrupt data, save the fixed version back
        if (valid.length !== parsed.length) {
          console.log('[CartContext] Purged', parsed.length - valid.length, 'invalid cart items');
          localStorage.setItem("cart", JSON.stringify(valid));
        }
      } catch (error) {
        console.error("Cart parse error", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  useEffect(() => {
    // Always sync cart state to localStorage (including empty cart to clear it)
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => String(item.product.id) === String(product.id));
      if (existing) {
        return prev.map((item) =>
          String(item.product.id) === String(product.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string | number) => {
    setCart((prev) => prev.filter((item) => String(item.product.id) !== String(productId)));
    if (cart.length === 1) localStorage.removeItem("cart"); // Clean up if empty
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((item) =>
        String(item.product.id) === String(productId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.product.discount > 0 ? item.product.discount : item.product.price;
    return total + price * item.quantity;
  }, 0);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider
      value={{ 
        cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
        isCartOpen, setIsCartOpen, toggleCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
