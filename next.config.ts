import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

function supabaseImageHostname(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseImageHostname();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@react-email/components", "@react-email/render"],
  // isomorphic-dompurify/jsdom omitted: bundling avoids ERR_REQUIRE_ESM on serverless when those
  // packages were externalized (html-encoding-sniffer → @exodus/bytes). Loaded only from blog-html-sanitize.ts.
  serverExternalPackages: ["@prisma/client", "prisma"],
  async headers() {
    return [
      {
        source: "/api/email/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CORS_ALLOWED_ORIGIN || "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type, Accept",
          },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
      {
        source: "/api/v1/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CORS_ALLOWED_ORIGIN || "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PATCH, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type, Accept",
          },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "pixabay.com" },
      { protocol: "https", hostname: "www.pixabay.com" },
      /**
       * Duffel Stays: accommodation photos often come from Booking.com’s CDN
       * (e.g. q-xx.bstatic.com). Wildcard covers regional / shard hostnames.
       * @see https://duffel.com/docs/guides/getting-started-with-stays
       */
      { protocol: "https", hostname: "**.bstatic.com" },
      /** Duffel Stays supplier imagery (e.g. Agoda). */
      { protocol: "https", hostname: "**.agoda.net" },
      { protocol: "https", hostname: "mobileimg.priceline.com" },
      /** Duffel Flights: carrier logos from Offers API (`marketing_carrier.logo_symbol_url`). */
      { protocol: "https", hostname: "assets.duffel.com" },
      ...(supabaseHost
        ? ([{ protocol: "https" as const, hostname: supabaseHost }] as const)
        : []),
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default withNextIntl(withBundleAnalyzer(nextConfig));
