"use client";

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, Heart } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { wishlist } = useWishlist();
  const { cart, toggleCart } = useCart();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  
  const cartItemCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <nav className="glass sticky top-0 z-50 w-full border-b border-[var(--color-border)] shadow-premium transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-[0_8px_16px_-4px_var(--color-primary-glow)] group-hover:scale-110 transition-transform duration-300">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-300">
                  Smart<span className="text-[var(--color-foreground)]">Buy</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mt-0.5">
                  Organic & Fresh
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Hidden on Mobile */}
          <div className="hidden md:flex flex-1 items-center justify-center px-12">
            <div className="w-full max-w-xl relative group">
              <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full blur-[20px] opacity-0 group-focus-within:opacity-10 transition-opacity duration-500" />
              <input 
                type="text" 
                placeholder="Search for fresh groceries..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--color-card)] border border-[var(--color-border)] text-sm rounded-full pl-5 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm group-hover:shadow-md relative z-10"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[var(--color-primary)] p-1.5 rounded-full text-white shadow-lg shadow-green-500/20">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {isAdmin && (
              <Link 
                href="/admin" 
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
              >
                <span>👑</span>
                <span>Admin</span>
              </Link>
            )}


            <Link href="/wishlist" className="p-2.5 rounded-xl text-[var(--color-foreground)] hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-all duration-200 relative">
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button 
              onClick={toggleCart} 
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95 group font-bold"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-orange-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-emerald-600 shadow-md">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-sm">₹{cart.reduce((s: number, i: any) => s + (i.product as any).price * i.quantity, 0).toFixed(0)}</span>
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg text-[var(--color-foreground)]">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      <CartDrawer />
    </nav>
  );
}
