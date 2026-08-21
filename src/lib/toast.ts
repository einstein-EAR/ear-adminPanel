import { toast } from "react-toastify";
import { ApiError } from "@/src/lib/api";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof ApiError) {
    if (
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof (error.data as { message: unknown }).message === "string"
    ) {
      return (error.data as { message: string }).message;
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(error: unknown, fallback?: string) {
  toast.error(getApiErrorMessage(error, fallback));
}
