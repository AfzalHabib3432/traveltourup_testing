"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { rtlDirProp, rtlTypographyClass } from "@/lib/i18n/rtl-typography";
import { Plane, Car, Building2, LayoutGrid } from "lucide-react";
import FlightsTab from "@/components/flights/FlightsTab";
import CarsTab from "@/components/cars/CarsTab";
import HotelsTab from "@/components/hotels/HotelsTab";
import MoreServicesTab from "@/components/MoreServicesTab";

function HeroSection() {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("flights");
  const [tripType, setTripType] = useState("one-way");
  const [cabinClass, setCabinClass] = useState("economy");
  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);

  const rotatingWords = useMemo(
    () => Array.from({ length: 11 }, (_, i) => t(`rotate${i}`)),
    [t],
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [animState, setAnimState] = useState("enter"); // "enter" | "exit"

  useEffect(() => {
    const displayDuration = 2400;
    const exitDuration = 500;

    const timer = setInterval(() => {
      setAnimState("exit");
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setAnimState("enter");
      }, exitDuration);
    }, displayDuration);

    return () => clearInterval(timer);
  }, [rotatingWords.length]);

  const tabs = [
    {
      id: "flights",
      label: t("tabFlights"),
      icon: <Plane className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />,
    },
    {
      id: "cars",
      label: t("tabCars"),
      icon: <Car className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />,
    },
    {
      id: "hotels",
      label: t("tabHotels"),
      icon: <Building2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />,
    },
    {
      id: "more",
      label: t("tabMore"),
      icon: <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />,
    },
  ];

  return (
    <div className="relative w-full bg-muted">
      {/* Hero background - Next/Image with priority for LCP optimization */}
      <div
        className={cn(
          "relative flex min-h-[420px] w-full flex-col justify-center pt-16 pb-24 md:min-h-[480px] md:pt-20 md:pb-28",
          isRtlLocale(locale) ? "items-end" : "items-center",
        )}
        style={{ clipPath: "ellipse(120% 100% at 50% 0%)" }}
      >
        <Image
          src="/images/featured/background.png"
          alt=""
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center" }}
        />
        <div
          className="absolute inset-0 bg-[var(--color-hero-overlay)] mix-blend-multiply"
          aria-hidden
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 max-w-7xl">
          <div dir={rtlDirProp(locale)} className={rtlTypographyClass(locale)}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-sm">
              {t("headlinePrefix")}{" "}
              <span className="inline-block italic font-extrabold ps-1" style={{verticalAlign: "bottom" }}>
                <span
                  key={wordIndex}
                  className={`inline-block  drop-shadow-md ${
                    animState === "enter" ? "hero-word-enter" : "hero-word-exit"
                  }`}
                >
                  {rotatingWords[wordIndex]}
                </span>
              </span>
            </h1>
            <p className="text-2xl text-white/95 mb-6">{t("tagline")}</p>
          </div>
        </div>
      </div>

      {/* Tabs container - positioned to overlap curved edge */}
      <div className="relative z-20 -mt-20 md:-mt-36 container mx-auto px-3 sm:px-4 pb-6">
        <div className="max-w-7xl mx-auto bg-background rounded-xl shadow-xl border border-border/50">
          {/* Tab Headers - Same for both mobile and desktop */}
            <div className="grid grid-cols-4 md:flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 py-2.5 px-2.5 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/10 rounded-t-lg -mb-px"
                    : "border-transparent text-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                <div className="text-primary">{tab.icon}</div>
                <span
                  className={
                    activeTab === tab.id ? "text-primary" : "text-foreground"
                  }
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "flights" && (
              <FlightsTab
                tripType={tripType}
                setTripType={setTripType}
                cabinClass={cabinClass}
                setCabinClass={setCabinClass}
                travelers={travelers}
                setTravelers={setTravelers}
                showTravelerDropdown={showTravelerDropdown}
                setShowTravelerDropdown={setShowTravelerDropdown}
              />
            )}
            {activeTab === "cars" && <CarsTab />}
            {activeTab === "hotels" && <HotelsTab />}
            {activeTab === "more" && <MoreServicesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;