"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, Heart, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { wishlist } = useWishlist();
  const { cart, toggleCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search)}`);
    }
  };

  const cartCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md px-4 py-2 flex items-center justify-between">

      {/* Logo */}
      <Link href="/" className="font-bold text-lg">
        SmartBuy
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
        <Search className="w-4 h-4" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm"
        />
      </form>

      {/* Right */}
      <div className="flex items-center gap-3">

        <ThemeToggle />

        <Link href="/wishlist" className="relative">
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 rounded-full">
              {wishlist.length}
            </span>
          )}
        </Link>

        <button onClick={toggleCart} className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-orange-500 text-white px-1 rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        <Link href="/account">
          <User className="w-5 h-5" />
        </Link>

        <Menu className="w-5 h-5 md:hidden" />
      </div>

      <CartDrawer />
    </nav>
  );
}