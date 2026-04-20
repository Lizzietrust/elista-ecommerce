"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  endDate: string | Date;
  onComplete?: () => void;
  size?: "small" | "medium" | "large";
}

export default function CampaignCountdown({
  endDate,
  onComplete,
  size = "medium",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        if (onComplete) onComplete();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  const sizeClasses = {
    small: "text-sm gap-1",
    medium: "text-base gap-2",
    large: "text-2xl gap-3",
  };

  const numberClasses = {
    small: "text-lg font-bold",
    medium: "text-2xl font-bold",
    large: "text-4xl font-bold",
  };

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return null;
  }

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]}`}>
      {timeLeft.days > 0 && (
        <div className="text-center">
          <div className={numberClasses[size]}>{timeLeft.days}</div>
          <div className="text-xs">Days</div>
        </div>
      )}
      {(timeLeft.hours > 0 || timeLeft.days > 0) && (
        <>
          <div className="text-xl font-bold">:</div>
          <div className="text-center">
            <div className={numberClasses[size]}>
              {String(timeLeft.hours).padStart(2, "0")}
            </div>
            <div className="text-xs">Hours</div>
          </div>
        </>
      )}
      <div className="text-xl font-bold">:</div>
      <div className="text-center">
        <div className={numberClasses[size]}>
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <div className="text-xs">Mins</div>
      </div>
      <div className="text-xl font-bold">:</div>
      <div className="text-center">
        <div className={numberClasses[size]}>
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <div className="text-xs">Secs</div>
      </div>
    </div>
  );
}
