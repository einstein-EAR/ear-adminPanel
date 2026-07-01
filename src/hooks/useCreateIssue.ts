"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiPost } from "@/src/lib/api";
import { ISSUES_QUERY_KEY } from "./useIssuesByJournal";
import { JOURNALS_QUERY_KEY } from "./useGetJournals";
import type { CreateIssueInput, JournalIssue } from "@/src/types/issue";

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useApiPost<JournalIssue, CreateIssueInput>("/issues", {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...ISSUES_QUERY_KEY, "journal", variables.journalId],
      });
      queryClient.invalidateQueries({ queryKey: JOURNALS_QUERY_KEY });
    },
  });
}
