"use client";

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BackButton from '../../components/BackButton';
import { LayoutDashboard, ShoppingCart, Users, Ticket, Package, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // ✅ Redirect logic
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin' && user.role !== 'superadmin') {
        router.push('/');
      }
    }
  }, [loading, user]);

  console.log('[AdminLayout] loading:', loading, '| user:', user?.email ?? 'null', '| role:', user?.role ?? 'none');

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-50 dark:bg-[#0f172a]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-gray-500 text-sm">Verifying access…</p>
      </div>
    );
  }

  // ✅ Main UI (IMPORTANT: return hona chahiye)
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f172a]">

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#1e293b] border-r border-[var(--color-border)] hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${user?.role === 'superadmin' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              {user?.role === 'superadmin' ? 'S' : 'A'}
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--color-foreground)]">
              {user?.role === 'superadmin' ? 'Superadmin' : 'Admin'}<span className="text-gray-500 font-medium">Panel</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-400 font-medium">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <Package className="w-5 h-5" /> Categories
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <Package className="w-5 h-5" /> Products
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <ShoppingCart className="w-5 h-5" /> Orders
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <Users className="w-5 h-5" /> Users
          </Link>
          <Link href="/admin/coupons" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <Ticket className="w-5 h-5" /> Coupons
          </Link>
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]">
          <button onClick={logout} className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Header */}
        <header className="h-16 bg-white dark:bg-[#1e293b] border-b border-[var(--color-border)] flex items-center justify-between px-4 md:hidden">
          <span className="font-bold text-xl text-[var(--color-foreground)]">{user?.role === 'superadmin' ? 'Superadmin' : 'Admin'}</span>
          <button className="p-2 text-gray-500 rounded-md hover:bg-gray-100">
            Menu
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <BackButton />
          {children}
        </div>

      </main>
    </div>
  );
}