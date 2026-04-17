/**
 * lib/products.ts — Single source of truth for product data.
 *
 * Data flows:
 *   Admin Panel → POST/PUT /api/products → Backend MongoDB
 *   Frontend    → GET /api/products      → Backend MongoDB (via Next.js proxy)
 *
 * No more localStorage merging. The backend IS the source of truth.
 * Image resolution: p.image → p.images[0].url → ''
 */

export interface Product {
  id: string;
  _id: string;
  name: string;
  image: string;       // always resolved
  images?: { url: string }[];
  price: number;
  originalPrice?: number;
  discount?: number;
  discountPrice?: number;
  category?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
  description?: string;
  weight?: string;
}

/**
 * Normalizes a raw product object from the backend into a standard Product interface.
 * Ensures 'id', 'price' (sale price), and 'image' are always populated.
 */
export function normalizeProduct(p: any): Product {
  // Logic: 
  // 1. Backend 'price' is typically the MRP (Original Price)
  // 2. Backend 'discountPrice' (if > 0) is the Sale Price (Active Price)
  const originalPrice = Number(p.price || 0);
  const salePrice = (p.discountPrice && p.discountPrice > 0) ? Number(p.discountPrice) : originalPrice;
  
  const image = p.image || (p.images && p.images[0]?.url) || '';

  return {
    ...p,
    id: String(p._id || p.id),
    originalPrice,
    price: salePrice,
    image
  };
}

/**
 * Fetch all products from the backend (via /api/products proxy).
 * Returns a flat array of normalised Product objects.
 */
export async function fetchMergedProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' });
    if (!res.ok) throw new Error(`/api/products returned ${res.status}`);

    const data = await res.json();
    const rawProducts = data.products || (Array.isArray(data) ? data : []);

    const products: Product[] = rawProducts.map((p: any) => normalizeProduct(p));

    console.log(`[SmartBuy] fetchMergedProducts → ${products.length} products normalized from backend`);
    return products;
  } catch (err) {
    console.error('[SmartBuy] fetchMergedProducts error:', err);
    return [];
  }
}

/**
 * Fetch a single product by ID from the backend.
 * Returns null if not found or backend is unreachable.
 */
export async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    // Try the direct single-product endpoint first (more efficient)
    const res = await fetch(`/api/products/${productId}`, { cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();
      const product = normalizeProduct(data);
      console.log(`[SmartBuy] fetchProductById(${productId}) normalized → "${product.name}" price=${product.price}`);
      return product;
    }

    // Fallback: search the full list
    console.warn(`[SmartBuy] fetchProductById(${productId}) → direct fetch failed (${res.status}), searching list...`);
    const all = await fetchMergedProducts();
    const found = all.find(p => p.id === productId || p._id === productId) ?? null;

    if (found) {
      console.log(`[SmartBuy] fetchProductById(${productId}) found in list → "${found.name}"`);
    } else {
      console.warn(`[SmartBuy] fetchProductById(${productId}) → NOT FOUND`);
    }

    return found;
  } catch (err) {
    console.error(`[SmartBuy] fetchProductById(${productId}) error:`, err);
    return null;
  }
}
