"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

import { VARIANT_LOGOS, DEFAULT_LOGO } from "@/config/logos";
import { useTheme } from "@/components/ThemeProvider";

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC SCALE SYSTEM – single source of truth; all dimensions derived from here
// ─────────────────────────────────────────────────────────────────────────────

const BASE_SIZE = 160;
const CENTER = BASE_SIZE / 2;

// Ratios (preserved from original: logo ~82% of orbit diameter)
const ORBIT_RADIUS_RATIO = 0.3875; // orbit radius = 62/160 of base
const LOGO_TO_ORBIT_RATIO = 0.8226; // logo diameter = 82% of orbit (102/124)
const DOT_RADIUS_RATIO = 0.0452; // dot radius = 2.8/62 of orbit
const MASK_CIRCLE_RATIO = 0.161; // mask circle = 10/62 of orbit (hides dot under airplane)
const ORBIT_START_ANGLE = -Math.PI / 4; // top-right (315°)

// Computed constants (pre-calculated for performance)
const ORBIT_RADIUS = BASE_SIZE * ORBIT_RADIUS_RATIO;
const LOGO_SIZE = 2 * ORBIT_RADIUS * LOGO_TO_ORBIT_RATIO;
const DOT_RADIUS = ORBIT_RADIUS * DOT_RADIUS_RATIO;
const MASK_CIRCLE_R = ORBIT_RADIUS * MASK_CIRCLE_RATIO;

// Top-right start point (angle -45°)
const TOP_RIGHT_X = CENTER + ORBIT_RADIUS * Math.cos(ORBIT_START_ANGLE);
const TOP_RIGHT_Y = CENTER + ORBIT_RADIUS * Math.sin(ORBIT_START_ANGLE);
// Bottom-left (180° from top-right) for arc path
const BOTTOM_LEFT_X = CENTER + ORBIT_RADIUS * Math.cos(ORBIT_START_ANGLE + Math.PI);
const BOTTOM_LEFT_Y = CENTER + ORBIT_RADIUS * Math.sin(ORBIT_START_ANGLE + Math.PI);

// ─────────────────────────────────────────────────────────────────────────────
// AIRPLANE ICON
// ─────────────────────────────────────────────────────────────────────────────

const AIRPLANE_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";
const AIRPLANE_CENTER_X = 11.5;
const AIRPLANE_CENTER_Y = 13.5;

