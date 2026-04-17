"use client";

import { useCart } from '../../../context/CartContext';
import { CreditCard, Truck, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cartTotal } = useCart();
  const taxes = cartTotal * 0.05;
  const total = cartTotal + taxes;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Checkout flow triggered! In a real app, this would open Razorpay/Stripe.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">


      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Checkout Form */}
        <div className="flex-1 space-y-8">
          <div className="bg-[var(--color-card)] p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)] flex items-center gap-2">
              <Truck className="w-6 h-6 text-[var(--color-primary)]" /> Delivery Details
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
                <input type="text" className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="123 Fresh Lane" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                  <input type="text" className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zip Code</label>
                  <input type="text" className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="10001" />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-[var(--color-card)] p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)] flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[var(--color-primary)]" /> Payment Method
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-[var(--color-primary)] bg-green-50 dark:bg-green-900/10 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="font-bold text-[var(--color-foreground)]">Credit / Debit Card (Stripe)</span>
                </div>
                <div className="flex gap-2">
                   <div className="w-8 h-5 bg-blue-600 rounded text-xs text-white flex items-center justify-center font-bold">V</div>
                   <div className="w-8 h-5 bg-orange-500 rounded text-xs text-white flex items-center justify-center font-bold">M</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 border border-[var(--color-border)] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="font-bold text-[var(--color-foreground)]">Razorpay (UPI / Netbanking)</span>
                </div>
                <div className="text-xl">₹</div>
              </label>

              <label className="flex items-center justify-between p-4 border border-[var(--color-border)] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="font-bold text-[var(--color-foreground)]">Cash on Delivery</span>
                </div>
                <div className="text-xl">💵</div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-[var(--color-card)] p-8 rounded-3xl border border-[var(--color-border)] shadow-md sticky top-24">
            <h3 className="font-bold text-xl mb-6 text-[var(--color-foreground)]">Order Summary</h3>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-[var(--color-border)]">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-[var(--color-foreground)]">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (5%)</span>
                <span className="font-medium text-[var(--color-foreground)]">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-medium text-[var(--color-primary)]">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg text-[var(--color-foreground)]">Total</span>
              <span className="font-bold text-3xl text-[var(--color-primary)]">₹{total.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover-lift"
            >
              <ShieldCheck className="w-5 h-5" /> Place Order
            </button>
            <div className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Safe and secure payments
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
