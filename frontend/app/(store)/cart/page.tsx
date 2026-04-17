"use client";

import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { useOrders, OrderAddress, OrderItem } from "../../../context/OrderContext";
import { Trash2, Plus, Minus, ShoppingBag, MapPin, ArrowRight, Check, X, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Step types ───────────────────────────────────────────────────────────────
type Step = "idle" | "confirm" | "address" | "success";

const EMPTY_FORM: OrderAddress = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", zipCode: "",
};

// ─── Address Form Component ───────────────────────────────────────────────────
function AddressForm({
  initial,
  onSubmit,
  onBack,
}: {
  initial: OrderAddress;
  onSubmit: (addr: OrderAddress) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<OrderAddress>(initial);
  const [errors, setErrors] = useState<Partial<OrderAddress>>({});

  function validate() {
    const e: Partial<Record<keyof OrderAddress, string>> = {};
    if (!form.fullName.trim())      e.fullName     = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.addressLine1.trim())  e.addressLine1 = "Address is required";
    if (!form.city.trim())          e.city         = "City is required";
    if (!form.state.trim())         e.state        = "State is required";
    if (!/^\d{6}$/.test(form.zipCode)) e.zipCode   = "Enter a valid 6-digit zip code";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onSubmit(form);
  }

  const field = (
    key: keyof OrderAddress,
    label: string,
    placeholder: string,
    type = "text",
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  ) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2
          ${errors[key]
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-200 dark:border-gray-700 focus:ring-[var(--color-primary)]"}
          bg-gray-50 dark:bg-gray-800/60 text-[var(--color-foreground)]`}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field("fullName",    "Full Name",    "e.g. Rahul Sharma")}
      {field("phone",       "Phone Number", "10-digit mobile number", "tel", "tel")}
      {field("addressLine1", "Address Line 1", "House no, Street, Locality")}
      {field("addressLine2", "Address Line 2 (Optional)", "Landmark, Apartment, etc.")}
      <div className="grid grid-cols-2 gap-3">
        {field("city", "City", "e.g. Mumbai")}
        {field("state", "State", "e.g. Maharashtra")}
      </div>
      {field("zipCode", "Zip Code", "e.g. 400001", "text", "numeric")}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-sm shadow transition flex items-center justify-center gap-2"
        >
          Place Order <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

// ─── Main Cart Page ───────────────────────────────────────────────────────────
export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, setIsCartOpen } = useCart();
  const { placeOrder, getSavedAddress } = useOrders();
  const router = useRouter();

  const [step, setStep]         = useState<Step>("idle");
  const [useSaved, setUseSaved] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number } | null>(null);

  const savedAddress = getSavedAddress();
  const taxes  = cartTotal * 0.05;
  const total  = cartTotal + taxes;

  // ── Start flow ───────────────────────────────────────────────────────────
  function startCheckout() {
    setIsCartOpen(false); // Close sidebar if open
    setStep("confirm");
  }

  function onConfirm() {
    // If there is a saved address, let user choose; otherwise go straight to form
    if (savedAddress) {
      setUseSaved(true);
    }
    setStep("address");
  }

  async function handleAddressSubmit(addr: OrderAddress) {
    const items = cart.map((ci) => ({
      product: ci.product.id,
      name: ci.product.name,
      image: ci.product.image,
      price: ci.product.discount > 0 ? ci.product.discount : ci.product.price,
      qty: ci.quantity,
    }));

    const orderData = {
      orderItems: items,
      shippingAddress: {
        fullName: addr.fullName,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || "",
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        phone: addr.phone
      },
      paymentMethod: "COD",
      itemsPrice: cartTotal,
      taxPrice: taxes,
      shippingPrice: 0,
      totalPrice: total
    };

    try {
      const order = await placeOrder(orderData);
      if (order) {
        console.log('Order placed successfully:', order);
        setPlacedOrder({ id: order._id || order.id, total: order.totalPrice });
        clearCart();
        setStep("success");
      }
    } catch (err: any) {
      alert(err.message || "Failed to place order. Please try again.");
    }
  }

  function closeModal() {
    setStep("idle");
    setUseSaved(false);
  }

  // ── Empty cart state ──────────────────────────────────────────────────────
  if (cart.length === 0 && step !== "success") {
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
                <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (5%)</span>
                <span className="font-medium">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-medium text-[var(--color-primary)]">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg text-[var(--color-foreground)]">Total</span>
              <span className="font-bold text-2xl text-[var(--color-primary)]">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={startCheckout}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              Place Order
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Secure checkout · Free delivery · 10-min delivery
            </p>
          </div>
        </div>
      </div>

      {/* ───────── MODALS ───────── */}
      {step !== "idle" && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget && step !== "success") closeModal(); }}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl overflow-hidden"
            style={{ animation: "slideUp 0.3s ease" }}
          >

            {/* ── Step 1: Confirm ─────────────────────────────────────── */}
            {step === "confirm" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-[var(--color-foreground)]">Confirm Order?</h2>
                  <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mini order preview */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-5 space-y-3">
                  {cart.slice(0, 3).map((ci) => {
                    const price = ci.product.discount > 0 ? ci.product.discount : ci.product.price;
                    return (
                      <div key={ci.product.id} className="flex items-center gap-3">
                        <img
                          src={ci.product.image}
                          alt={ci.product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=img"; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">{ci.product.name}</p>
                          <p className="text-xs text-gray-400">x{ci.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-primary)]">₹{(price * ci.quantity).toFixed(0)}</span>
                      </div>
                    );
                  })}
                  {cart.length > 3 && (
                    <p className="text-xs text-gray-400 text-center">+{cart.length - 3} more items</p>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
                    <span className="text-sm text-gray-500">Total (incl. tax)</span>
                    <span className="font-bold text-[var(--color-foreground)]">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-sm shadow transition flex items-center justify-center gap-2"
                  >
                    Confirm <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Address ─────────────────────────────────────── */}
            {step === "address" && (
              <div className="p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                    Delivery Address
                  </h2>
                  <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Saved address toggle */}
                {savedAddress && (
                  <div className="mb-5">
                    <div
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition mb-3
                        ${useSaved
                          ? "border-[var(--color-primary)] bg-green-50 dark:bg-green-900/10"
                          : "border-gray-200 dark:border-gray-700"}`}
                      onClick={() => setUseSaved(true)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition
                            ${useSaved ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-gray-300"}`}>
                            {useSaved && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-sm font-semibold text-[var(--color-foreground)]">Use Saved Address</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 ml-6 leading-relaxed">
                        {savedAddress.fullName} · {savedAddress.phone}<br />
                        {savedAddress.addressLine1}, {savedAddress.city}, {savedAddress.state} — {savedAddress.zipCode}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition text-sm font-semibold text-center
                        ${!useSaved
                          ? "border-[var(--color-primary)] bg-green-50 dark:bg-green-900/10 text-[var(--color-primary)]"
                          : "border-gray-200 dark:border-gray-700 text-gray-500"}`}
                      onClick={() => setUseSaved(false)}
                    >
                      + Add New Address
                    </div>
                  </div>
                )}

                {useSaved && savedAddress ? (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep("confirm")}
                      className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleAddressSubmit(savedAddress)}
                      className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-sm shadow transition flex items-center justify-center gap-2"
                    >
                      Place Order <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <AddressForm
                    initial={EMPTY_FORM}
                    onSubmit={handleAddressSubmit}
                    onBack={() => setStep("confirm")}
                  />
                )}
              </div>
            )}

            {/* ── Step 3: Success ─────────────────────────────────────── */}
            {step === "success" && placedOrder && (
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5"
                     style={{ animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
                  <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={3} />
                </div>

                <h2 className="text-2xl font-extrabold text-[var(--color-foreground)] mb-2">
                  Order Placed! 🎉
                </h2>
                <p className="text-gray-500 text-sm mb-1">
                  Order <span className="font-bold text-[var(--color-foreground)]">#{placedOrder.id}</span>
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Total paid: <span className="font-bold text-[var(--color-primary)]">₹{(placedOrder?.total || 0).toFixed(2)}</span>
                </p>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <Package className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">Delivery in ~10 minutes</p>
                    <p className="text-xs text-green-600 dark:text-green-500">Your order is confirmed and being packed</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { closeModal(); router.push("/products"); }}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => { closeModal(); router.push("/orders"); }}
                    className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-sm shadow transition"
                  >
                    My Orders
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease; }
      `}</style>
    </div>
  );
}
