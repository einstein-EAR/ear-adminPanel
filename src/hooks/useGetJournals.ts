"use client";

import { useApiGet } from "@/src/lib/api";
import type { Journal } from "@/src/types/journal";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiError } from "@/src/lib/api";

export const JOURNALS_QUERY_KEY = ["journals"] as const;

type UseJournalsOptions = Omit<
  UseQueryOptions<Journal[], ApiError, Journal[]>,
  "queryKey" | "queryFn"
>;

export function useGetJournals(
  options?: UseJournalsOptions,
): UseQueryResult<Journal[], ApiError> {
  return useApiGet<Journal[]>(JOURNALS_QUERY_KEY, "/journals", options);
}

type UseJournalByIdOptions = Omit<
  UseQueryOptions<Journal, ApiError, Journal>,
  "queryKey" | "queryFn"
>;

export function useGetJournalById(
  journalId: string | null,
  options?: UseJournalByIdOptions,
) {
  const { enabled, ...queryOptions } = options ?? {};

  return useApiGet<Journal>(
    [...JOURNALS_QUERY_KEY, journalId],
    `/journals/${journalId}`,
    {
      enabled: Boolean(journalId) && (enabled ?? true),
      ...queryOptions,
    },
  ) as UseQueryResult<Journal, ApiError>;
}
