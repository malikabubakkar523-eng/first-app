"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface DealsCountdownProps {
  targetDate: string | Date;
}

export function DealsCountdown({ targetDate }: DealsCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5" />
        Offer Ended
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Days */}
      <div className="flex flex-col items-center">
        <div className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl bg-zinc-900/90 dark:bg-zinc-800 text-white font-mono font-bold text-base sm:text-xl flex items-center justify-center border border-zinc-800 shadow-md">
          {String(timeLeft.days).padStart(2, "0")}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mt-1">Days</span>
      </div>

      <span className="text-zinc-600 font-bold text-lg mb-4">:</span>

      {/* Hours */}
      <div className="flex flex-col items-center">
        <div className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl bg-zinc-900/90 dark:bg-zinc-800 text-white font-mono font-bold text-base sm:text-xl flex items-center justify-center border border-zinc-800 shadow-md">
          {String(timeLeft.hours).padStart(2, "0")}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mt-1">Hours</span>
      </div>

      <span className="text-zinc-600 font-bold text-lg mb-4">:</span>

      {/* Mins */}
      <div className="flex flex-col items-center">
        <div className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl bg-zinc-900/90 dark:bg-zinc-800 text-white font-mono font-bold text-base sm:text-xl flex items-center justify-center border border-zinc-800 shadow-md">
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mt-1">Mins</span>
      </div>

      <span className="text-zinc-600 font-bold text-lg mb-4">:</span>

      {/* Secs */}
      <div className="flex flex-col items-center">
        <div className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl bg-brand-500 text-white font-mono font-bold text-base sm:text-xl flex items-center justify-center shadow-md shadow-brand-500/20">
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-500 mt-1">Secs</span>
      </div>
    </div>
  );
}
