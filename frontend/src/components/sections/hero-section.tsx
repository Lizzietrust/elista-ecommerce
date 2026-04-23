"use client";

import { useCampaign } from "@/lib/hooks/use-campaign";
import CampaignCountdown from "../campaign/CampaignCountdown";
import {
  Flame,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  LayoutGrid,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  const { activeCampaign, timeRemaining } = useCampaign();

  return (
    <section className="relative bg-linear-to-br from-primary via-primary-light to-accent text-white py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-2xl">
          {/* Dynamic Limited Time Offer Badge */}
          {activeCampaign ? (
            <div className="inline-flex flex-col items-start gap-3 mb-8">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg border border-white/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-light opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-light"></span>
                </span>
                <span className="text-secondary-light text-sm font-semibold tracking-wide flex items-center gap-1">
                  <Flame className="w-4 h-4 inline" />
                  {activeCampaign.discountType === "percentage"
                    ? `${activeCampaign.discountValue}% OFF`
                    : `$${activeCampaign.discountValue} OFF`}
                  {activeCampaign.bannerText &&
                    ` - ${activeCampaign.bannerText}`}
                </span>
              </div>

              {activeCampaign.endDate && (
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                  <CampaignCountdown
                    endDate={activeCampaign.endDate}
                    size="small"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-secondary-light" />
              <span className="text-secondary-light text-sm font-medium">
                Limited Time Offer
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Discover{" "}
            <span className="text-secondary-light">Amazing Products</span>
          </h1>

          <p className="text-xl mb-8 text-secondary-light">
            Shop the latest trends with exclusive deals. Free shipping on orders
            over $50.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <button className="group bg-white text-primary font-semibold py-3 px-8 rounded-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 transition-all duration-300">
                <ShoppingBag className="w-5 h-5" />
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>

            <Link href="/categories">
              <button className="group bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                <span>View Collections</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary-light/30 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      {/* Animated particles */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
    </section>
  );
}
