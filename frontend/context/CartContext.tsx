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
  appliedCoupon: any | null;
  discountAmount: number;
  totalWithDiscount: number;
  removeCoupon: () => void;
  fetchApplicableCoupon: () => Promise<void>;
  isFetchingCoupon: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { getApplicableCoupon } from "../lib/api";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [isFetchingCoupon, setIsFetchingCoupon] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        const valid = parsed.filter(
          (item) => item?.product?.id && item?.product?.image
        );
        setCart(valid);
        if (valid.length !== parsed.length) {
          localStorage.setItem("cart", JSON.stringify(valid));
        }
      } catch (error) {
        console.error("Cart parse error", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  useEffect(() => {
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
    
    toast(`Added ${product.name} to cart!`, "success");
  };

  const removeFromCart = (productId: string | number) => {
    const itemToRemove = cart.find(i => String(i.product.id) === String(productId));
    setCart((prev) => prev.filter((item) => String(item.product.id) !== String(productId)));
    
    if (itemToRemove) {
      toast(`Removed ${itemToRemove.product.name} from cart`, "error");
    }
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
    toast("Cart cleared", "success");
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.product.discount > 0 ? item.product.discount : item.product.price;
    return total + price * item.quantity;
  }, 0);

  const fetchApplicableCoupon = async () => {
    try {
      setIsFetchingCoupon(true);
      const coupon = await getApplicableCoupon();
      if (coupon && coupon.code) {
        setAppliedCoupon(coupon);
        toast(`Coupon ${coupon.code} applied successfully 🎉`, "success");
      }
    } catch (err) {
      console.error("Failed to fetch coupon", err);
    } finally {
      setIsFetchingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast("Coupon removed", "info");
  };

  // Auto-fetch coupon on mount or when cart/user changes
  useEffect(() => {
    if (cart.length > 0 && !appliedCoupon && !isFetchingCoupon) {
      fetchApplicableCoupon();
    }
  }, [cart.length, user]);

  const discountAmount = appliedCoupon ? (
    appliedCoupon.type === 'percentage' 
      ? (cartTotal * appliedCoupon.discount) / 100 
      : appliedCoupon.discount
  ) : 0;

  // Apply max discount limit if exists
  const finalDiscount = (appliedCoupon?.maxDiscount && discountAmount > appliedCoupon.maxDiscount) 
    ? appliedCoupon.maxDiscount 
    : discountAmount;

  const totalWithDiscount = cartTotal - finalDiscount;

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        cartTotal,
        appliedCoupon,
        discountAmount: finalDiscount,
        totalWithDiscount,
        removeCoupon,
        fetchApplicableCoupon,
        isFetchingCoupon
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
