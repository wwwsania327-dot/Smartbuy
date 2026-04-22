"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail, MessageCircle, ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const faqs = [
  {
    question: "How to place an order?",
    answer: "Placing an order is easy! Just browse our products, add your favorite items to the cart, and proceed to checkout. Fill in your delivery details, choose a payment method, and confirm your order."
  },
  {
    question: "How to cancel an order?",
    answer: "You can cancel your order within 30 minutes of placing it from the 'My Orders' section. If the order has already been processed or dispatched, please contact our support team for assistance."
  },
  {
    question: "Payment methods supported",
    answer: "We support a wide range of payment methods including Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD) in select locations."
  },
  {
    question: "What is the estimated delivery time?",
    answer: "Delivery typically takes 30-60 minutes for fresh groceries within our service areas. You can track your order in real-time from the 'My Orders' section."
  },
  {
    question: "Do you deliver on weekends?",
    answer: "Yes! We deliver every day of the week, including weekends and holidays, from 7 AM to 10 PM."
  },
  {
    question: "Is there a minimum order value?",
    answer: "There is no strict minimum order value, but orders below ₹200 may incur a small delivery fee."
  }
];

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group transition-all"
      >
        <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-[#0b1120] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-extrabold tracking-tight">Help & FAQs</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-8">
        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-premium border border-gray-100 dark:border-gray-700">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Frequently Asked</h2>
          <div className="flex flex-col">
            {filteredFaqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
            {filteredFaqs.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">
                No matching questions found.
              </div>
            )}
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">Still need help?</h2>
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="mailto:support@smartbuy.com"
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:border-emerald-500 transition-all group shadow-sm"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold">Email Us</span>
            </a>
            <a 
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:border-emerald-500 transition-all group shadow-sm"
            >
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold">WhatsApp</span>
            </a>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-4">
          Our support team is available 24/7
        </p>
      </div>
    </div>
  );
}
