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
    <div className="fixed z-50 transition-all duration-500 md:hidden
      bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="absolute -top-16 right-4 md:right-6 lg:right-10"
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
      <nav className="transition-all duration-300 h-[60px] py-[6px] md:h-20 md:py-0">
        <div className="max-w-7xl mx-auto px-2 md:px-12 h-full">
          <ul className="flex justify-between items-center relative h-full">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <li key={item.name} className="relative z-10 flex-1 h-full">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center h-full w-full group transition-all duration-300 md:hover:bg-emerald-500/5 md:dark:hover:bg-emerald-500/10 md:rounded-2xl"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`
                      relative p-1 rounded-[10px] transition-colors duration-300 flex items-center justify-center
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
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900" />
                    )}
                  </motion.div>
                  <span className={`
                    text-[10px] font-bold mt-0.5 tracking-wider transition-colors duration-300 leading-tight
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
