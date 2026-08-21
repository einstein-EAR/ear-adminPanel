"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useApiPut } from "@/src/lib/api";
import type { JournalIssue, UpdateIssueInput } from "@/src/types/issue";
import { ISSUES_QUERY_KEY } from "./useIssuesByJournal";
import { JOURNALS_QUERY_KEY } from "./useGetJournals";

export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useApiPut<JournalIssue, UpdateIssueInput>(
    (variables) => `/issues/${variables.issueId}`,
    {
      mapBody: ({ issueLabel, description }) => ({ issueLabel, description }),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: [...ISSUES_QUERY_KEY, "journal", variables.journalId],
        });
        queryClient.invalidateQueries({
          queryKey: [...ISSUES_QUERY_KEY, variables.issueId],
        });
        queryClient.invalidateQueries({ queryKey: JOURNALS_QUERY_KEY });
      },
    },
  );
}
