'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { WishlistButton, ShareButton } from './ProductUtilityButtons';
import { useCart } from '../context/CartContext';
import { fetchMergedProducts, Product } from '../lib/products';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProductCardData {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discountPct: number;
  image: string;
  category: string;
  quantity: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toCardData(p: Product): ProductCardData | null {
  if (!p.originalPrice || p.originalPrice <= p.price) return null;
  const pct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  if (pct <= 0) return null;

  const catName = typeof p.category === 'object' ? (p.category as any)?.name : p.category;

  return {
    id: p.id.toString(),
    name: p.name,
    originalPrice: p.originalPrice,
    discountedPrice: p.price,
    discountPct: pct,
    image: p.image,
    category: catName || '',
    quantity: '',
  };
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-44 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200 dark:bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd }: { product: ProductCardData; onAdd: (p: ProductCardData) => void }) {
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="
        group flex-shrink-0 w-44
        rounded-2xl border border-[var(--color-border)]
        bg-[var(--color-card)] overflow-hidden
        shadow-sm hover:shadow-xl hover:shadow-black/10
        transition-all duration-300 ease-out
        hover:-translate-y-1.5
        flex flex-col
      "
    >
      {/* Image area */}
      <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
        {/* Discount badge */}
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
          {product.discountPct}% OFF
        </div>

        {/* Action Buttons */}
        <WishlistButton product={{ _id: product.id, name: product.name, price: product.originalPrice, discountPrice: product.discountedPrice, images: [{url: product.image}] }} />
        <ShareButton product={{ _id: product.id, name: product.name, price: product.originalPrice, discountPrice: product.discountedPrice, images: [{url: product.image}] }} />

        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="176px"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl select-none">
            🛒
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="flex flex-col flex-grow p-3">
        {/* Category */}
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-0.5">
          {product.category}
        </span>

        {/* Product name */}
        <h3 className="text-[13px] font-bold text-[var(--color-foreground)] leading-snug line-clamp-2 mb-0.5 group-hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>

        {/* Quantity */}
        {product.quantity && (
          <p className="text-[11px] text-gray-400 mb-2">{product.quantity}</p>
        )}

        {/* Prices + Add button */}
        <div className="mt-auto flex items-end justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 line-through leading-none">
              ₹{product.originalPrice.toFixed(0)}
            </span>
            <span className="text-base font-extrabold text-green-600 dark:text-green-400 leading-tight">
              ₹{product.discountedPrice.toFixed(0)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            aria-label="Add to cart"
            className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              font-bold text-lg border-2 transition-all duration-200
              ${added
                ? 'bg-green-500 border-green-500 text-white scale-110'
                : 'bg-[var(--color-background)] border-green-500 text-green-600 hover:bg-green-500 hover:text-white hover:scale-110'
              }
            `}
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OfferZone() {
  const { addToCart, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch discounted products
  useEffect(() => {
    async function fetchOffers() {
      try {
        const merged = await fetchMergedProducts();
        const offers = merged
          .map(toCardData)
          .filter((p): p is ProductCardData => p !== null);
        setProducts(offers);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_products' || e.key === null) fetchOffers();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Scroll helpers
  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  function handleAdd(product: ProductCardData) {
    // Use CartContext for real-time sync
    addToCart({
      id: product.id,
      name: product.name,
      price: product.originalPrice,
      discount: product.discountedPrice,
      image: product.image,
      weight: product.quantity || '',
      category: product.category,
    });
    // Open cart sidebar for immediate feedback
    setIsCartOpen(true);
  }

  // Don't render section at all if no offers and not loading
  if (!loading && !error && products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)] flex items-center gap-2">
            <Flame className="w-7 h-7 text-orange-500 animate-pulse" />
            Offer Zone
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Best deals on your favorite items
          </p>
        </div>

        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1 text-[var(--color-primary)] font-semibold text-sm hover:gap-2 transition-all duration-200"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Scroll container wrapper ── */}
      <div className="relative group/scroll">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="
            absolute left-0 top-1/2 -translate-y-1/2 z-10
            -translate-x-3 opacity-0 group-hover/scroll:opacity-100
            bg-white dark:bg-gray-800 border border-[var(--color-border)]
            shadow-lg rounded-full w-9 h-9 flex items-center justify-center
            transition-all duration-200 hover:bg-green-50 dark:hover:bg-gray-700
          "
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto
            scrollbar-hide pb-2
            scroll-smooth
          "
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : error
            ? (
              <div className="w-full py-10 text-center text-gray-400">
                Could not load offers. Please ensure the server is running.
              </div>
            )
            : products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} />
            ))
          }
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="
            absolute right-0 top-1/2 -translate-y-1/2 z-10
            translate-x-3 opacity-0 group-hover/scroll:opacity-100
            bg-white dark:bg-gray-800 border border-[var(--color-border)]
            shadow-lg rounded-full w-9 h-9 flex items-center justify-center
            transition-all duration-200 hover:bg-green-50 dark:hover:bg-gray-700
          "
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Mobile "View All" */}
      <div className="sm:hidden mt-5 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-[var(--color-primary)] font-semibold text-sm"
        >
          View All Offers <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
