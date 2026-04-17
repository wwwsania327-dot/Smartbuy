"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  User, Package, MapPin, Settings, LogOut, ChevronRight,
  ShoppingBag, Heart, Bell, Shield, HelpCircle, Star
} from "lucide-react";
import Link from "next/link";

interface MenuSection {
  title: string;
  items: {
    icon: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
    badge?: string | number;
    danger?: boolean;
  }[];
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const cartCount  = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlist.length;

  const displayName  = user?.name  ?? "Guest User";
  const displayEmail = user?.email ?? "Sign in for a personalized experience";
  const initials     = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const menuSections: MenuSection[] = [
    {
      title: "My Activity",
      items: [
        { icon: <Package className="w-5 h-5" />,     label: "My Orders",         href: "/orders",   badge: 2 },
        { icon: <Heart className="w-5 h-5" />,        label: "Wishlist",          href: "/wishlist", badge: wishlistCount || undefined },
        { icon: <ShoppingBag className="w-5 h-5" />, label: "Cart",              href: "/cart",     badge: cartCount || undefined },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: <MapPin className="w-5 h-5" />,      label: "My Addresses",   href: "#" },
        { icon: <Bell className="w-5 h-5" />,         label: "Notifications",  href: "#" },
        { icon: <Shield className="w-5 h-5" />,       label: "Privacy & Security", href: "#" },
        { icon: <Settings className="w-5 h-5" />,     label: "Settings",       href: "#" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: <HelpCircle className="w-5 h-5" />,  label: "Help & FAQs",    href: "#" },
        { icon: <Star className="w-5 h-5" />,         label: "Rate the App",   href: "#" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8 max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="account-hero">
        <div className="account-hero-bg" aria-hidden />
        <div className="relative z-10 px-5 py-8 flex flex-col items-center">
          {/* Avatar */}
          <div className="account-avatar">
            <span className="text-2xl font-extrabold text-white">{initials}</span>
            {user && (
              <span className="account-avatar-dot" aria-label="Online" />
            )}
          </div>

          <h2 className="mt-3 text-xl font-extrabold text-white tracking-tight">{displayName}</h2>
          <p className="text-white/70 text-sm mt-0.5">{displayEmail}</p>

          {!user && (
            <div className="flex gap-3 mt-5">
              <Link href="/login"    className="account-auth-btn account-auth-btn--primary">Sign In</Link>
              <Link href="/register" className="account-auth-btn account-auth-btn--secondary">Register</Link>
            </div>
          )}

          {user && (
            <div className="flex gap-6 mt-5">
              {[
                { label: "Orders",   value: "4" },
                { label: "Wishlist", value: String(wishlistCount) },
                { label: "Points",   value: "840" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-white font-extrabold text-lg leading-none">{stat.value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-4 mt-4 flex flex-col gap-4">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {section.title}
            </p>
            <div className="account-menu-card">
              {section.items.map((item, idx) => {
                const isLast = idx === section.items.length - 1;
                const className = `account-menu-item ${!isLast ? "border-b border-[var(--color-border)]" : ""} ${item.danger ? "hover:text-rose-500" : ""}`;
                
                const content = (
                  <>
                    <span className={`account-menu-icon ${item.danger ? "text-rose-400" : "text-[var(--color-primary)]"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-[var(--color-foreground)]">
                      {item.label}
                    </span>
                    {item.badge !== undefined && Number(item.badge) > 0 && (
                      <span className="account-menu-badge">{item.badge}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </>
                );

                if (item.href) {
                  return (
                    <Link key={item.label} href={item.href} className={className}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <button key={item.label} onClick={item.onClick} type="button" className={className}>
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        {user && (
          <button
            onClick={logout}
            id="account-logout-btn"
            className="account-logout-btn"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        )}

        <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-2">
          SmartBuy v1.0 · Crafted with 💚
        </p>
      </div>
    </div>
  );
}
