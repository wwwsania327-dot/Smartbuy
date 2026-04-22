"use client";

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import ProductCard, { ProductData } from '@/components/ProductCard';
import { fetchMergedProducts, Product } from '@/lib/products';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { useProducts } from '@/hooks/useProducts';
import { SkeletonGrid } from '@/components/SkeletonLoader';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { data: products = [], isLoading, isError, refetch } = useProducts();
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [category, setCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  
  const { addToCart } = useCart();

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update searchTerm when URL search param changes (e.g. from Navbar)
  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
      setDebouncedSearch(initialSearch);
      // Optional: scroll to results if search was triggered from outside
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialSearch]);

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Failed to load products</h2>
        <p className="text-gray-600 mb-6">There was an error fetching the product list. Please try again.</p>
        <button 
          onClick={() => refetch()}
          className="px-6 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  // Compute Categories dynamically from product data (handling populated objects)
  const categoriesList = ['All', ...new Set(products.map(p => {
    if (typeof p.category === 'object' && (p.category as any)?.name) return (p.category as any).name;
    return p.category;
  }).filter(Boolean) as string[])];

  // Apply filters and sort
  let filteredProducts = products.filter((p) => {
    const pCatName = typeof p.category === 'object' ? (p.category as any)?.name : p.category;
    const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = category === 'All' || pCatName === category;
    return matchesSearch && matchesCategory;
  });

  if (sortOption === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      
      {/* Header & Sticky Filter Bar */}
      <div id="products-section" className="sticky top-16 z-30 bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-md pt-4 pb-4 border-b border-gray-200 dark:border-gray-800 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white hidden md:block">
          All Products
        </h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Category Dropdown */}
            <div className="relative w-1/2 sm:w-40 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded flex items-center px-3 text-sm focus-within:ring-2 focus-within:ring-blue-500">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-transparent outline-none h-full py-2 cursor-pointer text-gray-800 dark:text-gray-200"
              >
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 pointer-events-none absolute right-2" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-1/2 sm:w-48 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded flex items-center px-3 text-sm focus-within:ring-2 focus-within:ring-blue-500">
              <SlidersHorizontal className="w-4 h-4 text-gray-500 mr-2" />
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full appearance-none bg-transparent outline-none h-full py-2 cursor-pointer text-gray-800 dark:text-gray-200"
              >
                <option value="default">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 pointer-events-none absolute right-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <div className="text-5xl mb-4 opacity-50">📦</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">No products found</h2>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              onAddToCart={() => {
                console.log("Products List - Adding to Cart Payload:", { id: product.id, name: product.name, image: product.image });
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  discount: product.price, // API doesn't mock discount conceptually yet
                  image: product.image,
                  weight: '',
                  category: typeof product.category === 'object' ? (product.category as any)?.name : (product.category || '')
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading products...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
