"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

// Generalized Product interface that works for UI
export type WishlistProduct = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: { url: string; public_id?: string }[];
  category?: any;
  discount?: number;
};

type WishlistContextType = {
  wishlist: WishlistProduct[];
  toggleWishlist: (product: WishlistProduct) => void;
  isWishlisted: (productId: string) => boolean;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load from local storage initially
  useEffect(() => {
    const saved = localStorage.getItem("smartbuy_wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  // Sync with DB if user logs in
  useEffect(() => {
    if (user?._id) {
      syncWithDatabase(wishlist);
    }
  }, [user?._id]);

  const syncWithDatabase = async (currentList: WishlistProduct[]) => {
    try {
      const productIds = currentList.map(p => p._id || (p as any).id).filter(Boolean);
      const res = await fetch(`${API_BASE}/api/wishlist/${user?._id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });
      if (res.ok) {
        const fullWishlist = await res.json();
        setWishlist(fullWishlist);
        localStorage.setItem("smartbuy_wishlist", JSON.stringify(fullWishlist));
      }
    } catch (err) {
      console.log("Failed to sync wishlist (Backend might be offline)");
    }
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((p) => p._id === productId || (p as any).id === productId);
  };

  const toggleWishlist = async (product: WishlistProduct) => {
    const exists = isWishlisted(product._id);
    let updatedList;

    if (exists) {
      updatedList = wishlist.filter((p) => p._id !== product._id);
      setWishlist(updatedList);
      toast("Removed from Wishlist", "error");
      
      if (user?._id) {
        const productId = product._id || (product as any).id;
        fetch(`${API_BASE}/api/wishlist/${user._id}/remove`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }).catch(() => console.log("Failed to remove from database (Backend might be offline)"));
      }
    } else {
      updatedList = [...wishlist, product];
      setWishlist(updatedList);
      toast("Added to Wishlist", "success");

      if (user?._id) {
        const productId = product._id || (product as any).id;
        fetch(`${API_BASE}/api/wishlist/${user._id}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }).catch(() => console.log("Failed to add to database (Backend might be offline)"));
      }
    }

    localStorage.setItem("smartbuy_wishlist", JSON.stringify(updatedList));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
