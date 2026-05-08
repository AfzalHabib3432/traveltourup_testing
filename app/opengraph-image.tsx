import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/config/brand";

export const runtime = "edge";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #0284c7 100%)",
          color: "#f8fafc",
        }}
      >
        <div style={{ fontSize: 66, fontWeight: 700, letterSpacing: "-0.03em" }}>{SITE_NAME}</div>
        <div style={{ fontSize: 30, marginTop: 20, opacity: 0.92, fontWeight: 500 }}>
          Flights · Hotels · Car rental — worldwide
        </div>
      </div>
    ),
    { ...size },
  );
}
