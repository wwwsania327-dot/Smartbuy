"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Home, Heart, Package, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const cartCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const navItems = [
    { name: 'Home', href: '/', icon: Home, badge: 0 },
    { name: 'Wishlist', href: '/wishlist', icon: Heart, badge: wishlistCount },
    { name: 'Orders', href: '/orders', icon: Package, badge: 0 },
    { name: 'Account', href: '/account', icon: User, badge: 0 },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 md:bottom-0 md:left-0 md:translate-x-0 md:w-full">

      <AnimatePresence>
        {cartCount > 0 && (
          <m.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="absolute -top-16 right-4"
          >
            <Link href="/cart" className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 rounded-full">
                {cartCount}
              </span>
            </Link>
          </m.div>
        )}
      </AnimatePresence>

      <nav className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-2 shadow-lg">
        <ul className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <li key={item.name} className="flex-1 text-center">
                <Link href={item.href} className="flex flex-col items-center">

                  <m.div
                    whileTap={{ scale: 0.9 }}
                    className={`relative p-2 ${isActive ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <item.icon className="w-6 h-6" />

                    {item.badge > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </m.div>

                  <span className={`text-xs ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.name}
                  </span>

                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}