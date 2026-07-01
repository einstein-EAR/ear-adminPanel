"use client";

import { useApiGet } from "@/src/lib/api";
import type { JournalIssue } from "@/src/types/issue";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiError } from "@/src/lib/api";

export const ISSUES_QUERY_KEY = ["issues"] as const;

type UseIssuesByJournalOptions = Omit<
  UseQueryOptions<JournalIssue[], ApiError, JournalIssue[]>,
  "queryKey" | "queryFn"
>;

export function useIssuesByJournal(
  journalId: string | null,
  options?: UseIssuesByJournalOptions,
) {
  const { enabled, ...queryOptions } = options ?? {};

  return useApiGet<JournalIssue[]>(
    [...ISSUES_QUERY_KEY, "journal", journalId],
    `/issues/journal/${journalId}`,
    {
      enabled: Boolean(journalId) && (enabled ?? true),
      ...queryOptions,
    },
  ) as UseQueryResult<JournalIssue[], ApiError>;
}
