"use client";

import { useCart } from "../../../context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";


// ─── Main Cart Page ───────────────────────────────────────────────────────────
export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, appliedCoupon, discountAmount, totalWithDiscount, removeCoupon, isFetchingCoupon } = useCart();
  const router = useRouter();


  const taxes  = totalWithDiscount * 0.05;
  const total  = totalWithDiscount + taxes;

  // ── Empty cart state ──────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <div className="text-8xl mb-8">🛒</div>
        <h2 className="text-3xl font-bold mb-4 text-[var(--color-foreground)]">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't added anything yet. Fresh groceries are waiting!
        </p>
        <Link
          href="/products"
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-10 text-[var(--color-foreground)]">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── Cart Items ─────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-4">
          {cart.map((item) => {
            const price = item.product.discount > 0 ? item.product.discount : item.product.price;
            return (
              <div
                key={item.product.id}
                className="flex flex-col sm:flex-row items-center gap-5 bg-[var(--color-card)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm"
              >
                {/* Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-[var(--color-border)] flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/96x96?text=img"; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-[var(--color-foreground)]">{item.product.name}</h3>
                  {item.product.weight && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.product.weight}</p>
                  )}
                  <p className="text-[var(--color-primary)] font-bold mt-1">
                    ₹{price.toFixed(2)}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-[var(--color-border)] overflow-hidden bg-[var(--color-background)]">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Order Summary ───────────────────────────────────────────────── */}
        <div className="w-full lg:w-96">
          <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-md sticky top-24">
            <h3 className="font-bold text-xl mb-6 text-[var(--color-foreground)]">Order Summary</h3>

            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-[var(--color-border)]">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({cart.length} items)</span>
                <span className="font-medium text-[var(--color-foreground)]">₹{cartTotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <div className="flex flex-col">
                    <span>Discount ({appliedCoupon.code})</span>
                    <button 
                      onClick={removeCoupon}
                      className="text-[10px] text-red-500 hover:underline text-left w-fit"
                    >
                      Remove
                    </button>
                  </div>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {isFetchingCoupon && (
                <div className="flex justify-between text-indigo-500 text-xs animate-pulse">
                  <span>Applying best coupon...</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-500">Tax (5%)</span>
                <span className="font-medium text-[var(--color-foreground)]">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-medium text-[var(--color-primary)]">FREE</span>
              </div>
            </div>

            {appliedCoupon && (
              <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-2">
                 <span className="text-lg">🎉</span> Coupon {appliedCoupon.code} applied successfully!
              </div>
            )}

            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg text-[var(--color-foreground)]">Total</span>
              <span className="font-bold text-2xl text-[var(--color-primary)]">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              Proceed to Checkout
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Secure checkout · Free delivery · 10-min delivery
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
