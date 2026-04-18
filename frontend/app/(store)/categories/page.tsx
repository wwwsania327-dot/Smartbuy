"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CategoriesGallery() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4">
          Explore <span className="text-[var(--color-primary)]">Categories</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Browse our wide selection of fresh, high-quality groceries sourced directly for you.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No categories found. Start by adding some in the admin panel.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link href={`/category/${category.slug}`} key={category._id}>
              <div className="group relative bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[var(--color-primary)]/20 transition-all duration-300 hover:-translate-y-2 border border-[var(--color-border)] h-full flex flex-col">
                <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                  {category.image?.url ? (
                    <img 
                      src={category.image.url} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      🛒
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-6 flex-grow flex flex-col items-center text-center relative bg-white dark:bg-[#1e293b] z-10 -mt-4 rounded-t-3xl border-t border-[var(--color-border)]/50">
                  <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {category.description || 'Explore our selection of fresh and high-quality products in this category.'}
                  </p>
                  
                  <div className="mt-4 w-10 h-1 rounded-full bg-[var(--color-border)] group-hover:bg-[var(--color-primary)] transition-colors duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
