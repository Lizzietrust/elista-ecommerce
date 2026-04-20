"use client";

import { useCampaign } from "@/lib/hooks/use-campaign";
import CampaignCountdown from "./CampaignCountdown";
import { X } from "lucide-react";
import { useState } from "react";

export default function CampaignBanner() {
  const { activeCampaign, timeRemaining, isLoading } = useCampaign();
  const [isVisible, setIsVisible] = useState(true);

  if (
    isLoading ||
    !activeCampaign ||
    !activeCampaign.displayOnHomepage ||
    !isVisible
  ) {
    return null;
  }

  const discountText =
    activeCampaign.discountType === "percentage"
      ? `${activeCampaign.discountValue}% OFF`
      : `$${activeCampaign.discountValue} OFF`;

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: activeCampaign.bannerColor || "#FF6B6B" }}
    >
      <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent"></div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-white">
              🔥 LIMITED TIME
            </span>

            <div className="text-white">
              <span className="font-bold">{discountText}</span>
              {activeCampaign.bannerText && (
                <span className="ml-2">{activeCampaign.bannerText}</span>
              )}
            </div>

            {activeCampaign.endDate && (
              <CampaignCountdown
                endDate={activeCampaign.endDate}
                size="small"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all">
              Shop Now →
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30">
        <div
          className="h-full bg-white animate-progress"
          style={{
            width: `${timeRemaining?.days ? 100 - (timeRemaining.days / 30) * 100 : 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
