"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Sparkles, ArrowRight } from 'lucide-react';
import { getApplicableCoupon } from '@/lib/api';

/**
 * DynamicBanner - Shown when a valid coupon is fetched
 */
const DynamicBanner = ({ code, discount, type }: { code: string; discount: number; type: string }) => (
  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 group">
    <div className="relative z-10 max-w-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Exclusive Offer
        </span>
      </div>
      <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
        Use code <span className="text-yellow-300">{code}</span> and get {discount}{type === 'percentage' ? '%' : '₹'} OFF
      </h2>
      <p className="text-white/80 text-lg mb-8 font-medium">
        Limited time offer! Grab your favorites before they're gone.
      </p>
      <Link href="/products" className="bg-white text-indigo-600 px-8 py-3.5 rounded-full font-bold inline-flex items-center gap-2 hover:bg-gray-50 transition-all shadow-lg active:scale-95 group-hover:pr-10 relative">
        Shop Now <ArrowRight className="w-5 h-5 absolute right-4 opacity-0 group-hover:opacity-100 transition-all" />
      </Link>
    </div>
    <div className="text-9xl mt-8 md:mt-0 relative z-10 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:rotate-12 duration-700 select-none">
      <Ticket className="w-32 h-32 md:w-48 md:h-48" />
    </div>
    
    {/* Decorative Elements */}
    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/5 to-transparent pointer-events-none"></div>
  </div>
);

/**
 * DefaultBanner - Fallback UI
 */
const DefaultBanner = () => (
  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden group">
    <div className="relative z-10 max-w-xl">
      <h2 className="text-3xl md:text-5xl font-bold mb-4">Special offers available 🎉</h2>
      <p className="text-white/80 text-lg mb-8">
        Check out our latest deals and save big on your daily essentials.
      </p>
      <Link href="/products" className="bg-white text-emerald-600 px-8 py-3.5 rounded-full font-bold inline-flex items-center gap-2 hover:bg-gray-50 transition-all shadow-lg active:scale-95">
        Explore Offers <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
    <div className="text-8xl mt-8 md:mt-0 relative z-10 animate-bounce cursor-default select-none group-hover:scale-110 transition-transform">
      🎁
    </div>
    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/5 rounded-full blur-2xl"></div>
  </div>
);

/**
 * Main CouponBanner Component
 */
export default function CouponBanner() {
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCoupon() {
      try {
        setLoading(true);
        const data = await getApplicableCoupon();
        if (data && data.code) {
          setCoupon(data);
        } else {
          setCoupon(null);
        }
      } catch (err) {
        console.error("[CouponBanner] Fetch error:", err);
        setError(true);
        setCoupon(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCoupon();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <Ticket className="w-10 h-10 text-gray-300 dark:text-gray-600 animate-bounce" />
            <p className="text-gray-400 dark:text-gray-500 font-medium">Checking for special offers...</p>
        </div>
      </div>
    );
  }

  // CASE 1: Coupon exists
  if (coupon && !error) {
    return <DynamicBanner code={coupon.code} discount={coupon.discount} type={coupon.type} />;
  }

  // CASE 2 & 3: API fails or no coupon
  return <DefaultBanner />;
}
