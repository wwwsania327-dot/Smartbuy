"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../../context/CartContext';
import ProductCard from '../../../../components/ProductCard';
import { normalizeProduct } from '../../../../lib/products';

import { fetchApi } from '../../../../lib/api';

export default function CategoryProducts() {
  const { slug } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetchApi(`/api/products/category/${slug}`);
        if (res.ok) {
          const data = await res.json();
          // Backend returns { products: [] }
          const rawProducts = data.products || (Array.isArray(data) ? data : []);

          
          const normalized = rawProducts.map((p: any) => normalizeProduct(p));
          
          setProducts(normalized);
          
          if (normalized.length > 0) {
            const cat = normalized[0].category;
            const name = typeof cat === 'object' ? cat?.name : cat;
            setCategoryName(name || String(slug));
          } else {
            // Failsafe format of slug if no products
            setCategoryName(String(slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
          }
        }
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProducts();
    }
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4">
          <span className="text-[var(--color-primary)]">{categoryName}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Browse our high-quality selection of products in {categoryName}.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-[#1e293b] rounded-3xl border border-[var(--color-border)]">
          <div className="text-4xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">No products found</h2>
          <p className="text-gray-500">We are currently out of stock for items in {categoryName}. Check back later!</p>
          <Link href="/categories" className="inline-block mt-6 px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium">
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={() => addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                discount: product.price,
                image: product.image,
                category: typeof product.category === 'object' ? product.category?.name : (product.category || ''),
                weight: ''
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
