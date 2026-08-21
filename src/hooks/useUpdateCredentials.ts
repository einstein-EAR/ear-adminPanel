"use client";

import { useApiPut } from "@/src/lib/api";
import type {
  UpdateCredentialsInput,
  UpdateCredentialsResponse,
} from "@/src/lib/auth";

export function useUpdateCredentials() {
  return useApiPut<UpdateCredentialsResponse, UpdateCredentialsInput>(
    "/auth/credentials",
  );
}
