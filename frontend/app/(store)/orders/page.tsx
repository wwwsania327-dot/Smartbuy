"use client";

import { useState } from "react";
import { useOrders, Order, OrderStatus } from "../../../context/OrderContext";
import {
  Package, Clock, CheckCircle2, XCircle, RotateCcw,
  ChevronRight, MapPin, Truck, ShoppingBag, Star
} from "lucide-react";
import Link from "next/link";
import RatingModal from "@/components/RatingModal";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; icon: React.ReactNode; step: number;
}> = {
  Processing: { label: "Processing", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-800", icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 1 },
  Shipped: { label: "Shipped", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800", icon: <Package className="w-3.5 h-3.5" />, step: 2 },
  "Out for Delivery": { label: "Out for Delivery", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800", icon: <Truck className="w-3.5 h-3.5" />, step: 3 },
  Delivered: { label: "Delivered", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30", border: "border-green-200 dark:border-green-800", icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 4 },
  Cancelled: { label: "Cancelled", color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30", border: "border-red-200 dark:border-red-800", icon: <XCircle className="w-3.5 h-3.5" />, step: 0 },
};

const FILTER_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Processing", value: "Processing" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

// ─── Delivery Progress Bar ────────────────────────────────────────────────────
function DeliveryProgress({ status }: { status: string }) {
  if (status === "Cancelled") return null;
  const steps = [
    { label: "Processing", s: "Processing" },
    { label: "Shipped", s: "Shipped" },
    { label: "Delivered", s: "Delivered" },
  ];
  const currentStep = STATUS_CONFIG[status]?.step || 1;

  return (
    <div className="mt-4 mb-1">
      <div className="flex items-center justify-between relative">
        {/* Line behind dots */}
        <div className="absolute top-3 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
        <div
          className="absolute top-3 left-4 h-0.5 bg-[var(--color-primary)] z-0 transition-all duration-500"
          style={{ right: `${(1 - (Math.max(0, currentStep - 1)) / 2) * 100 * 0.88}%` }}
        />
        {steps.map((st, idx) => {
          const done = currentStep > idx + 1;
          const active = currentStep === idx + 1;
          return (
            <div key={st.s} className="flex flex-col items-center z-10">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${done || active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
                {done && <CheckCircle2 className="w-3.5 h-3.5" />}
                {active && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`text-[10px] mt-1 font-medium text-center max-w-[60px] leading-tight
                ${done || active ? "text-[var(--color-primary)]" : "text-gray-400"}`}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onRate }: { order: Order; onRate: (productId: string, productName: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const items = order.orderItems || [];
  const itemsCount = items.length;
  const dateStr = new Date(order.createdAt).toLocaleDateString();
  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.Processing;

  return (
    <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
      {/* Header */}
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-sm text-[var(--color-foreground)]">Order #{order.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {dateStr} · {itemsCount} item{itemsCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sc.bg} ${sc.color} ${sc.border}`}>
              {sc.icon}{sc.label}
            </span>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </div>
        </div>

        {/* Product thumbnails + total */}
        <div className="flex items-center gap-2">
          {items.slice(0, 4).map((item, i) => (
            <div key={i} className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-100 dark:bg-gray-800">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
          {itemsCount > 4 && (
            <span className="text-xs text-gray-400 font-medium">+{itemsCount - 4}</span>
          )}
          <span className="ml-auto font-bold text-[var(--color-foreground)] text-sm">
            ₹{(order.totalPrice || 0).toFixed(2)}
          </span>
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--color-border)]">

          {/* Delivery progress */}
          <DeliveryProgress status={order.status} />

          {/* Delivery time */}
          {order.status === "Processing" && (
            <div className="flex items-center gap-2 mt-3 text-xs text-[var(--color-primary)] font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Expected delivery by 10-15 minutes
            </div>
          )}

          {/* Items list */}
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-4 mb-2">Items Ordered</p>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-[var(--color-border)]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    ₹{(item.price || 0).toFixed(2)} × {item.qty}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-[var(--color-foreground)]">
                    ₹{((item.price || 0) * (item.qty || 0)).toFixed(2)}
                  </span>
                  {order.status === "Delivered" && (
                    <button 
                      onClick={() => onRate(item.product, item.name)}
                      className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded"
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Rate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="mt-4 pt-3 border-t border-dashed border-[var(--color-border)] space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{(order.itemsPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{(order.taxPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-[var(--color-primary)] font-semibold">₹{(order.shippingPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[var(--color-foreground)] pt-1">
              <span>Total Paid</span>
              <span className="text-[var(--color-primary)]">₹{(order.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery address */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <p className="font-semibold text-[var(--color-foreground)]">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress?.addressLine2}` : ""}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zipCode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { orders } = useOrders();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [ratingModal, setRatingModal] = useState<{ open: boolean; productId: string; productName: string }>({
    open: false,
    productId: '',
    productName: '',
  });

  const handleOpenRating = (productId: string, productName: string) => {
    setRatingModal({ open: true, productId, productName });
  };

  const filtered =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-foreground)]">My Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <Package className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition
              ${activeFilter === tab.value
                ? "bg-[var(--color-primary)] text-white border-transparent shadow"
                : "bg-[var(--color-card)] text-gray-500 border-[var(--color-border)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders or Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">
            {orders.length === 0 ? "No orders yet" : `No ${activeFilter.replace("_", " ")} orders`}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {orders.length === 0
              ? "Start shopping and your orders will appear here"
              : "Try selecting a different filter"}
          </p>
          {orders.length === 0 && (
            <Link
              href="/products"
              className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-full font-bold shadow transition"
            >
              Shop Now
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onRate={handleOpenRating} />
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal 
        isOpen={ratingModal.open} 
        onClose={() => setRatingModal(prev => ({ ...prev, open: false }))}
        productId={ratingModal.productId}
        productName={ratingModal.productName}
      />
    </div>
  );
}
