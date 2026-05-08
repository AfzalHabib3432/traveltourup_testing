"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type Slide = {
  id: number;
  title: string;
  image: string;
};

const SLIDES: Slide[] = [
  { id: 1, title: "Skyline Grand Suites", image: "/images/assets/explore.jpg" },
  { id: 2, title: "Coastal Serenity Haven", image: "/images/assets/explore1.jpg" },
  { id: 3, title: "Alpine Horizon Retreat", image: "/images/assets/explore2.jpg" },
  { id: 4, title: "Private Villa Collection", image: "/images/assets/explore3.jpg" },
  { id: 5, title: "Waterfront Twilight Estate", image: "/images/assets/explore4.jpg" },
  { id: 6, title: "Metropolitan Signature Stay", image: "/images/assets/explore5.jpg" },
  { id: 7, title: "Island Pearl Residences", image: "/images/assets/explore6.jpg" },
  { id: 8, title: "Cliffside Infinity Villas", image: "/images/assets/explore7.jpg" },
  { id: 9, title: "Tropical Lagoon Hideaway", image: "/images/assets/explore8.jpg" },
  { id: 10, title: "Desert Dune Palazzo", image: "/images/assets/explore9.jpg" },
  { id: 11, title: "Garden Courtyard Estate", image: "/images/assets/explore10.jpg" },
  { id: 12, title: "Harbour Lights Penthouse", image: "/images/assets/explore11.jpg" },
  { id: 13, title: "Summit Chalet Curated Stay", image: "/images/assets/explore12.jpg" },
  { id: 14, title: "Summit Chalet Curated Stay", image: "/images/assets/explore13.jpg" },
  { id: 15, title: "Summit Chalet Curated Stay", image: "/images/assets/explore14.jpg" },
  { id: 16, title: "Summit Chalet Curated Stay", image: "/images/assets/explore15.jpg" },
];

const AUTO_ADVANCE_MS = 4500;

type CarouselLayout = {
  cardW: number;
  cardH: number;
  sideOffset: number;
  sideRotate: number;
  sideScale: number;
  sideOpacity: number;
  stageH: number;
};

function computeLayout(vw: number): CarouselLayout {
  const edgePad = 16;

  if (vw >= 1024) {
    return {
      cardW: 340,
      cardH: 440,
      sideOffset: 245,
      sideRotate: 40,
      sideScale: 0.8,
      sideOpacity: 0.65,
      stageH: 500,
    };
  }

  if (vw >= 640) {
    const cardW = Math.min(300, vw - 48);
    const cardH = Math.round(cardW * 1.3);
    const sideScale = 0.8;
    const sideHalf = (cardW * sideScale) / 2;
    const maxOffset = vw / 2 - sideHalf - edgePad;
    const sideOffset = Math.min(195, Math.max(88, maxOffset));
    return {
      cardW,
      cardH,
      sideOffset,
      sideRotate: 32,
      sideScale,
      sideOpacity: 0.62,
      stageH: cardH + 72,
    };
  }

  /* Mobile: narrower card + small offset / shallow rotate so nothing clips or scrolls */
  const cardW = Math.floor(Math.min(vw - edgePad * 2, Math.min(268, vw * 0.76)));
  const cardH = Math.round(cardW * 1.28);
  const sideScale = vw < 400 ? 0.88 : 0.84;
  const sideRotate = vw < 380 ? 10 : vw < 430 ? 14 : 18;
  const sideHalf = (cardW * sideScale) / 2;
  const maxOffset = vw / 2 - sideHalf - edgePad - 2;
  const sideOffset = Math.max(24, Math.min(maxOffset, vw < 380 ? 44 : 58));

  return {
    cardW,
    cardH,
    sideOffset,
    sideRotate,
    sideScale,
    sideOpacity: vw < 400 ? 0.48 : 0.55,
    stageH: cardH + 56,
  };
}

function getSlideMotion(position: number, n: number, layout: CarouselLayout) {
  const { sideOffset, sideRotate, sideScale, sideOpacity } = layout;

  if (position === 0) {
    return {
      x: 0,
      scale: 1,
      rotateY: 0,
      opacity: 1,
      zIndex: 3,
    };
  }
  if (position === 1) {
    return {
      x: sideOffset,
      scale: sideScale,
      rotateY: -sideRotate,
      opacity: sideOpacity,
      zIndex: 1,
    };
  }
  if (position === n - 1) {
    return {
      x: -sideOffset,
      scale: sideScale,
      rotateY: sideRotate,
      opacity: sideOpacity,
      zIndex: 1,
    };
  }
  return {
    x: 0,
    scale: 0.72,
    rotateY: 0,
    opacity: 0,
    zIndex: 0,
  };
}

function CarouselContent() {
  const [index, setIndex] = useState(0);
  const [layout, setLayout] = useState<CarouselLayout>(() => computeLayout(window.innerWidth));

  useEffect(() => {
    const update = () => setLayout(computeLayout(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /** Pre-warm decoding so later slides swap in cleanly instead of lingering on empty frames. */
  useEffect(() => {
    SLIDES.forEach((s) => {
      const im = new window.Image();
      im.src = s.image;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let tid: number | undefined;

    function schedule() {
      tid = window.setTimeout(() => {
        if (cancelled) return;
        setIndex((i) => (i + 1) % SLIDES.length);
        schedule();
      }, AUTO_ADVANCE_MS);
    }

    schedule();
    return () => {
      cancelled = true;
      if (tid !== undefined) window.clearTimeout(tid);
    };
  }, []);

  const n = SLIDES.length;
  const sizesAttr = `(max-width: 639px) ${Math.ceil(layout.cardW)}px, (max-width: 1023px) ${Math.ceil(layout.cardW)}px, 340px`;

  return (
    <div className="relative flex h-full w-full max-w-full items-center justify-center overflow-x-clip overflow-y-visible">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[420px] max-w-[100vw] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex h-full w-full max-w-3xl items-center justify-center px-2 sm:px-3">
        <div
          className="relative flex w-full max-w-[min(100%,1040px)] items-center justify-center [perspective:1000px]"
          style={{ height: layout.stageH }}
        >
          {SLIDES.map((slide, i) => {
            const position = (i - index + n) % n;
            const anim = getSlideMotion(position, n, layout);

            const isCenter = position === 0;
            const isSide = position === 1 || position === n - 1;

            return (
              <motion.div
                key={slide.id}
                className={`absolute left-1/2 top-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 sm:max-w-none ${anim.opacity === 0 ? "pointer-events-none" : "pointer-events-auto"}`}
                style={{
                  width: layout.cardW,
                  height: layout.cardH,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  zIndex: anim.zIndex,
                }}
                animate={{
                  x: anim.x,
                  scale: anim.scale,
                  rotateY: anim.rotateY,
                  opacity: anim.opacity,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                  zIndex: { duration: 0 },
                }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes={sizesAttr}
                    quality={100}
                    priority={isCenter}
                    loading={isCenter || isSide ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                    className="object-cover object-center"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4 sm:pt-12">
                    <p className="text-[8px] uppercase tracking-[0.25em] text-white/90">
                      Featured stay
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white sm:text-base">
                      {slide.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
       
        </div>
      </div>
    </div>
  );
}

export default function AboutPageHistoryAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative flex h-full w-full max-w-full items-center justify-center overflow-x-clip">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[420px] max-w-[100vw] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex h-full w-full max-w-3xl items-center justify-center px-2">
          <div className="relative min-h-[380px] w-full sm:min-h-[480px]" />
        </div>
      </div>
    );
  }

  return <CarouselContent />;
}
