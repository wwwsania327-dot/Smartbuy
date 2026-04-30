"use client";

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1120] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-black uppercase tracking-[0.2em] mb-4"
          >
            Support Center
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
          >
            How Can We <span className="text-emerald-600">Help You?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Whether you have a question about products, delivery, or anything else, our team is ready to answer all your questions.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Details */}
          <div className="space-y-8 lg:pr-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                {[
                  { icon: Mail, title: 'Email Us', detail: 'support@smartbuy.com', sub: 'We reply within 2 hours' },
                  { icon: Phone, title: 'Call Us', detail: '+91 123 456 7890', sub: 'Available 7 AM - 10 PM' },
                  { icon: Clock, title: 'Working Hours', detail: '7 Days a Week', sub: 'Including Holidays' },
                  { icon: MapPin, title: 'Our Location', detail: 'Knowledge Park, Greater Noida', sub: 'Uttar Pradesh, India' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                      <p className="text-emerald-600 font-bold text-base mt-0.5">{item.detail}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-8 rounded-[2rem] bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
               <MessageCircle className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
               <h4 className="text-xl font-bold mb-3 relative z-10">Chat Support</h4>
               <p className="text-emerald-50 text-sm mb-6 relative z-10 leading-relaxed">
                 Need instant help? Our WhatsApp support is available for quick resolutions.
               </p>
               <button className="bg-white text-emerald-600 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:scale-105 transition-transform relative z-10">
                 Start WhatsApp Chat
               </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-premium"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h2>
                  <p className="text-gray-500 dark:text-gray-400">Thank you for reaching out. We will get back to you shortly.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-emerald-600 font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formState.name}
                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                        placeholder="e.g. John Doe"
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                        placeholder="e.g. john@example.com"
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Your Message</label>
                    <textarea 
                      required
                      rows={6}
                      value={formState.message}
                      onChange={(e) => setFormState({...formState, message: e.target.value})}
                      placeholder="How can we help you today?"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className={`w-full md:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                    {!isSubmitting && <Send className="w-5 h-5" />}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
