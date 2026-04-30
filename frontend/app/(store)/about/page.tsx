"use client";

import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Truck, Zap, Star, Layout, Database, Server, Globe } from 'lucide-react';

export default function AboutPage() {
  const features = [
    { 
      title: 'Lightning Fast Delivery', 
      desc: 'Get your groceries delivered to your doorstep within 30-60 minutes.', 
      icon: Zap,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    { 
      title: 'Best Deals & Prices', 
      desc: 'We offer competitive pricing and exclusive daily deals for our members.', 
      icon: Star,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    { 
      title: 'User-Friendly Experience', 
      desc: 'Our platform is designed for simplicity, making shopping a breeze.', 
      icon: Layout,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
  ];

  const techStack = [
    { name: 'Next.js', desc: 'Powerful Frontend Framework', icon: Globe },
    { name: 'Node.js', desc: 'Robust Backend Runtime', icon: Server },
    { name: 'MongoDB', desc: 'Scalable NoSQL Database', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1120] pb-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/10 dark:to-[#0b1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-sm font-bold mb-6"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Modern E-Commerce Excellence</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight"
            >
              Welcome to <span className="text-emerald-600">SmartBuy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              SmartBuy is a cutting-edge e-commerce platform dedicated to providing a seamless, fast, and secure shopping experience for fresh groceries and daily essentials.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose Us?</h2>
          <div className="w-20 h-1.5 bg-emerald-500 mx-auto mt-4 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`inline-flex p-4 rounded-2xl ${feature.bg} ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Built with Modern Tech</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {techStack.map((tech, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-emerald-500 mb-4 border border-gray-100 dark:border-gray-700">
                  <tech.icon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{tech.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-24 max-w-5xl mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-emerald-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-emerald-500/20"
        >
          <ShieldCheck className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Safe & Secure Shopping</h2>
          <p className="text-emerald-50 max-w-2xl mx-auto leading-relaxed text-lg">
            Your privacy and security are our top priorities. We use industry-standard encryption and secure payment gateways to ensure your data is always protected.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
