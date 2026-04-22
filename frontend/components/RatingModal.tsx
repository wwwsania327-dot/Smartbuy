"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RatingModal({ isOpen, onClose }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast("Please select a rating", "error");
      return;
    }
    
    // Simulate API call
    console.log("Submitting rating:", { rating, feedback });
    setSubmitted(true);
    
    setTimeout(() => {
      toast("Thanks for your feedback!", "success");
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setRating(0);
      setFeedback('');
      setSubmitted(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl pointer-events-auto relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!submitted ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                      <Star className="w-8 h-8 fill-current" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight">Rate your experience</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Your feedback helps us improve SmartBuy for everyone.
                    </p>
                  </div>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star 
                          className={`w-10 h-10 transition-all duration-200 ${
                            (hoverRating || rating) >= star 
                              ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                              : 'text-gray-200 dark:text-gray-700'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {/* Feedback Textarea */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                        Tell us more (optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What can we do better?"
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                    >
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Submit Feedback
                    </button>
                  </form>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-2">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Thank You!</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[240px] mx-auto leading-relaxed">
                    We've received your rating. We're constantly working to make SmartBuy better.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
