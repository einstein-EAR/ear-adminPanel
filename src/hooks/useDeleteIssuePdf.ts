"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/src/lib/api";
import type { DeleteIssuePdfInput } from "@/src/types/issue";
import { ISSUES_QUERY_KEY } from "./useIssuesByJournal";

type DeleteIssuePdfResponse = {
  message: string;
};

export function useDeleteIssuePdf() {
  const queryClient = useQueryClient();

  return useMutation<DeleteIssuePdfResponse, ApiError, DeleteIssuePdfInput>({
    mutationKey: ["issues", "delete-pdf"],
    mutationFn: ({ pdfId }) =>
      apiClient.delete<DeleteIssuePdfResponse>(`/issues/pdfs/${pdfId}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...ISSUES_QUERY_KEY, variables.issueId],
      });
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });
}