const AirplaneIcon = ({
  className = "",
  size = 24,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden
  >
    <path d={AIRPLANE_PATH} />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ORBIT GEOMETRY – dots and airplane share the same path
// ─────────────────────────────────────────────────────────────────────────────

const DOTS_COUNT = 32;
const roundCoord = (n: number): number => Math.round(n * 1e6) / 1e6;

// Dots: same orbit, starting from top-right, distributed evenly
const DOT_POSITIONS = Array.from({ length: DOTS_COUNT }, (_, i) => {
  const angle = ORBIT_START_ANGLE + (i / DOTS_COUNT) * 2 * Math.PI;
  return {
    cx: roundCoord(CENTER + ORBIT_RADIUS * Math.cos(angle)),
    cy: roundCoord(CENTER + ORBIT_RADIUS * Math.sin(angle)),
  };
});

// Orbit path: clockwise from top-right (two 180° arcs)
const ORBIT_PATH_D = `M ${roundCoord(TOP_RIGHT_X)},${roundCoord(TOP_RIGHT_Y)} A ${ORBIT_RADIUS},${ORBIT_RADIUS} 0 0,1 ${roundCoord(BOTTOM_LEFT_X)},${roundCoord(BOTTOM_LEFT_Y)} A ${ORBIT_RADIUS},${ORBIT_RADIUS} 0 0,1 ${roundCoord(TOP_RIGHT_X)},${roundCoord(TOP_RIGHT_Y)}`;

// ─────────────────────────────────────────────────────────────────────────────
// LOADER SIZE PRESETS – all derived values scale proportionally
// ─────────────────────────────────────────────────────────────────────────────

/** Loader size presets in px. Use with size prop: size="sm"|"md"|"medium"|"lg"|"large"|"xl" */
export const LOADER_SIZES = {
  sm: 120,
  md: 176,
  medium: 176,
  lg: 240,
  large: 240,
  xl: 320,
};

const DEFAULT_SIZE = "large";

type LoaderSizePreset = keyof typeof LOADER_SIZES;

// Ratios for flyaway airplane (icon size & offset from loader size)
const FLYAWAY_ICON_RATIO = 48 / 176; // 48px icon for 176px loader
const FLYAWAY_OFFSET_RATIO = 16 / 176; // 1rem (16px) from edge for 176px loader

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION TIMING
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_MIN_LOAD_TIME = 1000;
const FLY_AWAY_DURATION = 800;
const ORBIT_DURATION = 2; // Must match CSS pageLoaderPulse animation duration

// Animation timing constants for CSS synchronization
export const ANIMATION_CONFIG = {
  ORBIT_DURATION_S: `${ORBIT_DURATION}s`,
  PULSE_DURATION_S: `${ORBIT_DURATION}s`, // Synchronized with orbit for smooth animation
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve size prop to pixel value.
 * @param {string|number} size - "sm"|"md"|"lg"|"xl" or custom px number
 * @returns {number} Loader size in pixels
 */
function resolveLoaderSize(size: LoaderSizePreset | number | null | undefined) {
  if (size == null) return LOADER_SIZES[DEFAULT_SIZE];
  if (typeof size === "number" && size > 0) return size;
  const preset = LOADER_SIZES[size as LoaderSizePreset];
  return preset ?? LOADER_SIZES[DEFAULT_SIZE];
}

interface PageLoaderProps {
  isLoading?: boolean;
  minLoadTime?: number;
  size?: LoaderSizePreset | number;
  onComplete?: () => void;
}

/**
 * Generic page loader with logo, dotted path, and circulating airplane.
 * All dimensions scale from BASE_SIZE; orbit starts at top-right.
 * On load end: center fades out, airplane flies to top-left, then unmounts.
 *
 * @param {Object} props
 * @param {boolean} [props.isLoading] - External control. If not provided, uses window load + min time.
 * @param {number} [props.minLoadTime] - Minimum display time in ms (default: 1800)
 * @param {"sm"|"md"|"medium"|"lg"|"large"|"xl"|number} [props.size] - Size preset or custom px (default: "md")
 * @param {Function} [props.onComplete] - Called when loader fully finishes
 */
export default function PageLoader({
  isLoading: controlledLoading,
  minLoadTime = DEFAULT_MIN_LOAD_TIME,
  size,
  onComplete,
}: PageLoaderProps) {
  const { themeVariant } = useTheme();
  const logo = VARIANT_LOGOS[themeVariant] || DEFAULT_LOGO;
  const [phase, setPhase] = useState("center");
  const [flyawayReached, setFlyawayReached] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);

  const isLoading =
    controlledLoading !== undefined ? controlledLoading : internalLoading;

  const finishLoading = useCallback(() => {
    if (phase !== "center") return;
    setPhase("flyaway");
    setFlyawayReached(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlyawayReached(true));
    });
    const t = setTimeout(() => {
      setPhase("done");
      setInternalLoading(false);
      onComplete?.();
    }, FLY_AWAY_DURATION);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  useEffect(() => {
    if (controlledLoading !== undefined) {
      if (!controlledLoading && phase === "center") {
        finishLoading();
      }
      return;
    }

    let mounted = true;
    const start = Date.now();

    const check = () => {
      if (!mounted) return;
      const elapsed = Date.now() - start;
      const ready =
        typeof document !== "undefined" &&
        document.readyState === "complete" &&
        elapsed >= minLoadTime;
      if (ready) finishLoading();
    };

    if (document.readyState === "complete") {
      const remaining = Math.max(0, minLoadTime - (Date.now() - start));
      const t = setTimeout(check, remaining);
      return () => {
        mounted = false;
        clearTimeout(t);
      };
    }

    window.addEventListener("load", () => {
      const remaining = Math.max(0, minLoadTime - (Date.now() - start));
      setTimeout(check, remaining);
    });

    const fallback = setTimeout(check, minLoadTime + 500);
    return () => {
      mounted = false;
      window.removeEventListener("load", check);
      clearTimeout(fallback);
    };
  }, [controlledLoading, minLoadTime, finishLoading]);

  if (phase === "done") return null;

  const showCenter = phase === "center";

  // Resolve size: preset (sm|md|lg|xl) or custom px
  const loaderSize = resolveLoaderSize(size);

  // All dimensions scale proportionally from loader size
  const logoSizePx = (LOGO_SIZE / BASE_SIZE) * loaderSize;
  const flyawayIconSize = Math.round(loaderSize * FLYAWAY_ICON_RATIO);
  const flyawayOffsetPx = Math.round(loaderSize * FLYAWAY_OFFSET_RATIO);

  return (
    <div
      className="fixed inset-0 z-[9999] transition-colors duration-300 flex items-center justify-center h-full"
      style={{
        backgroundColor:
          phase === "flyaway"
            ? "transparent"
            : "color-mix(in srgb, var(--color-background) 97%, transparent)",
        backdropFilter: phase === "flyaway" ? "none" : "blur(4px)",
        pointerEvents: phase === "flyaway" ? "none" : "auto",
        transform: "translate3d(0,0,0)",
        willChange: "background-color, backdrop-filter",
        contain: "layout style paint",
      }}
      aria-hidden
      role="presentation"
      aria-busy={phase !== "done"}
    >
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
        style={{
          opacity: showCenter ? 1 : 0,
          pointerEvents: showCenter ? "auto" : "none",
        }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{
            width: loaderSize,
            height: loaderSize,
            transform: "translate3d(0,0,0)",
            willChange: "transform",
            contain: "layout style paint",
          }}
        >
          {/* Logo – centered, size from orbit ratio */}
          <div
            className="absolute z-10 flex items-center justify-center"
            style={{
              width: logoSizePx,
              height: logoSizePx,
            }}
          >
            <Image
              src={logo}
              alt=""
              width={250}
              height={250}
              className="object-contain h-18 w-auto"
              priority
            />
          </div>

          {/* SVG: dots + airplane on same orbital path */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${BASE_SIZE} ${BASE_SIZE}`}
            aria-hidden
            style={{
              transform: "translate3d(0,0,0)",
              willChange: "transform",
            }}
          >
            <defs>
              <path id="loaderOrbitPath" d={ORBIT_PATH_D} fill="none" />
            </defs>

            {/* Dots on orbit – synchronized with airplane timing */}
            {DOT_POSITIONS.map(({ cx, cy }, i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={DOT_RADIUS}
                fill="var(--color-primary)"
                className="page-loader-dot"
                style={{
                  // Synchronized timing: stagger over exactly one orbit duration
                  animationDelay: `${(i / DOTS_COUNT) * ORBIT_DURATION}s`,
                }}
              />
            ))}

            {/* Airplane – same orbit, starts top-right, rotate=auto follows tangent */}
            {showCenter && (
              <g
                fill="var(--color-primary)"
                style={{
                  transform: "translate3d(0,0,0)",
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              >
                <animateMotion
                  dur={ANIMATION_CONFIG.ORBIT_DURATION_S}
                  repeatCount="indefinite"
                  rotate="auto"
                  calcMode="linear"
                >
                  <mpath href="#loaderOrbitPath" />
                </animateMotion>
                <path
                  d={AIRPLANE_PATH}
                  transform={`translate(-${AIRPLANE_CENTER_X},-${AIRPLANE_CENTER_Y-7}) rotate(90)`}
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Flyaway airplane – center to top-left, size scales with loader */}
      <div
        className="fixed text-primary z-10"
        style={{
          width: flyawayIconSize,
          height: flyawayIconSize,
          opacity: phase === "flyaway" ? 1 : 0,
          left: phase === "flyaway" && flyawayReached ? `${flyawayOffsetPx}px` : "50%",
          top: phase === "flyaway" && flyawayReached ? `${flyawayOffsetPx}px` : "50%",
          transform:
            phase === "flyaway" && flyawayReached
              ? "translate(0, 0) scale(1) rotate(-45deg)"
              : "translate(-50%, -50%) scale(0.9) rotate(-45deg)",
          transition: `opacity 150ms ease-out, left ${FLY_AWAY_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top ${FLY_AWAY_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${FLY_AWAY_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          pointerEvents: "none",
        }}
      >
        <AirplaneIcon size={flyawayIconSize} className="w-full h-full" />
      </div>
    </div>
  );
}
