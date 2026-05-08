import "server-only";

import type { StaysSearchBodyInput } from "@/lib/validations/stays.schema";
import { staysSearch } from "./stays-http";

function guestsToDuffel(guests: StaysSearchBodyInput["guests"]) {
  return guests.map((g) => {
    if (g.type === "adult") return { type: "adult" as const };
    return { type: "child" as const, age: g.age ?? 8 };
  });
}

export function buildDuffelStaysSearchPayload(body: StaysSearchBodyInput) {
  return {
    check_in_date: body.check_in_date,
    check_out_date: body.check_out_date,
    rooms: body.rooms,
    guests: guestsToDuffel(body.guests),
    location: {
      geographic_coordinates: {
        latitude: body.location.latitude,
        longitude: body.location.longitude,
      },
      radius: body.location.radius,
    },
  };
}

export async function duffelStaysSearch(body: StaysSearchBodyInput) {
  return staysSearch(buildDuffelStaysSearchPayload(body));
}
