"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, ArrowLeft, Heart, Share2, ShieldCheck, Clock, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../../../../context/CartContext';
import { useWishlist } from '../../../../context/WishlistContext';
import { fetchProductById, Product } from '../../../../lib/products';

// Re-use the shared Product type
type ProductData = Product;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  console.log(`[ProductDetailPage] Params ID:`, productId);

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState("1 Pack");

  const { addToCart, cart, updateQuantity } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(false);

        const found = await fetchProductById(productId);

        if (found) {
          setProduct(found);
        } else {
          console.warn('[PDP] Product not found for id:', productId);
          setError(true);
        }
      } catch (err) {
        console.error('[PDP] Error loading product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (productId) load();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🥝</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Product Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The item you are looking for isn't available or the link is incorrect.</p>
        <button 
          onClick={() => router.push('/products')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  const inStock = product.stock !== undefined ? product.stock > 0 : true;
  const isWishlistedProduct = isWishlisted(product.id);

  // Determine cart state
  const cartItem = cart.find(item => String(item.product.id) === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  let discountPercentage = 0;
  if (product.originalPrice && product.originalPrice > product.price) {
    discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buy ${product.name} at SmartBuy`,
          text: `Check out ${product.name} on SmartBuy!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-10 relative">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 md:my-6 md:rounded-2xl md:shadow-lg overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Navigation / Header - Mobile Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10 md:hidden">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare} className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </button>
            <button 
              onClick={() => {
                const catName = typeof product.category === 'object' ? (product.category as any)?.name : (product.category || '');
                toggleWishlist({ 
                  _id: product.id, 
                  name: product.name, 
                  price: product.price, 
                  images: [{ url: product.image }], 
                  category: catName
                });
              }}
              className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
            >
              <Heart className={`w-5 h-5 ${isWishlistedProduct ? 'fill-red-500 text-red-500' : 'text-gray-800 dark:text-gray-200'}`} />
            </button>
          </div>
        </div>

        {/* Product Image Viewer */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-900/50 flex flex-col">
          {/* Desktop Back button */}
          <div className="hidden md:flex p-4">
            <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium text-sm transition">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>

          <div className="relative w-full pt-[90%] md:pt-[100%]">
            <Image 
              src={product.image} 
              alt={product.name} 
              fill
              className="absolute inset-0 object-contain p-8 md:p-12 z-0"
              priority
            />
          </div>
          
          {/* Mock Image Thumbnails (Static for visual) */}
          <div className="flex justify-center gap-3 p-4 -mt-6 z-10 relative">
            <div className="w-12 h-12 rounded-xl border-2 border-green-500 bg-white p-1 overflow-hidden shadow-sm">
              <img src={product.image} alt="thumb" className="w-full h-full object-contain" />
            </div>
            <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 p-1 overflow-hidden opacity-60">
              <img src={product.image} alt="thumb 2" className="w-full h-full object-contain filter grayscale" />
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col">
          {/* Tag & Share Desktop */}
          <div className="hidden md:flex justify-between items-center mb-2">
            {product.category && (
              <span className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-1 rounded tracking-wide uppercase">
                {typeof product.category === 'object' ? (product.category as any)?.name : product.category}
              </span>
            )}
            <div className="flex gap-3">
              <button onClick={handleShare} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const catName = typeof product.category === 'object' ? (product.category as any)?.name : (product.category || '');
                  toggleWishlist({ 
                    _id: product.id, 
                    name: product.name, 
                    price: product.price, 
                    images: [{ url: product.image }], 
                    category: catName
                  });
                }}
                className={`${isWishlistedProduct ? 'text-red-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                <Heart className={`w-5 h-5 ${isWishlistedProduct ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
            {product.name}
          </h1>

          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            {!inStock ? (
               <span className="text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded">Out of stock</span>
            ) : (
               <span className="text-green-600 font-bold flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                 <Check className="w-3.5 h-3.5 mr-1" /> Available
               </span>
            )}
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 10 MINS DELIVERY
            </span>
          </div>

          {/* Pricing & Offers Box */}
          <div className="border border-green-100 dark:border-green-900/50 bg-gradient-to-r from-green-50/50 to-emerald-50/20 dark:from-green-900/10 dark:to-emerald-900/5 rounded-2xl p-4 mb-6 shadow-sm">
            {discountPercentage > 0 && (
              <div className="inline-flex items-center bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 shadow-sm uppercase tracking-wide">
                <span>{discountPercentage}% OFF</span>
              </div>
            )}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-gray-400 line-through mb-1 font-medium">
                  MRP ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">(Inclusive of all taxes)</p>

            {/* XtraSaver promo tag mockup */}
            <div className="mt-3 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-2 border border-green-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">XtraSaver Benefits</p>
                  <p className="text-[10px] text-gray-500">Free delivery on this item</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </div>

          {/* Pack Options (Mockup functionality) */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wider">Select Unit</h3>
            <div className="flex gap-3">
              {['1 Pack', '2 Packs', '500g Pack'].map((weight) => (
                <button
                  key={weight}
                  onClick={() => setSelectedWeight(weight)}
                  className={`border-2 rounded-xl py-2 px-4 font-semibold text-sm transition-all focus:outline-none ${
                    selectedWeight === weight 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-grow hidden md:block"></div>

          {/* Desktop Add to Cart Button */}
          <div className="hidden md:flex gap-4 items-center border-t border-gray-100 dark:border-gray-700 pt-6 mt-auto">
            {!inStock ? (
               <div className="flex-1 bg-gray-100 text-gray-500 dark:bg-gray-800 text-center py-3.5 rounded-xl font-bold uppercase tracking-wide cursor-not-allowed border border-gray-200 dark:border-gray-700">Out of Stock</div>
            ) : quantityInCart === 0 ? (
                <button 
                 onClick={() => {
                   console.log("PDP Desktop - Adding to Cart Payload:", { id: product.id, name: product.name });
                   addToCart({ id: product.id, name: product.name, price: product.price, discount: product.price, image: product.image, weight: selectedWeight, category: typeof product.category === 'object' ? (product.category as any)?.name : (product.category || '') });
                 }}
                  className="flex-1 bg-[#ff9f00] hover:bg-[#f39800] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 uppercase tracking-wide shadow-md transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 fill-current" />
                  Add to Cart
                </button>
            ) : (
               <div className="flex-1 flex items-center justify-between border-2 border-green-600 rounded-xl overflow-hidden shadow-sm h-[52px]">
                 <button onClick={() => updateQuantity(product.id, quantityInCart - 1)} className="w-14 h-full bg-green-50 hover:bg-green-100 text-green-700 font-extrabold text-xl transition">-</button>
                 <span className="font-extrabold text-green-700 w-12 text-center">{quantityInCart}</span>
                 <button onClick={() => updateQuantity(product.id, quantityInCart + 1)} className="w-14 h-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xl transition">+</button>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white dark:bg-[#0b1120] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-40 rounded-t-2xl">
         {!inStock ? (
            <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold text-center uppercase tracking-wide border border-gray-200 dark:border-gray-700">Out of Stock</div>
         ) : quantityInCart === 0 ? (
             <button 
               onClick={() => {
                 console.log("PDP Mobile - Adding to Cart Payload:", { id: product.id, name: product.name });
                 addToCart({ id: product.id, name: product.name, price: product.price, discount: product.price, image: product.image, weight: selectedWeight, category: typeof product.category === 'object' ? (product.category as any)?.name : (product.category || '') });
               }}
               className="w-full bg-[#ff9f00] active:bg-[#e68f00] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg transform active:scale-[0.98] transition-transform"
             >
               <ShoppingCart className="w-5 h-5 fill-current" />
               Add to Cart
             </button>
         ) : (
             <div className="w-full flex justify-between items-center bg-green-600 rounded-xl shadow-lg h-[50px] overflow-hidden">
                <button onClick={() => updateQuantity(product.id, quantityInCart - 1)} className="h-full px-6 flex items-center justify-center active:bg-green-700 transition">
                  <span className="text-white text-2xl font-bold leading-none -mt-1">-</span>
                </button>
                <span className="text-white font-extrabold">{quantityInCart} in cart</span>
                <button onClick={() => updateQuantity(product.id, quantityInCart + 1)} className="h-full px-6 flex items-center justify-center active:bg-green-700 transition">
                  <span className="text-white text-2xl font-bold leading-none -mt-0.5">+</span>
                </button>
             </div>
         )}
      </div>

    </div>
  );
}
