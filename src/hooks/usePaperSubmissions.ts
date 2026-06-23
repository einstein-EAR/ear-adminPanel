"use client";

import { useApiGet } from "@/src/lib/api";
import type { QueryParams } from "@/src/lib/api";
import type { PaperSubmission } from "@/src/types/paperSubmission";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiError } from "@/src/lib/api";

export const PAPER_SUBMISSIONS_QUERY_KEY = ["paper-submissions"] as const;

type UsePaperSubmissionsOptions = Omit<
  UseQueryOptions<PaperSubmission[], ApiError, PaperSubmission[]>,
  "queryKey" | "queryFn"
> & {
  params?: QueryParams;
};

export function usePaperSubmissions(
  options?: UsePaperSubmissionsOptions,
): UseQueryResult<PaperSubmission[], ApiError> {
  const { params, ...queryOptions } = options ?? {};

  return useApiGet<PaperSubmission[]>(PAPER_SUBMISSIONS_QUERY_KEY, "/paper-submissions", {
    params,
    ...queryOptions,
  });
}
