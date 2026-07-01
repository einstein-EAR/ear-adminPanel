"use client";

import { useApiGet } from "@/src/lib/api";
import type { JournalIssue } from "@/src/types/issue";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiError } from "@/src/lib/api";
import { ISSUES_QUERY_KEY } from "./useIssuesByJournal";

type UseGetIssueByIdOptions = Omit<
  UseQueryOptions<JournalIssue, ApiError, JournalIssue>,
  "queryKey" | "queryFn"
>;

export function useGetIssueById(
  issueId: string | null,
  options?: UseGetIssueByIdOptions,
) {
  const { enabled, ...queryOptions } = options ?? {};

  return useApiGet<JournalIssue>(
    [...ISSUES_QUERY_KEY, issueId],
    `/issues/${issueId}`,
    {
      enabled: Boolean(issueId) && (enabled ?? true),
      ...queryOptions,
    },
  ) as UseQueryResult<JournalIssue, ApiError>;
}
