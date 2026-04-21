"use client";

import { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { fetchApi } from '../../../lib/api';
import { CreditCard, Truck, ArrowLeft, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taxes = cartTotal * 0.05;
  const total = cartTotal + taxes;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  // Load Razorpay Script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Order in Database (Always First)
      const orderData = {
        orderItems: cart.map(item => ({
          name: item.product.name,
          qty: item.quantity,
          image: item.product.image,
          price: item.product.discount > 0 ? item.product.discount : item.product.price,
          product: item.product.id
        })),
        shippingAddress: formData,
        paymentMethod: paymentMethod,
        itemsPrice: cartTotal,
        taxPrice: taxes,
        shippingPrice: 0,
        totalPrice: total,
      };

      const orderRes = await fetchApi('/api/orders', {
        method: 'POST',
        body: orderData
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || "Failed to create order");
      }

      const createdOrder = await orderRes.json();
      const dbOrderId = createdOrder._id;

      // 2. Handle Flows
      if (paymentMethod === 'COD') {
        setShowSuccess(true);
        clearCart();
      } else {
        // ONLINE FLOW
        const res = await loadRazorpay();
        if (!res) {
          throw new Error("Razorpay SDK failed to load");
        }

        // Create Razorpay Order
        const rzpOrderRes = await fetchApi('/api/payment/create-order', {
          method: 'POST',
          body: { amount: total, orderId: dbOrderId }
        });

        if (!rzpOrderRes.ok) {
          const err = await rzpOrderRes.json();
          throw new Error(err.message || "Failed to initiate online payment");
        }

        const rzpOrder = await rzpOrderRes.json();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'SmartBuy',
          description: 'Payment for your order',
          image: '/logo.png', // Replace with your logo
          order_id: rzpOrder.id,
          handler: async (response: any) => {
            try {
              // Verify Payment on Backend
              const verifyRes = await fetchApi('/api/payment/verify', {
                method: 'POST',
                body: {
                  ...response,
                  dbOrderId
                }
              });

              if (verifyRes.ok) {
                setShowSuccess(true);
                clearCart();
              } else {
                setError("Payment verification failed. Please contact support.");
              }
            } catch (err: any) {
              setError("An error occurred during verification.");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: formData.phone
          },
          theme: {
            color: '#10b981' // emerald-500
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              // Order remains 'Pending' in DB
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error("Checkout Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      // For COD we set success true, for online we wait for handler or dismiss
      if (paymentMethod === 'COD') setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-[var(--color-card)] p-12 rounded-3xl border border-[var(--color-border)] shadow-xl">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-[var(--color-foreground)]">Order Placed Successfully!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">
            Thank you for shopping with us. Your order has been received and is being processed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-transform hover-lift">
              View My Orders
            </Link>
            <Link href="/" className="bg-[var(--color-secondary)] hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[var(--color-foreground)] px-8 py-4 rounded-xl font-bold transition-transform hover-lift">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Checkout Form */}
        <div className="flex-1 space-y-8">
          <div className="bg-[var(--color-card)] p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)] flex items-center gap-2">
              <Truck className="w-6 h-6 text-[var(--color-primary)]" /> Delivery Details
            </h2>
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                    placeholder="John Doe" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                    placeholder="+91 9876543210" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
                <input 
                  type="text" 
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                  placeholder="123 Fresh Lane" 
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                    placeholder="Mumbai" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                  <input 
                    type="text" 
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                    placeholder="Maharashtra" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zip Code</label>
                  <input 
                    type="text" 
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                    placeholder="400001" 
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-[var(--color-card)] p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)] flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[var(--color-primary)]" /> Payment Method
            </h2>

            <div className="space-y-4">
              <label 
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'ONLINE' 
                  ? 'border-[var(--color-primary)] bg-emerald-50/30 dark:bg-emerald-900/10' 
                  : 'border-[var(--color-border)] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setPaymentMethod('ONLINE')}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'ONLINE'} 
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                  />
                  <div>
                    <span className="font-bold text-[var(--color-foreground)] block">Online Payment (Razorpay)</span>
                    <span className="text-xs text-gray-500">UPI, Cards, Netbanking</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <div className="w-8 h-5 bg-blue-600 rounded text-xs text-white flex items-center justify-center font-bold">V</div>
                   <div className="w-8 h-5 bg-orange-500 rounded text-xs text-white flex items-center justify-center font-bold">M</div>
                </div>
              </label>

              <label 
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'COD' 
                  ? 'border-[var(--color-primary)] bg-emerald-50/30 dark:bg-emerald-900/10' 
                  : 'border-[var(--color-border)] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'COD'} 
                    onChange={() => setPaymentMethod('COD')}
                    className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                  />
                  <div>
                    <span className="font-bold text-[var(--color-foreground)] block">Cash on Delivery</span>
                    <span className="text-xs text-gray-500">Pay when your order arrives</span>
                  </div>
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
              type="submit"
              form="checkout-form"
              disabled={loading || cart.length === 0}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Place Order
                </>
              )}
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
