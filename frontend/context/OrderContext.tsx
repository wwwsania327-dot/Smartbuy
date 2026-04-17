"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface OrderAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
}

export interface OrderItem {
  id: string | number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  _id?: string;
  date: string;
  status: OrderStatus;
  orderItems: any[];
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  shippingAddress: OrderAddress;
  createdAt: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  placeOrder: (orderData: any) => Promise<Order | null>;
  fetchOrders: () => Promise<void>;
  getSavedAddress: () => OrderAddress | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ADDRESS_KEY = "smartbuy_saved_address";

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchOrders = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((o: any) => ({ ...o, id: o._id || o.id }));
        setOrders(mappedData);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
    else setOrders([]);
  }, [user]);

  const placeOrder = async (orderData: any): Promise<Order | null> => {
    if (!user?.token) {
      console.warn('[OrderContext] Attempted to place order without user token');
      return null;
    }
    
    try {
      setLoading(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const newOrder = await res.json();
        const mappedOrder = { ...newOrder, id: newOrder._id || newOrder.id };
        setOrders((prev) => [mappedOrder, ...prev]);
        
        // Save address for next time
        localStorage.setItem(ADDRESS_KEY, JSON.stringify(orderData.shippingAddress));
        
        return mappedOrder;
      } else {
        const errorData = await res.json();
        console.error('[OrderContext] Server rejected order:', errorData);
        throw new Error(errorData.message || 'Failed to place order');
      }
    } catch (err: any) {
      console.error("[OrderContext] Order placement failed:", err);
      throw err; // Re-throw to be caught by the component
    } finally {
      setLoading(false);
    }
  };

  const getSavedAddress = (): OrderAddress | null => {
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, loading, placeOrder, fetchOrders, getSavedAddress }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
