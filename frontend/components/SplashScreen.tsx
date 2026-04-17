"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if we've already shown the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('hasSeenSplash', 'true');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#f8fafc] dark:bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1, 
              ease: "easeOut",
            }}
            className="flex flex-col items-center justify-center gap-6"
          >
            <motion.div 
              initial={{ rotate: -15 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.6 }}
              className="w-24 h-24 rounded-3xl bg-[var(--color-primary)] flex items-center justify-center text-white font-extrabold text-6xl shadow-2xl shadow-[var(--color-primary)]/40"
            >
              S
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-extrabold text-5xl md:text-6xl tracking-tight text-[var(--color-primary)]"
            >
              Smart<span className="text-[var(--color-foreground)]">Buy</span>
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              className="h-1.5 bg-[var(--color-primary)] rounded-full mt-4 max-w-[150px]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
