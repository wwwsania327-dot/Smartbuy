"use client";

import { motion } from 'framer-motion';

export const SkeletonProductCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      <div className="relative pt-[100%] rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>
      
      <div className="space-y-3 mt-auto">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 overflow-hidden relative">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 overflow-hidden relative">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
};
