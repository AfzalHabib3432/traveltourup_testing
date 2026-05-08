import "server-only";
import { z } from "zod";

const DEFAULT_DUFFEL_API_URL = "https://api.duffel.com";
export const DEFAULT_DUFFEL_HTTP_TIMEOUT_MS = 28_000;

const duffelEnvSchema = z.object({
  DUFFEL_API_KEY: z.string().min(1).optional(),
  DUFFEL_API_URL: z.string().url().optional(),
  DUFFEL_WEBHOOK_SECRET: z.string().min(1).optional(),
  DUFFEL_HTTP_TIMEOUT_MS: z.coerce.number().int().positive().max(120_000).optional(),
});

export type ResolvedDuffelConfig = {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
};

function rawEnv() {
  return {
    DUFFEL_API_KEY: process.env.DUFFEL_API_KEY?.trim() || undefined,
    DUFFEL_API_URL: process.env.DUFFEL_API_URL?.trim() || undefined,
    DUFFEL_WEBHOOK_SECRET: process.env.DUFFEL_WEBHOOK_SECRET?.trim() || undefined,
    DUFFEL_HTTP_TIMEOUT_MS: process.env.DUFFEL_HTTP_TIMEOUT_MS,
  };
}

/** Validated env snapshot (optional fields may be undefined). */
export function getDuffelEnv() {
  return duffelEnvSchema.parse(rawEnv());
}

export function isDuffelConfigured(): boolean {
  return Boolean(getDuffelEnv().DUFFEL_API_KEY);
}

/**
 * API key and HTTP settings for calls to api.duffel.com.
 * @throws Error when DUFFEL_API_KEY is missing
 */
export function getDuffelConfig(): ResolvedDuffelConfig {
  const env = getDuffelEnv();
  if (!env.DUFFEL_API_KEY) {
    throw new Error("DUFFEL_API_KEY is not set");
  }
  return {
    apiKey: env.DUFFEL_API_KEY,
    baseUrl: env.DUFFEL_API_URL ?? DEFAULT_DUFFEL_API_URL,
    timeoutMs: env.DUFFEL_HTTP_TIMEOUT_MS ?? DEFAULT_DUFFEL_HTTP_TIMEOUT_MS,
  };
}

/** Webhook signing secret; undefined if not configured. */
export function getDuffelWebhookSecret(): string | undefined {
  return getDuffelEnv().DUFFEL_WEBHOOK_SECRET;
}
