"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Home, Heart, Package, User } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { wishlist } = useWishlist();

  const wishlistCount = wishlist.length;

  const navItems = [
    { name: 'Home',     href: '/',         icon: Home,    badge: 0 },
    { name: 'Wishlist', href: '/wishlist',  icon: Heart,   badge: wishlistCount },
    { name: 'Orders',   href: '/orders',    icon: Package, badge: 0 },
    { name: 'Account',  href: '/account',   icon: User,    badge: 0 },
  ];

  return (
    <div className="fixed z-50 transition-all duration-500 bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md md:bottom-0 md:left-0 md:translate-x-0 md:w-full md:max-w-none md:bg-white/90 md:dark:bg-gray-900/90 md:backdrop-blur-xl md:border-t md:border-gray-200 md:dark:border-white/5 md:shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      {/* Main Nav Bar */}
      <nav className="transition-all duration-300 glass rounded-[2rem] px-4 py-3 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] md:rounded-none md:shadow-none md:bg-transparent md:border-none md:px-0 md:py-0">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <ul className="flex justify-between items-center relative md:h-14">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <li key={item.name} className="relative z-10 flex-1">
                  <Link
                    href={item.href}
                    className="flex flex-col items-center justify-center py-1 group transition-all duration-300 md:hover:bg-emerald-500/5 md:dark:hover:bg-emerald-500/10 md:rounded-2xl"
                  >
                    <m.div
                      whileTap={{ scale: 0.85 }}
                      className={`
                        relative p-2 rounded-xl transition-colors duration-300
                        ${isActive ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}
                      `}
                    >
                      {isActive && (
                        <m.div
                          layoutId="nav-active-bg"
                          className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl"
                          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        />
                      )}
                      <m.div
                        animate={{ scale: isActive ? 1.1 : 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <item.icon
                          className="w-6 h-6 relative z-10"
                          strokeWidth={isActive ? 2.5 : 2}
                          fill={isActive && item.name === 'Wishlist' ? 'currentColor' : 'none'}
                        />
                      </m.div>
                      <AnimatePresence>
                        {item.badge > 0 && (
                          <m.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900" 
                          />
                        )}
                      </AnimatePresence>
                    </m.div>
                    <m.span 
                      animate={{ 
                        opacity: isActive ? 1 : 0.6,
                        scale: isActive ? 1.05 : 1
                      }}
                      className={`
                        text-xs font-bold mt-1 tracking-wider transition-colors duration-300
                        ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}
                      `}
                    >
                      {item.name}
                    </m.span>
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