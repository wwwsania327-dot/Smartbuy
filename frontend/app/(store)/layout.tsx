'use client';

import { m, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MobileBottomNav from '../../components/MobileBottomNav';
import { CartProvider } from '../../context/CartContext';
import BackButton from '../../components/BackButton';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <CartProvider>
      <Navbar />
      <AnimatePresence mode="wait">
        <m.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-grow flex flex-col pb-20 mt-4"
        >
          <BackButton />
          {children}
        </m.main>
      </AnimatePresence>
      <Footer />
      <MobileBottomNav />
    </CartProvider>
  );
}
