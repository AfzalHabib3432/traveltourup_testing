function truthyEnv(v: string | undefined): boolean {
  return v === "1" || v === "true";
}

/**
 * Server: set `FLIGHT_HOLD_BACKEND`. Client bundles also read `NEXT_PUBLIC_FLIGHT_HOLD_BACKEND` so
 * checkout can enable the Hold path in sync with the API.
 */
export function isFlightHoldOrderBackendEnabled(): boolean {
  return (
    truthyEnv(process.env.FLIGHT_HOLD_BACKEND) ||
    truthyEnv(process.env.NEXT_PUBLIC_FLIGHT_HOLD_BACKEND)
  );
}
