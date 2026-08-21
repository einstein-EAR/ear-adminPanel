"use client";

import { useEffect } from "react";
import { configureApiClient } from "@/src/lib/api";
import { getToken, syncAuthCookie } from "@/src/lib/auth";

configureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.rndpublications.com",
  getAuthToken: () => getToken(),
});

export function ApiAuthSetup() {
  useEffect(() => {
    // Existing localStorage sessions need a cookie for middleware redirects.
    syncAuthCookie();
  }, []);

  return null;
}
