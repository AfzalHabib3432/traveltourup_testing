// @ts-nocheck - Phase 1: Props typing; full typing in Phase 3
"use client";
import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

import SectionHeading from "@/components/shared/SectionHeading";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { rtlDirProp, rtlTypographyClass } from "@/lib/i18n/rtl-typography";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const RecommendedCars = ({ featuredCar, cars,bgColor="bg-muted/40" }) => {
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const t = useTranslations("RecommendedCars");
  // Safety check and default values
  const safeFeaturedCar = featuredCar || {
    title: t("featuredFallbackTitle"),
    description: t("featuredFallbackDesc"),
    buttonText: t("exploreAll"),
    image: ""
  };

  const safeCars = cars || [
    {
      id: 1,
      name: "Toyota Camry",
      type: "Sedan",
      passengers: 4,
      luggage: 2,
      price: 45,
      image: "",
      features: ["AC", "WiFi", "GPS"]
    },
    {
      id: 2,
      name: "Honda Accord",
      type: "Sedan",
      passengers: 4,
      luggage: 3,
      price: 48,
      image: "",
      features: ["AC", "USB", "Leather"]
    },
    {
      id: 3,
      name: "Toyota RAV4",
      type: "SUV",
      passengers: 5,
      luggage: 4,
      price: 65,
      image: "",
      features: ["AC", "4WD", "Roof Rack"]
    },
    {
      id: 4,
      name: "Ford Explorer",
      type: "SUV",
      passengers: 7,
      luggage: 5,
      price: 75,
      image: "",
      features: ["AC", "7 Seats", "Premium Sound"]
    },
    {
      id: 5,
      name: "Mercedes E-Class",
      type: "Luxury",
      passengers: 4,
      luggage: 3,
      price: 120,
      image: "",
      features: ["Leather", "Panoramic", "Massage Seats"]
    },
    {
      id: 6,
      name: "BMW 5 Series",
      type: "Luxury",
      passengers: 4,
      luggage: 2,
      price: 125,
      image: "",
      features: ["Premium", "Heated Seats", "Entertainment"]
    }
  ];

  return (
    <section className={bgColor + " py-10"}>
      <div className="container mx-auto px-4 md:px-10">
        {/* Section Header */}
        <SectionHeading title={t("sectionTitle")} subtitle={t("sectionSubtitle")} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Side - Featured Car Banner */}
          <div className="lg:col-span-1">
            <div className="relative min-h-[26rem] sm:min-h-[30rem] lg:min-h-0 h-full overflow-hidden rounded-2xl shadow-xl group">
              {/* Background Image */}
              <div className="absolute inset-0">
                {safeFeaturedCar.image ? (
                  <Image
                    src={typeof safeFeaturedCar.image === "string" ? safeFeaturedCar.image : (safeFeaturedCar.image as { src: string }).src}
                    alt={t("bannerAlt")}
                    fill
                    quality={75}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
                    <span className="text-primary-foreground text-2xl font-bold">{t("placeholderBanner")}</span>
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
              </div>

              {/* Content */}
              <div
                className={cn(
                  "relative flex h-full flex-col justify-end p-8",
                  rtl && "items-end",
                )}
              >
                <div
                  dir={rtlDirProp(locale)}
                  className={cn(
                    "mb-6 w-full",
                    rtl ? rtlTypographyClass(locale) : "text-left",
                  )}
                >
                  <h3 className=" text-3xl font-bold text-primary-foreground">
                    {safeFeaturedCar.title}
                  </h3>
                  <p className="text-lg text-primary-foreground/90">
                    {safeFeaturedCar.description}
                  </p>
                </div>

                {/* CTA Button */}
                <Link href="/cars" className="block w-full" aria-label={t("exploreAll")}>
                  <button
                    type="button"
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 px-6 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 hover:shadow-lg hover:scale-[1.02]"
                  >
                    {safeFeaturedCar.buttonText}
                    <ArrowRight
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200",
                        rtl
                          ? "rotate-180 group-hover:-translate-x-1"
                          : "group-hover:translate-x-1",
                      )}
                      strokeWidth={2}
                    />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Cars Slider */}
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Swiper Slider with built-in navigation */}
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={true}
                className="[--swiper-navigation-color:theme(colors.primary)]"
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                  },
                }}
              >
                {safeCars.map((car) => (
                  <SwiperSlide key={car.id}>
                    <Card variant="car" data={car} actionHref={`/cars/${car.id}`} className="h-full" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendedCars;