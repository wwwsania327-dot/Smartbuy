"use client";

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import ProductCard, { ProductData } from '@/components/ProductCard';
import { fetchMergedProducts, Product } from '@/lib/products';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const merged = await fetchMergedProducts();
        // Cast to ProductData — Product is a strict superset
        setProducts(merged as unknown as ProductData[]);
      } catch (err) {
        console.error('[ProductsPage] load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    // Re-fetch whenever admin panel saves/deletes a product
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_products' || e.key === null) load();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Compute Categories dynamically from product data (handling populated objects)
  const categoriesList = ['All', ...new Set(products.map(p => {
    if (typeof p.category === 'object' && (p.category as any)?.name) return (p.category as any).name;
    return p.category;
  }).filter(Boolean) as string[])];

  // Apply filters and sort
  let filteredProducts = products.filter((p) => {
    const pCatName = typeof p.category === 'object' ? (p.category as any)?.name : p.category;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-md pt-4 pb-4 border-b border-gray-200 dark:border-gray-800 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center w-full">
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
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-4 animate-pulse flex flex-col h-full">
              <div className="w-full pt-[100%] bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="mt-auto h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
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
                  category: product.category || ''
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
