"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus } from "../../../context/OrderContext";
import {
  Package, CheckCircle2, XCircle, Truck, Clock,
  Search, ChevronDown, MapPin, ChevronRight,
} from "lucide-react";

const STORAGE_KEY = "smartbuy_orders";

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string; bg: string }[] = [
  { value: "confirmed",        label: "Confirmed",         color: "text-blue-700 dark:text-blue-300",   bg: "bg-blue-100 dark:bg-blue-900/40"   },
  { value: "out_for_delivery", label: "Out for Delivery",  color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/40" },
  { value: "delivered",        label: "Delivered",         color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-900/40" },
  { value: "cancelled",        label: "Cancelled",         color: "text-red-600 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-900/40"     },
];

const STATUS_ICON: Record<OrderStatus, React.ReactNode> = {
  confirmed:        <CheckCircle2 className="w-3.5 h-3.5" />,
  out_for_delivery: <Truck className="w-3.5 h-3.5" />,
  delivered:        <CheckCircle2 className="w-3.5 h-3.5" />,
  cancelled:        <XCircle className="w-3.5 h-3.5" />,
};

function statusCfg(s: OrderStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s) ?? STATUS_OPTIONS[0];
}

// ─── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, s: OrderStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusCfg(order.status);

  return (
    <>
      <tr
        className="hover:bg-gray-50 dark:hover:bg-[#0f172a]/60 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Order ID */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expanded ? "rotate-90" : ""}`} />
            <span className="font-bold text-sm text-[var(--color-foreground)]">#{order.id}</span>
          </div>
        </td>

        {/* Customer */}
        <td className="px-5 py-4">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-gray-400">{order.shippingAddress.phone}</p>
        </td>

        {/* Items preview */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-1.5">
            {order.orderItems.slice(0, 3).map((item, i) => (
              <img
                key={i}
                src={item.image}
                alt={item.name}
                title={item.name}
                className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700 bg-gray-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              {order.orderItems.length} item{order.orderItems.length > 1 ? "s" : ""}
            </span>
          </div>
        </td>

        {/* Date */}
        <td className="px-5 py-4 text-sm text-gray-500">{order.date}</td>

        {/* Amount */}
        <td className="px-5 py-4 font-bold text-sm text-[var(--color-foreground)]">
          ₹{order.totalAmount.toFixed(2)}
        </td>

        {/* Status dropdown */}
        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative inline-block">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>
              {STATUS_ICON[order.status]}
              <span>{sc.label}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              aria-label="Change order status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-gray-50/80 dark:bg-[#0f172a]/80">
          <td colSpan={6} className="px-6 pb-5 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Items list */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Order Items</p>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-200 dark:border-gray-700 bg-gray-100 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">₹{item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-foreground)]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{order.itemsPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax (5%)</span><span>₹{order.taxPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-sm text-[var(--color-foreground)] pt-1">
                    <span>Total</span><span>₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Delivery Address</p>
                <div className="flex items-start gap-3 bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-xl p-4">
                  <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-0.5">
                    <p className="font-bold text-[var(--color-foreground)]">{order.shippingAddress.fullName}</p>
                    <p className="text-gray-500">{order.shippingAddress.phone}</p>
                    <p className="text-gray-600 dark:text-gray-300">{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}</p>
                    <p className="text-gray-600 dark:text-gray-300">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.zipCode}</p>
                  </div>
                </div>

                {/* Status changer */}
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => onStatusChange(order.id, o.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition
                          ${order.status === o.value
                            ? `${o.bg} ${o.color} border-transparent shadow-sm scale-105`
                            : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-400"}`}
                      >
                        {STATUS_ICON[o.value]}{o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  // Load orders from localStorage
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setOrders(raw ? JSON.parse(raw) : []);
      } catch {
        setOrders([]);
      }
    };
    load();
    // Auto-refresh when any tab places an order
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  // Status change: update localStorage + state
  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  // Filtered list
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.shippingAddress.fullName.toLowerCase().includes(q) ||
      o.shippingAddress.phone.includes(q) ||
      o.orderItems.some((i) => i.name.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const revenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Orders Management</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage all customer orders in real-time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders",   value: orders.length,          color: "indigo", icon: Package },
          { label: "Confirmed",      value: confirmed,              color: "blue",   icon: Clock },
          { label: "Delivered",      value: delivered,              color: "green",  icon: CheckCircle2 },
          { label: "Total Revenue",  value: `₹${revenue.toFixed(0)}`, color: "purple", icon: Package },
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-extrabold mt-1 text-${c.color}-600 dark:text-${c.color}-400`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[var(--color-border)] rounded-xl bg-white dark:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-indigo-400 text-[var(--color-foreground)]"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="pl-4 pr-8 py-2.5 text-sm border border-[var(--color-border)] rounded-xl bg-white dark:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-indigo-400 text-[var(--color-foreground)] appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 font-semibold">
              {orders.length === 0
                ? "No orders placed yet. Orders appear here once customers check out."
                : "No orders match your search/filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#0f172a]/50 border-b border-[var(--color-border)] text-xs uppercase text-gray-500 tracking-wide">
                  <th className="px-5 py-4 font-semibold">Order ID</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Items</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((order) => (
                  <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
