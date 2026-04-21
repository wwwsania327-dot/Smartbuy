import Link from 'next/link';
import { Globe, Mail, MessageCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0f172a] border-t border-[var(--color-border)] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl leading-none tracking-tight text-[var(--color-foreground)]">
                  Smart<span className="text-[var(--color-primary)]">Buy</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-0.5">
                  Organic & Fresh
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Your one-stop destination for fresh groceries delivered right to your doorstep. Freshness guaranteed!
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe, href: '#' },
                { icon: MessageCircle, href: '#' },
                { icon: Mail, href: '#' }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          
          <div>
            <h3 className="font-bold text-[var(--color-foreground)] mb-6 text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/" className="hover:text-[var(--color-primary)] transition-all duration-200 hover:pl-1">Home</Link></li>
              <li><Link href="/products" className="hover:text-[var(--color-primary)] transition-all duration-200 hover:pl-1">All Products</Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-primary)] transition-all duration-200 hover:pl-1">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--color-primary)] transition-all duration-200 hover:pl-1">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[var(--color-foreground)] mb-6 text-sm uppercase tracking-widest">Categories</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/categories/fruits" className="hover:text-[var(--color-primary)] transition-all duration-200 hover:pl-1">Fresh Fruits</Link></li>
              <li><Link href="/categories/vegetables" className="hover:text-[var(--color-primary)] transition-all duration-200 hover:pl-1">Vegetables</Link></li>
              <li><Link href="/categories/dairy" className="hover:text-[var(--color-primary)] transition-all duration-200 hover:pl-1">Dairy & Eggs</Link></li>
              <li><Link href="/categories/bakery" className="hover:text-[var(--color-primary)] transition-all duration-200 hover:pl-1">Bakery</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[var(--color-foreground)] mb-6 text-sm uppercase tracking-widest">Newsletter</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Join 5,000+ shoppers for exclusive weekly offers!
            </p>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full ring-1 ring-gray-200 dark:ring-gray-700 focus-within:ring-[var(--color-primary)] transition-all">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-transparent px-4 py-2 text-sm text-[var(--color-foreground)] outline-none placeholder:text-gray-500"
              />
              <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md active:scale-95">
                Join
              </button>
            </div>
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-10 border-t border-b border-[var(--color-border)] my-12">
          {[
            { icon: Truck, title: 'Superfast Delivery', desc: 'Within 10-30 mins' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% safe checkout' },
            { icon: RotateCcw, title: 'Easy Returns', desc: 'No questions asked' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[var(--color-foreground)]">{item.title}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom Strip */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 pb-2 text-[13px] text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} SmartBuy. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
