"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { shouldUnoptimizeStaysSupplierImage } from "@/lib/images/stays-supplier-image";

export interface ImageGalleryProps {
  images: string[];
  alt: string;
  /** Optional class for the main container */
  className?: string;
}

/**
 * Attractive image gallery with main hero, thumbnails, and lightbox.
 * Used on hotel and car detail pages.
 */
export function ImageGallery({ images, alt, className = "" }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const safeImages = images?.filter(Boolean) ?? [];
  const hasImages = safeImages.length > 0;

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  }, [safeImages.length]);

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));
  }, [safeImages.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    [isLightboxOpen, goPrev, goNext]
  );

  if (!hasImages) return null;

  return (
    <div className={`space-y-3 ${className}`} onKeyDown={handleKeyDown}>
      {/* Main hero image */}
      <div className="relative aspect-[16/10] md:aspect-[21/9] w-full rounded-xl overflow-hidden bg-muted group">
        <Image
          src={safeImages[selectedIndex]}
          alt={`${alt} - Image ${selectedIndex + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
          unoptimized={shouldUnoptimizeStaysSupplierImage(safeImages[selectedIndex])}
          onClick={() => setIsLightboxOpen(true)}
        />
        {/* Overlay gradient for better CTA feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Navigation arrows - visible on hover */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* Image counter badge */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/50 text-white text-sm font-medium">
            {selectedIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 dropdown-scrollbar">
          {safeImages.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === i
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={shouldUnoptimizeStaysSupplierImage(src)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery lightbox"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={safeImages[selectedIndex]}
              alt={`${alt} - Image ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized={shouldUnoptimizeStaysSupplierImage(safeImages[selectedIndex])}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm">
            {selectedIndex + 1} / {safeImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
