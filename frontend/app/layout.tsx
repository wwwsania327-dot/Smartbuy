import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SmartBuy - Modern Grocery Shopping',
  description: 'Your one-stop destination for fresh groceries delivered right to your doorstep.',
};

import SplashScreen from '../components/SplashScreen';
import { ThemeProvider } from '../components/ThemeProvider';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { WishlistProvider } from '../context/WishlistContext';
import { OrderProvider } from '../context/OrderContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen selection:bg-[var(--color-primary)] selection:text-white">
        {/* Aesthetic Background Elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="aura top-[-10%] left-[-10%] bg-green-400/20 dark:bg-emerald-500/10" />
          <div className="aura bottom-[-10%] right-[-10%] bg-emerald-400/20 dark:bg-green-500/10 [animation-delay:-5s]" />
          <div className="aura top-[20%] right-[-5%] w-[40vmax] h-[40vmax] bg-orange-300/10 dark:bg-orange-500/5 [animation-delay:-10s]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0)_0%,var(--background)_100%)] opacity-50" />
        </div>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <AuthProvider>
              <WishlistProvider>
                <OrderProvider>
                  <SplashScreen />
                  <div className="relative z-10 flex-grow flex flex-col">
                    {children}
                  </div>
                </OrderProvider>
              </WishlistProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
