"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/src/lib/api";
import { ISSUES_QUERY_KEY } from "./useIssuesByJournal";
import { JOURNALS_QUERY_KEY } from "./useGetJournals";

export type DeleteIssueInput = {
  issueId: string;
  journalId: string;
};

type DeleteIssueResponse = {
  message: string;
};

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation<DeleteIssueResponse, ApiError, DeleteIssueInput>({
    mutationKey: ["issues", "delete"],
    mutationFn: ({ issueId }) =>
      apiClient.delete<DeleteIssueResponse>(`/issues/${issueId}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...ISSUES_QUERY_KEY, "journal", variables.journalId],
      });
      queryClient.invalidateQueries({
        queryKey: [...ISSUES_QUERY_KEY, variables.issueId],
      });
      queryClient.invalidateQueries({ queryKey: JOURNALS_QUERY_KEY });
    },
  });
}
