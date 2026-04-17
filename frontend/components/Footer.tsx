import Link from 'next/link';
import { Globe, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0f172a] border-t border-[var(--color-border)] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-bold text-2xl tracking-tight text-[var(--color-primary)] flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                S
              </div>
              Smart<span className="text-[var(--color-foreground)]">Buy</span>
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your one-stop destination for fresh groceries delivered right to your doorstep in minutes.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors"><MessageCircle className="w-5 h-5" /></a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-[var(--color-foreground)] mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-[var(--color-primary)] transition-colors">All Products</Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--color-foreground)] mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/categories/fruits" className="hover:text-[var(--color-primary)] transition-colors">Fresh Fruits</Link></li>
              <li><Link href="/categories/vegetables" className="hover:text-[var(--color-primary)] transition-colors">Vegetables</Link></li>
              <li><Link href="/categories/dairy" className="hover:text-[var(--color-primary)] transition-colors">Dairy & Eggs</Link></li>
              <li><Link href="/categories/bakery" className="hover:text-[var(--color-primary)] transition-colors">Bakery</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--color-foreground)] mb-4">Newsletter</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Subscribe to get updates on our latest offers and fresh arrivals!
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="w-full px-3 py-2 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-l-md outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 text-sm font-medium rounded-r-md transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[var(--color-border)] mt-12 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} SmartBuy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
