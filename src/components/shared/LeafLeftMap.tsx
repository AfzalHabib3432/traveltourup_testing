"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Location = {
  id?: string | number;
  name: string;
  lat: number;
  lng: number;
};

type Props = {
  locations: Location[];
  height?: string;
  zoom?: number;
};

const JEDDAH_CENTER: [number, number] = [21.4858, 39.1925];

export default function LeafletMap({
  locations,
  height = "500px",
  zoom = 12,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const el = mapRef.current;

    const map = L.map(el);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markerIcon = L.icon({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const valid = locations.filter(
      (l) =>
        typeof l.lat === "number" &&
        typeof l.lng === "number" &&
        !Number.isNaN(l.lat) &&
        !Number.isNaN(l.lng)
    );

    valid.forEach((loc) => {
      const safeName = String(loc.name)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      L.marker([loc.lat, loc.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`<b>${safeName}</b>`);
    });

    if (valid.length > 1) {
      map.fitBounds(L.latLngBounds(valid.map((l) => [l.lat, l.lng])), {
        padding: [28, 28],
        maxZoom: 14,
      });
    } else if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], zoom);
    } else {
      map.setView(JEDDAH_CENTER, 11);
    }

    mapInstance.current = map;

    let cancelled = false;
    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;
      const container = map.getContainer();
      if (!container?.isConnected) return;
      try {
        map.invalidateSize();
      } catch {
        /* map torn down before rAF (e.g. strict mode / fast re-render) */
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      map.remove();
      mapInstance.current = null;
    };
  }, [locations, zoom]);

  return <div ref={mapRef} style={{ height, width: "100%" }} className="z-0 rounded-lg border border-border" />;
}
