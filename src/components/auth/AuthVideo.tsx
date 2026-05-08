"use client";

import { useCallback, useState } from "react";
import { AUTH_VIDEO_PRIMARY, AUTH_VIDEO_FALLBACK } from "@/config/authMedia";

/**
 * Looped background video; falls back to local MP4 if the remote URL fails.
 */
export function AuthVideo() {
  const [src, setSrc] = useState(AUTH_VIDEO_PRIMARY);

  const handleError = useCallback(() => {
    setSrc((current) => (current !== AUTH_VIDEO_FALLBACK ? AUTH_VIDEO_FALLBACK : current));
  }, []);

  return (
    <video
      className="auth-video absolute inset-0 z-[1] h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      onError={handleError}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
