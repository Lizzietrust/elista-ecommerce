"use client";

import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  id: string;
  name: string;
  count: number;
  icon?: string;
  image?: string;
  gradient?: string;
}

export default function CategoryCard({
  id,
  name,
  count,
  icon,
  image,
  gradient = "from-slate-700 to-slate-900",
}: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${id}`}
      className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 block"
    >
      {/* Background gradient */}
      <div className={`h-48 bg-linear-to-br ${gradient} relative`}>
        {/* Background image */}
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Persistent subtle dark scrim so text is always readable */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Hover scrim — deepens slightly, never goes full dark */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Content — always visible, shifts up gently on hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          {icon && (
            <span className="text-4xl mb-3 drop-shadow transition-transform duration-300 group-hover:-translate-y-1">
              {icon}
            </span>
          )}
          <h3 className="text-xl font-bold tracking-wide drop-shadow transition-transform duration-300 group-hover:-translate-y-1">
            {name}
          </h3>

          {/* "Shop Now" pill — hidden by default, fades in on hover */}
          <span className="mt-3 px-4 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/40 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            Shop Now →
          </span>
        </div>

        {/* Item count badge — top-right corner */}
        <div className="absolute top-3 right-3 z-10 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold py-0.5 px-2.5 rounded-full">
          {count}+
        </div>
      </div>
    </Link>
  );
}
