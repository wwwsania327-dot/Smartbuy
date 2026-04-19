"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
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
    // ── STEP 1: Read localStorage ──────────────────────────────
    let storedUser: UserData | null = null;
    try {
      const rawUser = localStorage.getItem('smartbuy_user');
      const token = localStorage.getItem('token');
      
      if (rawUser && token) {
        storedUser = JSON.parse(rawUser);
        // Ensure the token from localStorage is attached to the user object
        if (storedUser) storedUser.token = token;
      }
    } catch (e) {
      console.error('[Auth] Failed to restore session:', e);
      localStorage.removeItem('smartbuy_user');
      localStorage.removeItem('token');
    }

    if (storedUser) {
      console.log('[Auth] Restored user from localStorage:', storedUser.email);
      setUser(storedUser);
    }
    
    setLoading(false);
  }, []);

  // ── Protected route guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    if (pathname.startsWith('/admin')) {
      if (!user) {
        router.replace('/login');
        return;
      }
      // Allow both admin and superadmin
      const isAdminFlag = user.role === 'admin' || user.role === 'superadmin';
      if (!isAdminFlag) {
        console.warn(`[AuthGuard] Unauthorized access attempt to ${pathname} by ${user.role}`);
        router.replace('/');
        return;
      }
    }

    if (user && (pathname === '/login' || pathname === '/register')) {
      const isAdminFlag = user.role === 'admin' || user.role === 'superadmin';
      const dest = isAdminFlag ? '/admin' : '/';
      router.replace(dest);
    }
  }, [user, loading, pathname, router]);

  // ── login / logout ────────────────────────────────────────────────────────
  const login = (userData: UserData) => {
    console.log('[Auth] login() called');
    
    // Store token separately as requested
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    
    const { token, ...userWithoutToken } = userData;
    localStorage.setItem('smartbuy_user', JSON.stringify(userWithoutToken));
    
    setUser(userData);
  };

  const logout = () => {
    console.log('[Auth] logout() called');
    setUser(null);
    localStorage.removeItem('smartbuy_user');
    localStorage.removeItem('token');
    router.replace('/login');
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
