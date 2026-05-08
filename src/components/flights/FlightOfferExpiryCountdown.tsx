"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface FlightOfferExpiryCountdownProps {
  expires_at: string;
}

function getRemainingSeconds(iso: string): number {
  const end = Date.parse(iso);
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 1000));
}

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function FlightOfferExpiryCountdown({ expires_at }: FlightOfferExpiryCountdownProps) {
  const router = useRouter();
  const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(expires_at));
  const [isExpired, setIsExpired] = useState(() => getRemainingSeconds(expires_at) === 0);

  useEffect(() => {
    const initial = getRemainingSeconds(expires_at);
    setRemainingSeconds(initial);
    const alreadyExpired = initial === 0;
    setIsExpired(alreadyExpired);
    if (alreadyExpired) return;

    const end = Date.parse(expires_at);
    const id = setInterval(() => {
      const sec = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemainingSeconds(sec);
      if (sec <= 0) {
        clearInterval(id);
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [expires_at]);

  useEffect(() => {
    if (!isExpired) return;
    const t = setTimeout(() => router.push("/flights"), 1000);
    return () => clearTimeout(t);
  }, [isExpired, router]);

  const showRed =
    isExpired || (remainingSeconds > 0 && remainingSeconds < 120);
  const borderClass = showRed ? "border-red-500/40" : "border-amber-500/40";
  const bgClass = showRed ? "bg-red-500/10" : "bg-amber-500/10";

  return (
    <p
      className={`mb-4 rounded-lg border px-4 py-2 text-sm text-foreground ${borderClass} ${bgClass}`}
    >
      {isExpired ? (
        "Flight expired, refreshing..."
      ) : (
        <>
          ⏳ Flight expires in{" "}
          <time dateTime={expires_at}>{formatCountdown(remainingSeconds)}</time>{" "}
          Complete booking soon.
        </>
      )}
    </p>
  );
}
