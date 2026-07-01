"use client";

import { configureApiClient } from "@/src/lib/api";
import { getToken } from "@/src/lib/auth";

// Keep auth wiring in one place; token reader is also set in api client defaults.
configureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  getAuthToken: () => getToken(),
});

export function ApiAuthSetup() {
  return null;
}
