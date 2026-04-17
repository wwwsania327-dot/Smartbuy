"use client";

import { useWishlist, WishlistProduct } from "@/context/WishlistContext";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, loading } = useWishlist();

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Loading Wishlist...</div>;
  }

  const isEmpty = wishlist.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-foreground)] flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" /> My Wishlist
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved for later.
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            You haven't added any products to your wishlist yet. Discover new favorites and save them for later!
          </p>
          <Link
            href="/products"
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product: WishlistProduct) => {
              const image = product.images && product.images.length > 0 ? product.images[0].url : "";
              const saving = product.discountPrice && product.discountPrice > 0 ? product.price - product.discountPrice : 0;
              const finalPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

              return (
                <div key={product._id || (product as any).id} className="relative group bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden hover-lift flex flex-col shadow-sm hover:shadow-xl transition-all">
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full z-20 bg-white/80 backdrop-blur shadow hover:bg-rose-50 text-gray-500 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link href={`/product/${product._id || (product as any).id}`} className="block flex-grow flex flex-col">
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4">
                      {image ? (
                        <Image src={image} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl select-none">🛒</div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="font-bold text-[var(--color-foreground)] line-clamp-2 leading-snug mb-1">{product.name}</h3>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-3">{product.category?.name || "Product"}</span>
                      
                      <div className="mt-auto">
                        <div className="flex items-end gap-2">
                          <span className="text-xl font-extrabold text-[var(--color-primary)]">₹{finalPrice.toFixed(2)}</span>
                          {saving > 0 && (
                            <span className="text-sm font-semibold text-gray-400 line-through mb-0.5">₹{product.price.toFixed(2)}</span>
                          )}
                        </div>
                        {saving > 0 && <span className="text-xs font-bold text-green-500 mt-1 block">You Save ₹{saving.toFixed(2)}!</span>}
                      </div>
                    </div>
                  </Link>

                  {/* Add to Cart Overlay (Optional enhancement) */}
                  <div className="p-4 border-t border-[var(--color-border)]">
                    <button className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-[var(--color-primary)] hover:text-white dark:hover:bg-[var(--color-primary)] text-[var(--color-foreground)] font-bold py-2 rounded-xl transition-colors">
                      Quick View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center border-t border-[var(--color-border)] pt-8">
            <button
              onClick={() => wishlist.forEach((p) => toggleWishlist(p))}
              className="flex items-center gap-2 text-rose-500 font-bold hover:bg-rose-50 px-6 py-3 rounded-full transition-colors border border-transparent hover:border-rose-200"
            >
              <Trash2 className="w-5 h-5" /> Clear Wishlist
            </button>
          </div>
        </>
      )}
    </div>
  );
}
