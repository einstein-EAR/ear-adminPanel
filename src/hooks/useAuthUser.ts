"use client";

import { useSyncExternalStore } from "react";
import type { AuthUser } from "@/src/lib/auth";

const AUTH_USER_EVENT = "ear-auth-user-change";
const USER_KEY = "ear_auth_user";

let cachedRaw: string | null | undefined;
let cachedUser: AuthUser | null = null;

function getClientSnapshot(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);

  if (raw === cachedRaw) {
    return cachedUser;
  }

  cachedRaw = raw;

  if (!raw) {
    cachedUser = null;
    return cachedUser;
  }

  try {
    cachedUser = JSON.parse(raw) as AuthUser;
  } catch {
    cachedUser = null;
  }

  return cachedUser;
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === USER_KEY || event.key === null) {
      cachedRaw = undefined;
      onStoreChange();
    }
  };

  const handleAuthChange = () => {
    cachedRaw = undefined;
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_USER_EVENT, handleAuthChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_USER_EVENT, handleAuthChange);
  };
}

/** Reads auth user with a stable cached snapshot to avoid infinite loops. */
export function useAuthUser(): AuthUser | null {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
