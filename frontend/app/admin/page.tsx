"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Package, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Order, OrderStatus } from "../../context/OrderContext";

const ORDERS_KEY   = "smartbuy_orders";
const PRODUCTS_KEY = "admin_products";

const STATUS_BADGE: Record<OrderStatus, { label: string; cls: string }> = {
  Processing:       { label: "Processing",       cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  Shipped:          { label: "Shipped",          cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  "Out for Delivery": { label: "Out for Delivery", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  Delivered:        { label: "Delivered",        cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  Cancelled:        { label: "Cancelled",        cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" },
};

import { fetchApi } from "../../lib/api";

export default function AdminDashboard() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load Orders from API
        const orderRes = await fetchApi("/api/orders/all");
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData.map((o: any) => ({ ...o, id: o._id || o.id })));
        }

        // Load Products from localStorage (existing logic)
        const rawP = localStorage.getItem(PRODUCTS_KEY);
        setProducts(rawP ? JSON.parse(rawP) : []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ── Live stats ──────────────────────────────────────────────────────────────
  const revenue   = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pending   = orders.filter((o) => o.status === "Processing" || o.status === "Shipped" || o.status === "Out for Delivery").length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${revenue.toFixed(0)}`,
      sub: `${orders.length} order${orders.length !== 1 ? "s" : ""}`,
      icon: DollarSign,
      color: "indigo",
    },
    {
      title: "Total Orders",
      value: orders.length,
      sub: `${pending} pending`,
      icon: ShoppingBag,
      color: "blue",
    },
    {
      title: "Delivered",
      value: delivered,
      sub: `${orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0}% success rate`,
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Admin Products",
      value: products.length,
      sub: "from admin panel",
      icon: Package,
      color: "purple",
    },
  ];

  const recentOrders = [...orders].slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Live data from customer orders and your product catalog.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                <h3 className="text-2xl font-extrabold text-[var(--color-foreground)] mt-2">{stat.value}</h3>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/30 rounded-xl text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-[var(--color-foreground)] text-lg">Recent Orders</h3>
            <p className="text-xs text-gray-500 mt-0.5">Live from localStorage · {orders.length} total</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold"
          >
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 font-medium">No orders yet.</p>
            <p className="text-xs text-gray-400 mt-1">Orders will appear here once customers place them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#0f172a]/50 border-b border-[var(--color-border)] text-xs uppercase text-gray-500 tracking-wide">
                  <th className="px-5 py-3.5 font-semibold">Order ID</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Items</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[var(--color-border)]">
                {recentOrders.map((order) => {
                  const sc = STATUS_BADGE[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-[#0f172a]/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[var(--color-foreground)]">#{order.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[var(--color-foreground)]">{order.shippingAddress.fullName}</p>
                        <p className="text-xs text-gray-400">{order.shippingAddress.phone}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {order.orderItems.slice(0, 2).map((item: any, i: number) => (
                            <img
                              key={i}
                              src={item.image}
                              alt={item.name}
                              title={item.name}
                              className="w-7 h-7 rounded-lg object-cover border border-gray-200 dark:border-gray-700 bg-gray-100"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ))}
                          <span className="text-xs text-gray-400">{order.orderItems.length} item{order.orderItems.length > 1 ? "s" : ""}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{order.date}</td>
                      <td className="px-5 py-3.5 font-bold text-[var(--color-foreground)]">₹{(order.totalPrice || 0).toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
