"use client";

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
    </div>
  );
}
