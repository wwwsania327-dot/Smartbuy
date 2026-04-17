"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status?: string;
  token?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ── STEP 1: Read localStorage synchronously ───────────────
    let storedUser: UserData | null = null;
    try {
      const raw = localStorage.getItem('smartbuy_user');
      if (raw) storedUser = JSON.parse(raw);
    } catch (e) {
      console.error('[Auth] Failed to parse stored user:', e);
      localStorage.removeItem('smartbuy_user');
    }

    if (storedUser) {
      console.log('[Auth] Restored user from localStorage:', storedUser.email, '| role:', storedUser.role);
      setUser(storedUser);
    }
    
    setLoading(false);
  }, []);

  // ── Protected route guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return; // Never redirect while still resolving auth state

    if (pathname.startsWith('/admin')) {
      if (!user) {
        console.log('[Auth] No user → redirecting /admin → /login');
        router.replace('/login');
        return;
      }
      if (user.role !== 'admin') {
        console.log('[Auth] Non-admin user → redirecting /admin → /');
        router.replace('/');
        return;
      }
    }

    // Redirect already-logged-in users away from auth pages
    if (user && (pathname === '/login' || pathname === '/register')) {
      const dest = user.role === 'admin' ? '/admin' : '/';
      console.log('[Auth] Already logged in → redirecting to', dest);
      router.replace(dest);
    }
  }, [user, loading, pathname, router]);

  // ── login / logout ────────────────────────────────────────────────────────
  const login = (userData: UserData) => {
    console.log('[Auth] login() called for:', userData.email, '| role:', userData.role);
    localStorage.setItem('smartbuy_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    console.log('[Auth] logout() called');
    setUser(null);
    localStorage.removeItem('smartbuy_user');
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
