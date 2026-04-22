"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Loader2 } from 'lucide-react';
import { m } from 'framer-motion';

export interface ProductData {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string | { name: string };
  rating?: number;
  reviews?: number;
  stock?: number;
}

interface ProductCardProps {
  product: ProductData;
  onAddToCart: (product: ProductData) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const inStock = product.stock !== undefined ? product.stock > 0 : true;

  // Calculate discount
  let discountPercentage = 0;
  if (product.originalPrice && product.originalPrice > product.price) {
    discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  const productId = String(product.id || (product as any)._id || 'unknown');
  
  // Robust image recovery
  const resolvedImage = product.image 
    || (product as any).images?.[0]?.url 
    || '/placeholder-product.png';

  console.log(`[ProductCard] Rendering for name="${product.name}" id="${productId}" image="${resolvedImage}"`);

  return (
    <Link href={`/product/${productId}`} className="group flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 relative w-full h-full block">
      
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-2 left-0 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-r-full z-10 shadow-sm flex items-center">
          {discountPercentage}% OFF
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full pt-[100%] overflow-hidden bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        <Image
          src={resolvedImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        {product.category && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            {typeof product.category === 'object' ? (product.category as any)?.name : product.category}
          </span>
        )}
        
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating Block */}
        {(product.rating !== undefined) && (
          <div className="flex items-center gap-1 mb-2 mt-1">
            <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold gap-1">
              {product.rating} <Star className="w-3 h-3 fill-white" />
            </div>
            {product.reviews !== undefined && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({product.reviews})
              </span>
            )}
          </div>
        )}

        {/* Stock Status */}
        <div className={`text-xs font-bold mb-2 ${inStock ? 'text-green-600' : 'text-red-600'}`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </div>

        <div className="mt-auto pt-2">
          {/* Price Section */}
          <div className="flex items-end gap-2 mb-4">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-50">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through mb-1">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Flipkart style Add to Cart Button */}
          <m.button 
            whileTap={{ scale: 0.98 }}
            onClick={async (e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              if (isAdding) return;
              setIsAdding(true);
              await onAddToCart(product);
              // Simulated feedback delay
              setTimeout(() => setIsAdding(false), 600);
            }}
            disabled={!inStock || isAdding}
            className={`w-full font-bold py-2.5 px-4 rounded shadow-sm flex items-center justify-center gap-2 uppercase tracking-wide text-sm transition-all
              ${inStock 
                ? "bg-[#ff9f00] hover:bg-[#f39800] text-white focus:ring-2 focus:ring-offset-2 focus:ring-[#ff9f00] dark:focus:ring-offset-gray-800" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"}
            `}
          >
            {isAdding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5 fill-current" />
            )}
            {inStock ? (isAdding ? "Adding..." : "Add to Cart") : "Out of Stock"}
          </m.button>
        </div>
      </div>
    </Link>
  );
}
