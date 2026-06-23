"use client";

import { useEffect } from "react";
import { configureApiClient } from "@/src/lib/api";
import { getToken } from "@/src/lib/auth";

export function ApiAuthSetup() {
  useEffect(() => {
    configureApiClient({
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
      getAuthToken: () => getToken(),
    });
  }, []);

  return null;
}
