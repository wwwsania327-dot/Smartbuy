/**
 * lib/api.ts
 * 
 * Central utility for making API requests with automatic JWT authentication.
 * 
 * Features:
 * - Automatically attaches 'Authorization: Bearer <token>' if found in localStorage.
 * - Handles JSON serialization/deserialization.
 * - Global 401 Unauthorized handling (automatic logout).
 */

export interface FetchOptions extends RequestInit {
  body?: any;
}

export async function fetchApi(url: string, options: FetchOptions = {}) {
  // 1. Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 2. Prepare headers
  const headers = new Headers(options.headers || {});
  
  // Set default Content-Type if body is present and not already set
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach token if available
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 3. Prepare config
  const config: RequestInit = {
    ...options,
    headers,
  };

  // Stringify body if it's an object
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    // 4. Handle 401 Unauthorized globally
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        console.warn('[API] 401 Unauthorized detected. Clearing session...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if we are not already on the login page to avoid loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    return response;
  } catch (error) {
    console.error(`[API] Fetch error for ${url}:`, error);
    throw error;
  }
}

/**
 * User Account Management API Wrappers
 */

// Profile & Settings
export const updateProfile = (data: { name?: string, email?: string }) => 
  fetchApi('/api/users/profile', { method: 'PUT', body: data });

export const updateSettings = (data: { darkMode?: boolean, notificationsEnabled?: boolean, language?: string }) => 
  fetchApi('/api/users/settings', { method: 'PUT', body: data });

// Addresses
export const getAddresses = () => fetchApi('/api/auth/profile').then(res => res.json()).then(data => data.addresses || []);
export const addAddress = (data: any) => fetchApi('/api/users/addresses', { method: 'POST', body: data });
export const updateAddress = (id: string, data: any) => fetchApi(`/api/users/addresses/${id}`, { method: 'PUT', body: data });
export const deleteAddress = (id: string) => fetchApi(`/api/users/addresses/${id}`, { method: 'DELETE' });
export const setDefaultAddress = (id: string) => fetchApi(`/api/users/addresses/${id}/default`, { method: 'PUT' });

// Notifications
export const getNotifications = () => fetchApi('/api/users/notifications').then(res => res.json());
export const markNotificationRead = (id: string) => fetchApi(`/api/users/notifications/${id}/read`, { method: 'PUT' });
export const clearNotifications = () => fetchApi('/api/users/notifications', { method: 'DELETE' });

// Coupons
export const getCoupons = () => fetchApi('/api/coupons').then(res => res.json());
export const createCoupon = (data: any) => fetchApi('/api/coupons', { method: 'POST', body: data });
export const updateCoupon = (id: string, data: any) => fetchApi(`/api/coupons/${id}`, { method: 'PUT', body: data });
export const deleteCoupon = (id: string) => fetchApi(`/api/coupons/${id}`, { method: 'DELETE' });
