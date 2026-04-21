"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  User, Package, MapPin, Settings, LogOut, ChevronRight,
  ShoppingBag, Heart, Bell, Shield, HelpCircle, Star,
  Plus, Trash2, Edit2, CheckCircle, ArrowLeft, Clock,
  Moon, Languages, Check
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
  getNotifications, markNotificationRead, clearNotifications,
  updateProfile, updateSettings
} from "@/lib/api";
import { useTheme } from "next-themes";

type Tab = 'main' | 'addresses' | 'notifications' | 'security' | 'settings';

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
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('main');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const cartCount  = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlist.length;

  const displayName  = user?.name  ?? "Guest User";
  const displayEmail = user?.email ?? "Sign in for a personalized experience";
  const initials     = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  // Fetch data when active tab changes
  useEffect(() => {
    if (!user) return;

    if (activeTab === 'addresses') {
      fetchAddresses();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab, user]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      alert("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      alert("Failed to set default address");
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await clearNotifications();
      setNotifications([]);
    } catch (err) {
      alert("Failed to clear notifications");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

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
        { icon: <MapPin className="w-5 h-5" />,      label: "My Addresses",   onClick: () => setActiveTab('addresses') },
        { icon: <Bell className="w-5 h-5" />,         label: "Notifications",  onClick: () => setActiveTab('notifications') },
        { icon: <Shield className="w-5 h-5" />,       label: "Privacy & Security", onClick: () => setActiveTab('security') },
        { icon: <Settings className="w-5 h-5" />,     label: "Settings",       onClick: () => setActiveTab('settings') },
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

  const renderHeader = () => (
    <div className="account-hero">
      <div className="account-hero-bg" aria-hidden />
      <div className="relative z-10 px-5 py-8 flex flex-col items-center">
        <div className="account-avatar">
          <span className="text-2xl font-extrabold text-white">{initials}</span>
          {user && <span className="account-avatar-dot" aria-label="Online" />}
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
  );

  const renderMainMenu = () => (
    <div className="px-4 mt-4 flex flex-col gap-4">
      {renderHeader()}
      {menuSections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            {section.title}
          </p>
          <div className="account-menu-card overflow-hidden">
            {section.items.map((item, idx) => {
              const isLast = idx === section.items.length - 1;
              const className = `account-menu-item transition-all duration-200 active:bg-gray-50 dark:active:bg-gray-800 ${!isLast ? "border-b border-[var(--color-border)]" : ""} ${item.danger ? "hover:text-rose-500" : ""}`;
              
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

      {user && (
        <button
          onClick={logout}
          className="account-logout-btn mt-4"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      )}

      <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-6 mb-8">
        SmartBuy v1.2 · Crafted with 💚
      </p>
    </div>
  );

  const renderAddresses = () => (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('main')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">My Addresses</h1>
      </div>

      <button 
        onClick={() => {
          setEditingAddress(null);
          setShowAddressForm(true);
        }}
        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all mb-6"
      >
        <Plus className="w-5 h-5" />
        Add New Address
      </button>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map(addr => (
            <div key={addr._id} className={`p-5 rounded-2xl border ${addr.isDefault ? 'border-[var(--color-primary)] bg-green-50/30 dark:bg-green-900/10' : 'border-[var(--color-border)] bg-white dark:bg-gray-900'} relative shadow-sm`}>
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-[var(--color-primary)] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Default</span>
              )}
              <h3 className="font-bold text-[var(--color-foreground)]">{addr.fullName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{addr.addressLine1}, {addr.addressLine2 && addr.addressLine2 + ','} {addr.city}, {addr.state} - {addr.zipCode}</p>
              <p className="text-sm font-bold text-[var(--color-foreground)] mt-2 italic">{addr.phone}</p>
              
              <div className="flex gap-4 mt-5 pt-4 border-t border-[var(--color-border)]">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr._id)} className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">Set as Default</button>
                )}
                <button onClick={() => {
                  setEditingAddress(addr);
                  setShowAddressForm(true);
                }} className="text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDeleteAddress(addr._id)} className="text-xs font-bold text-rose-400 hover:text-rose-600 uppercase tracking-wider flex items-center gap-1 ml-auto">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="text-center py-10">
              <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bold">No addresses found</p>
            </div>
          )}
        </div>
      )}

      {/* Address Form Modal (Simplified for brevity) */}
      {showAddressForm && (
        <AddressForm 
          initialData={editingAddress} 
          onClose={() => setShowAddressForm(false)} 
          onSuccess={() => {
            setShowAddressForm(false);
            fetchAddresses();
          }} 
        />
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('main')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">Notifications</h1>
        {notifications.length > 0 && (
          <button onClick={handleClearAllNotifications} className="ml-auto text-xs font-bold text-rose-400 uppercase tracking-wider">Clear All</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(n => (
            <div 
              key={n._id} 
              onClick={() => !n.read && handleMarkRead(n._id)}
              className={`p-4 rounded-2xl border ${n.read ? 'border-[var(--color-border)] opacity-60' : 'border-green-100 dark:border-green-900/30 bg-green-50/20 dark:bg-green-900/5'} cursor-pointer transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl scale-90 ${n.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-green-100 dark:bg-green-900/30 text-[var(--color-primary)]'}`}>
                  {n.type === 'ORDER_PLACED' ? <Package className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-bold ${n.read ? 'text-[var(--color-foreground)]' : 'text-[var(--color-primary)]'}`}>{n.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-2 flex items-center gap-1.5 font-bold">
                    <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-rose-500 rounded-full mt-1" />}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-20">
              <Bell className="w-16 h-16 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-extrabold uppercase tracking-widest">Inbox is empty</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('main')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">Privacy & Security</h1>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-900 border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Display Name</label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-bold flex items-center justify-between">
                <span>{user?.name}</span>
                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-bold text-gray-400 flex items-center justify-between">
                <span>{user?.email}</span>
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Login Activity</h2>
          <div className="space-y-4">
            {[
              { device: 'Android Phone · Chrome', location: 'Dhaka, BD', time: 'Active Now', current: true },
              { device: 'Windows PC · Edge', location: 'Dhaka, BD', time: 'Yesterday, 10:45 AM', current: false }
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  {activity.device.includes('Android') ? <User className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    {activity.device}
                    {activity.current && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activity.location} · {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('main')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">App Settings</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 flex items-center justify-between border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-xl">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Dark Appearance</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-wider">Adjust your UI theme</p>
            </div>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`w-12 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-[var(--color-primary)]' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7 shadow-lg' : 'left-1'}`} />
          </button>
        </div>

        <div className="p-5 flex items-center justify-between border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Order Alerts</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-wider">Push notification updates</p>
            </div>
          </div>
          <button className="w-12 h-6 rounded-full bg-[var(--color-primary)] relative">
            <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white shadow-lg" />
          </button>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-500 rounded-xl">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">App Language</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-wider">English (US)</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20 max-w-lg mx-auto">
      {activeTab === 'main' && renderMainMenu()}
      {activeTab === 'addresses' && renderAddresses()}
      {activeTab === 'notifications' && renderNotifications()}
      {activeTab === 'security' && renderSecurity()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
}

/**
 * Address Form Component
 */
function AddressForm({ initialData, onClose, onSuccess }: { initialData?: any, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    isDefault: initialData?.isDefault || false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await updateAddress(initialData._id, formData);
      } else {
        await addAddress(formData);
      }
      onSuccess();
    } catch (err) {
      alert("Error saving address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-[2rem] sm:rounded-3xl p-6 pb-10 sm:pb-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />
        <h2 className="text-xl font-extrabold mb-6 flex items-center justify-between tracking-tight">
          {initialData ? 'Edit Address' : 'Add New Address'}
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <LogOut className="w-5 h-5 rotate-90" />
          </button>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="account-input-group">
              <label>Full Name</label>
              <input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Receivers name" />
            </div>
            <div className="account-input-group">
              <label>Phone Number</label>
              <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXX-XXXXXX" />
            </div>
            <div className="account-input-group">
              <label>Street Address</label>
              <input required value={formData.addressLine1} onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} placeholder="House no, Street name" />
            </div>
            <div className="account-input-group">
              <label>Apartment (Optional)</label>
              <input value={formData.addressLine2} onChange={(e) => setFormData({...formData, addressLine2: e.target.value})} placeholder="Building, Floor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="account-input-group">
                <label>City</label>
                <input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="City" />
              </div>
              <div className="account-input-group">
                <label>State</label>
                <input required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="State" />
              </div>
            </div>
            <div className="account-input-group">
              <label>Zipcode</label>
              <input required value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} placeholder="XXXXXX" />
            </div>
          </div>

          <label className="flex items-center gap-3 py-2 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.isDefault ? 'bg-[var(--color-primary)] border-[var(--color-primary)] shadow-sm shadow-green-200' : 'border-gray-300 dark:border-gray-700'}`}>
              {formData.isDefault && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.isDefault} onChange={(e) => setFormData({...formData, isDefault: e.target.checked})} />
            <span className="text-sm font-bold text-gray-500 group-hover:text-[var(--color-foreground)] transition-colors">Set as default address</span>
          </label>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
}
