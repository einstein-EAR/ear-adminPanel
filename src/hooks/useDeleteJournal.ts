"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/src/lib/api";
import { JOURNALS_QUERY_KEY } from "./useGetJournals";
import { ISSUES_QUERY_KEY } from "./useIssuesByJournal";

export type DeleteJournalInput = {
  journalId: string;
};

type DeleteJournalResponse = {
  message: string;
};

export function useDeleteJournal() {
  const queryClient = useQueryClient();

  return useMutation<DeleteJournalResponse, ApiError, DeleteJournalInput>({
    mutationKey: ["journals", "delete"],
    mutationFn: ({ journalId }) =>
      apiClient.delete<DeleteJournalResponse>(`/journals/${journalId}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: JOURNALS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ISSUES_QUERY_KEY, "journal", variables.journalId],
      });
      queryClient.invalidateQueries({
        queryKey: [...JOURNALS_QUERY_KEY, variables.journalId],
      });
    },
  });
}
