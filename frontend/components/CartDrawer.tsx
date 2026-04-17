"use client";

import React from "react";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    updateQuantity, 
    removeFromCart, 
    cartTotal 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            My Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
          </h2>
          <button 
            onClick={toggleCart}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <div className="text-6xl">🛒</div>
              <p>Your cart is empty!</p>
              <button 
                onClick={toggleCart}
                className="text-blue-600 font-semibold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                    {item.product.name}
                  </h3>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                    ₹{item.product.price.toLocaleString('en-IN')}
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium border-x border-gray-300 dark:border-gray-600">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-900 dark:text-white">
              <span>Total:</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <button className="w-full bg-[#fb641b] hover:bg-[#e05a18] text-white font-bold py-3 px-4 rounded shadow uppercase tracking-wide transition-colors">
              Place Order
            </button>
          </div>
        )}
      </div>
    </>
  );
}
