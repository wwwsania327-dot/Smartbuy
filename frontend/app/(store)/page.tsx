import Link from 'next/link';
import { ArrowRight, Leaf, Truck, ShieldCheck, Clock } from 'lucide-react';
import ShopByCategory from '@/components/ShopByCategory';
import OfferZone from '@/components/OfferZone';
import ProductsPage from './products/page';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-[#0f172a] dark:to-[#1e293b] py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium mb-6 animate-pulse">
            <Leaf className="w-4 h-4" /> 100% Organic & Fresh
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-6">
            Farm fresh groceries, <br className="hidden md:block" />
            <span className="text-[var(--color-primary)]">delivered in minutes.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10">
            Skip the checkout lines! Get the freshest produce, dairy, and pantry staples delivered straight to your door with minimal hassle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/categories" className="bg-white dark:bg-gray-800 text-[var(--color-foreground)] hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 flex items-center justify-center border border-[var(--color-border)] shadow-sm">
              Explore Categories
            </Link>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: '10-Minute Delivery', desc: 'Superfast delivery at your doorstep' },
            { icon: ShieldCheck, title: 'Best Quality', desc: 'Sourced from the best organic farms' },
            { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹500. No hidden fees' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-[var(--color-border)] flex items-start gap-4 hover-lift">
              <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg text-[var(--color-primary)]">
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--color-foreground)] mb-1">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-gradient-to-r from-orange-400 to-rose-500 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Get 20% Off on your first order!</h2>
            <p className="text-white/80 text-lg mb-6">Use code <span className="font-mono bg-white/20 px-2 py-1 rounded font-bold">FRESH20</span> at checkout.</p>
            <Link href="/products" className="bg-white text-rose-500 px-8 py-3 rounded-full font-bold inline-block hover:scale-105 transition-transform shadow-lg">
              Claim Offer
            </Link>
          </div>
          <div className="text-9xl mt-8 md:mt-0 relative z-10 animate-pulse cursor-default">
            🛒
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>
        </div>
      </section>

      {/* Offer Zone */}
      <OfferZone />

      {/* Categories Grid */}
      <ShopByCategory />

      {/* All Products Grid */}
      <div className="mt-8">
        <ProductsPage />
      </div>

    </div>
  );
}
