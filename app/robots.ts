import type { MetadataRoute } from "next";
import { BASE_URL } from "@/config/metadata.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/auth/",
        "/email-test",
        "/*/payment",
        "/*/cars/payment",
        "/*/hotels/payment",
        "/*/flights/payment",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
