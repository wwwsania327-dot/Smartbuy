"use client";

import Link from 'next/link';
import { ShoppingCart, Search, Menu, Heart } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { wishlist } = useWishlist();
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const cartItemCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const isSuperAdmin = user && user.role === 'superadmin';

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-500 border-b ${
      scrolled 
        ? 'bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur-lg shadow-lg border-[var(--color-primary)]/10 py-0' 
        : 'bg-white dark:bg-[#0b1120] border-transparent py-1'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div 
          animate={{ height: scrolled ? 52 : 56 }}
          className="flex justify-between items-center transition-all duration-300"
        >
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <m.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_4px_12px_-2px_var(--color-primary-glow)]"
              >
                S
              </m.div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-300">
                  Smart<span className="text-[var(--color-foreground)]">Buy</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mt-0.5">
                  Organic & Fresh
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Hidden on Mobile */}
          <div className="hidden md:flex flex-1 items-center justify-center px-10">
            <form onSubmit={handleSearch} className="w-full max-w-lg relative group">
              <m.div 
                initial={false}
                animate={{ scale: scrolled ? 0.98 : 1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full blur-[15px] opacity-0 group-focus-within:opacity-10 transition-opacity duration-500" />
                <input 
                  type="text" 
                  placeholder="Search for fresh groceries..." 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-[var(--color-card)] border border-[var(--color-border)] text-sm rounded-full pl-5 pr-12 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm group-hover:shadow-md relative z-10"
                />
                <m.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 bg-[var(--color-primary)] p-1.5 rounded-full text-white shadow-lg shadow-green-500/20 transition-transform"
                >
                  <Search className="w-4 h-4" />
                </m.button>
              </m.div>
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {isAdmin && (
              <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/admin" 
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-wider shadow-lg border border-white/10 ${
                    isSuperAdmin 
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-600 shadow-amber-500/20' 
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-indigo-500/20'
                  }`}
                >
                  {isSuperAdmin ? '👑 Superadmin' : '🛡️ Admin'}
                </Link>
              </m.div>
            )}


            <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link href="/wishlist" className="p-2.5 rounded-xl text-[var(--color-foreground)] hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-all duration-200 relative block">
                <Heart className="w-6 h-6" />
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <m.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
                    >
                      {wishlist.length}
                    </m.span>
                  )}
                </AnimatePresence>
              </Link>
            </m.div>

            <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/cart" 
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all duration-200 group font-bold"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  <AnimatePresence>
                    {cartItemCount > 0 && (
                      <m.span 
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 10 }}
                        className="absolute -top-3 -right-3 bg-orange-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-emerald-600 shadow-md"
                      >
                        {cartItemCount}
                      </m.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="hidden lg:block text-sm">₹{cartTotal.toFixed(2)}</span>
              </Link>
            </m.div>

            {/* Mobile Menu Button */}
            <m.button 
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2 rounded-lg text-[var(--color-foreground)]"
            >
              <Menu className="w-6 h-6" />
            </m.button>
          </div>
        </m.div>
      </div>
    </nav>
  );
}