'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Fresh Fruits',
    slug: 'fruits',
    image: '/categories/fruits.png',
    bg: 'from-rose-50 to-red-100',
    ring: 'ring-rose-200',
    shadow: 'shadow-rose-100',
  },
  {
    name: 'Vegetables',
    slug: 'vegetables',
    image: '/categories/vegetables.png',
    bg: 'from-green-50 to-emerald-100',
    ring: 'ring-emerald-200',
    shadow: 'shadow-emerald-100',
  },
  {
    name: 'Dairy & Eggs',
    slug: 'dairy',
    image: '/categories/dairy.png',
    bg: 'from-yellow-50 to-amber-100',
    ring: 'ring-amber-200',
    shadow: 'shadow-amber-100',
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    image: '/categories/bakery.png',
    bg: 'from-orange-50 to-orange-100',
    ring: 'ring-orange-200',
    shadow: 'shadow-orange-100',
  },
  {
    name: 'Meat & Fish',
    slug: 'meat-fish',
    image: '/categories/meat.png',
    bg: 'from-red-50 to-rose-100',
    ring: 'ring-red-200',
    shadow: 'shadow-red-100',
  },
  {
    name: 'Snacks',
    slug: 'snacks',
    image: '/categories/snacks.png',
    bg: 'from-purple-50 to-violet-100',
    ring: 'ring-violet-200',
    shadow: 'shadow-violet-100',
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    image: '/categories/beverages.png',
    bg: 'from-sky-50 to-blue-100',
    ring: 'ring-blue-200',
    shadow: 'shadow-blue-100',
  },
  {
    name: 'Frozen Foods',
    slug: 'frozen-foods',
    image: '/categories/frozen.png',
    bg: 'from-cyan-50 to-teal-100',
    ring: 'ring-cyan-200',
    shadow: 'shadow-cyan-100',
  },
  {
    name: 'Breakfast',
    slug: 'breakfast',
    image: '/categories/breakfast.png',
    bg: 'from-amber-50 to-yellow-100',
    ring: 'ring-yellow-200',
    shadow: 'shadow-yellow-100',
  },
  {
    name: 'Organic',
    slug: 'organic',
    image: '/categories/organic.png',
    bg: 'from-lime-50 to-green-100',
    ring: 'ring-lime-200',
    shadow: 'shadow-lime-100',
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    image: '/categories/personal-care.png',
    bg: 'from-pink-50 to-rose-100',
    ring: 'ring-pink-200',
    shadow: 'shadow-pink-100',
  },
  {
    name: 'Cleaning',
    slug: 'cleaning',
    image: '/categories/cleaning.png',
    bg: 'from-indigo-50 to-violet-100',
    ring: 'ring-indigo-200',
    shadow: 'shadow-indigo-100',
  },
];

export default function ShopByCategory() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">
            Shop by Category
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
            Explore our wide variety of fresh items
          </p>
        </div>
        <Link
          href="/categories"
          className="hidden sm:inline-flex items-center gap-1 text-[var(--color-primary)] font-semibold text-sm hover:gap-2 transition-all duration-200"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="group"
          >
            <div
              className={`
                flex flex-col items-center text-center
                bg-white dark:bg-[#1e293b]
                rounded-2xl p-4 sm:p-5
                border border-[var(--color-border)]
                shadow-sm hover:shadow-xl
                ${category.shadow}
                transition-all duration-300 ease-out
                hover:-translate-y-1.5
                cursor-pointer
              `}
            >
              {/* Circular image */}
              <div
                className={`
                  relative w-20 h-20 sm:w-24 sm:h-24
                  rounded-full overflow-hidden
                  bg-gradient-to-br ${category.bg}
                  ring-2 ${category.ring}
                  mb-3.5
                  group-hover:scale-105
                  transition-transform duration-300
                  flex-shrink-0
                `}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>

              {/* Category name */}
              <span className="text-[13px] sm:text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors duration-200 leading-tight">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile "View All" link */}
      <div className="sm:hidden mt-5 text-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-[var(--color-primary)] font-semibold text-sm"
        >
          View All Categories <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
