"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Heart, Package, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const navItems = [
    { name: 'Home',     href: '/',         icon: Home,    badge: 0 },
    { name: 'Wishlist', href: '/wishlist',  icon: Heart,   badge: wishlistCount },
    { name: 'Orders',   href: '/orders',    icon: Package, badge: 0 },
    { name: 'Account',  href: '/account',   icon: User,    badge: 0 },
  ];

  return (
    <div className="fixed z-50 transition-all duration-500
      bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md
      md:bottom-0 md:left-0 md:translate-x-0 md:w-full md:max-w-none md:bg-white/90 md:dark:bg-gray-900/90 md:backdrop-blur-xl md:border-t md:border-gray-200 md:dark:border-white/5 md:shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="absolute -top-16 right-0 md:right-6 lg:right-10"
          >
            <Link
              href="/cart"
              className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-[0_12px_24px_-8px_var(--color-primary-glow)] border border-white/20 relative"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 border-2 border-white">
                {cartCount}
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Nav Bar */}
      <nav className="transition-all duration-300
        glass rounded-[2rem] px-4 py-3 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
        md:rounded-none md:shadow-none md:bg-transparent md:border-none md:px-0 md:py-0">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <ul className="flex justify-between items-center relative md:h-20">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <li key={item.name} className="relative z-10 flex-1">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center py-1 group transition-all duration-300 md:hover:bg-emerald-500/5 md:dark:hover:bg-emerald-500/10 md:rounded-2xl"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`
                      relative p-2 rounded-xl transition-colors duration-300
                      ${isActive ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon
                      className="w-6 h-6 relative z-10"
                      strokeWidth={isActive ? 2.5 : 2}
                      fill={isActive && item.name === 'Wishlist' ? 'currentColor' : 'none'}
                    />
                    {item.badge > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900" />
                    )}
                  </motion.div>
                  <span className={`
                    text-[10px] font-bold mt-1 tracking-wider transition-colors duration-300
                    ${isActive ? 'text-emerald-600 dark:text-emerald-400 opacity-100' : 'text-gray-400 dark:text-gray-500 opacity-60'}
                  `}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        </div>
      </nav>
    </div>
  );
}
