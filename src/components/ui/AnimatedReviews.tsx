"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useMessages, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { rtlDirProp, rtlTypographyClass } from "@/lib/i18n/rtl-typography";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Review } from "@/data/review";

interface AnimatedReviewsProps {
  limit?: number;
}

export default function AnimatedReviews({ limit = 8 }: AnimatedReviewsProps) {
  const locale = useLocale();
  const messages = useMessages() as { Reviews: { items: Review[] } };
  const t = useTranslations("Reviews");
  const testimonials = useMemo(
    () => (messages.Reviews?.items ?? []).slice(0, limit),
    [messages.Reviews?.items, limit],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const AUTO_PLAY_INTERVAL_MS = 4000;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused || testimonials.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, AUTO_PLAY_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isPaused, testimonials.length]);

  if (!testimonials.length) return null;

  const current = testimonials[currentIndex];
  const rtl = isRtlLocale(locale);

  return (
    <section
      className=" relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 py-4 overflow-hidden">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            {/* Top Quote Icon */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <Quote className="inline-block text-primary w-12 h-12" />
            </motion.div>

            {/* Card Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-lg shadow-2xl px-4 sm:px-8 py-8 sm:py-12 relative border border-border"
            >
              {/* Previous Button */}
              <button
                onClick={prev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-primary/10 hover:bg-primary/20 rounded-full p-1.5 sm:p-2 transition-all duration-300 group"
                aria-label={t("prevAria")}
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </button>

              {/* Next Button */}
              <button
                onClick={next}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-primary/10 hover:bg-primary/20 rounded-full p-1.5 sm:p-2 transition-all duration-300 group"
                aria-label={t("nextAria")}
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </button>

              {/* Carousel Content */}
              <div className="relative pb-12 sm:pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-4 sm:gap-8 lg:flex-row",
                      rtl && "lg:flex-row-reverse",
                    )}
                  >
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <motion.img
                        src={current.image}
                        alt={current.name}
                        width={150}
                        height={150}
                        className="rounded-full shadow-lg w-24 h-24 sm:w-36 sm:h-36 object-cover"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>

                    {/* Content */}
                    <div
                      dir={rtlDirProp(locale)}
                      className={cn(
                        "flex-1 max-w-2xl px-2 sm:px-0",
                        rtl ? rtlTypographyClass(locale) : "text-center lg:text-left",
                      )}
                    >
                      <motion.h4
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4 text-foreground"
                      >
                        {current.name} - {current.role}
                      </motion.h4>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                      >
                        {current.text}
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Indicators */}
                <div className="flex justify-center gap-2 mt-6 sm:mt-8 mb-0">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-10 h-2.5 bg-primary"
                          : "w-2.5 h-2.5 bg-muted hover:bg-primary/50"
                      }`}
                      aria-label={t("goToSlide", { n: index + 1 })}
                    />
                  ))}
                </div>
              </div>

            </motion.div>

            {/* Bottom Quote Icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-8"
            >
              <Quote className="inline-block text-primary w-12 h-12 rotate-180" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}