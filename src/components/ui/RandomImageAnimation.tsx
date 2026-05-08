"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";

const images: string[] = [
  "/images/hotels/hotel6.jpg",
  "/images/categories/category3.jpg",
  "/images/categories/category9.jpg",
  "/images/categories/category11.jpg",
];

const imageAlts: string[] = [
  "Luxury resort and coastline at golden hour",
  "Boutique hotel pool and palm trees",
  "Mountain view lodge and serene landscape",
  "Urban skyline hotel and twilight city lights",
];

type MotionPreset = {
  initial: {
    opacity: number;
    x: string | number;
    y: string | number;
    scale: number;
    filter?: string;
  };
  animate: {
    opacity: number;
    x: string | number;
    y: string | number;
    scale: number;
    filter?: string;
  };
  exit: {
    opacity: number;
    x: string | number;
    y: string | number;
    scale: number;
    filter?: string;
  };
};

type SlideState = {
  image: string;
  imageIndex: number;
  motion: MotionPreset;
  key: number;
};

/** Soft, horizon-forward transitions — suggest journey / landscape, not chaotic spins */
const motionPresets: MotionPreset[] = [
  {
    initial: { opacity: 0, x: "8%", y: 0, scale: 1.12, filter: "blur(12px)" },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, x: "-5%", y: 0, scale: 1.04, filter: "blur(6px)" },
  },
  {
    initial: { opacity: 0, x: "-8%", y: 0, scale: 1.1, filter: "blur(10px)" },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, x: "6%", y: 0, scale: 1.06, filter: "blur(8px)" },
  },
  {
    initial: { opacity: 0, x: 0, y: "6%", scale: 1.08, filter: "blur(14px)" },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, x: 0, y: "-4%", scale: 1.05, filter: "blur(6px)" },
  },
  {
    initial: { opacity: 0, x: 0, y: "-5%", scale: 1.06, filter: "blur(12px)" },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, x: 0, y: "5%", scale: 1.08, filter: "blur(10px)" },
  },
  {
    initial: { opacity: 0, x: "5%", y: "4%", scale: 1.14, filter: "blur(16px)" },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, x: "-4%", y: "-3%", scale: 1.02, filter: "blur(8px)" },
  },
];

const motionPresetsReduced: MotionPreset[] = motionPresets.map((p) => ({
  initial: { ...p.initial, x: 0, y: 0, scale: 1, filter: "none" },
  animate: { ...p.animate, filter: "none" },
  exit: { ...p.exit, x: 0, y: 0, scale: 1, filter: "none" },
}));

function getRandomItem<T>(items: T[], excludeIndex?: number): { item: T; index: number } {
  if (items.length === 1) {
    return { item: items[0], index: 0 };
  }

  let nextIndex = Math.floor(Math.random() * items.length);

  if (excludeIndex !== undefined) {
    while (nextIndex === excludeIndex) {
      nextIndex = Math.floor(Math.random() * items.length);
    }
  }

  return { item: items[nextIndex], index: nextIndex };
}

const SLIDE_INTERVAL_MS = 5000;

const travelEase = [0.25, 0.46, 0.45, 0.94] as const;

export default function RandomImageAnimation() {
  const reduceMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const presets = reduceMotion ? motionPresetsReduced : motionPresets;

  const [slide, setSlide] = useState<SlideState>(() => ({
    image: images[0],
    imageIndex: 0,
    motion: presets[0],
    key: 0,
  }));

  const getRandomImage = () => {
    setSlide((current) => {
      const { item: nextImage, index: nextImageIndex } = getRandomItem(
        images,
        current.imageIndex
      );
      const { item: nextMotion } = getRandomItem(
        presets,
        presets.indexOf(current.motion)
      );

      return {
        image: nextImage,
        imageIndex: nextImageIndex,
        motion: nextMotion,
        key: current.key + 1,
      };
    });
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      getRandomImage();
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPaused]);

  const transitionDuration = reduceMotion ? 0.35 : 1.15;

  return (
    <div
      className="group relative h-full w-full overflow-hidden rounded-2xl ring-1 ring-border/60 shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle inner frame */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl ring-1 ring-inset ring-white/10"
        aria-hidden
      />

      <AnimatePresence mode="sync">
        <motion.div
          key={slide.key}
          className="absolute inset-0"
          initial={slide.motion.initial}
          animate={slide.motion.animate}
          exit={slide.motion.exit}
          transition={{
            duration: transitionDuration,
            ease: travelEase,
          }}
        >
          {/* Ken Burns–style slow zoom while slide is visible (pause-friendly) */}
          <motion.div
            className="absolute inset-0 h-full w-full"
            initial={reduceMotion ? { scale: 1 } : { scale: 1.04 }}
            animate={
              reduceMotion
                ? { scale: 1 }
                : { scale: 1.12 }
            }
            transition={{
              duration: SLIDE_INTERVAL_MS / 1000 - 0.2,
              ease: "linear",
            }}
          >
            <Image
              src={slide.image}
              alt={imageAlts[slide.imageIndex] ?? "Travel destination showcase"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={slide.key === 0}
              unoptimized
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Atmospheric overlays: depth without hiding the destination */}
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/45 via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-primary/15 via-transparent to-primary/5"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-transparent via-transparent to-black/15"
        aria-hidden
      />

      {/* Soft specular highlight (travel brochure feel) */}
      <div
        className="pointer-events-none absolute -left-1/4 top-0 z-10 h-2/3 w-2/3 rounded-full bg-white/5 blur-3xl"
        aria-hidden
      />
    </div>
  );
}
