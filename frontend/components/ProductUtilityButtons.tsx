"use client";

import React, { useState } from 'react';
import { Heart, Share2, MessageCircle, X } from 'lucide-react';
import { useWishlist, WishlistProduct } from '../context/WishlistContext';

export function WishlistButton({ product }: { product: WishlistProduct }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(product._id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      className={`absolute top-2 right-2 p-1.5 rounded-full z-20 backdrop-blur-md shadow-sm transition-all focus:outline-none ${
        active 
          ? "bg-red-50 text-red-500 scale-110" 
          : "bg-white/70 text-gray-400 hover:text-red-400 hover:bg-white"
      }`}
    >
      <Heart className={`w-5 h-5 transition-colors ${active ? "fill-red-500 text-red-500" : ""}`} />
    </button>
  );
}

export function ShareButton({ product }: { product: WishlistProduct }) {
  const [showModal, setShowModal] = useState(false);

  const getProductUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/product/${product._id}`;
    }
    return `https://smartbuy.com/product/${product._id}`;
  };

  const shareText = `Check out this product: ${product.name} - ₹${product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price}`;
  const shareUrl = getProductUrl();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SmartBuy",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      setShowModal(true);
    }
  };

  const openWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(waUrl, "_blank");
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="absolute top-10 right-2 p-1.5 mt-2 rounded-full z-20 bg-white/70 backdrop-blur-md shadow-sm text-gray-500 hover:text-indigo-500 transition-all focus:outline-none hover:bg-white"
        title="Share"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Fallback Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4 text-[var(--color-foreground)]">Share Product</h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2">{product.name}</p>
            
            <div className="flex flex-col gap-3">
              <button onClick={openWhatsApp} className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#1ebd5a] transition-colors">
                <MessageCircle className="w-5 h-5" /> Share via WhatsApp
              </button>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                  setShowModal(false);
                }} 
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-[var(--color-foreground)] py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
