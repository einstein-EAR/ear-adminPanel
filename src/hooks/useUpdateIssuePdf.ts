"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/src/lib/api";
import type { IssuePdf, UpdateIssuePdfInput } from "@/src/types/issue";
import { ISSUES_QUERY_KEY } from "./useIssuesByJournal";

function toUpdateFormData({
  title,
  author,
  doi,
  file,
}: UpdateIssuePdfInput): FormData {
  const formData = new FormData();
  formData.append("title", title.trim());
  formData.append("author", author.trim());
  formData.append("doi", doi.trim());

  if (file) {
    formData.append("pdf", file);
  }

  return formData;
}

export function useUpdateIssuePdf() {
  const queryClient = useQueryClient();

  return useMutation<IssuePdf, ApiError, UpdateIssuePdfInput>({
    mutationKey: ["issues", "update-pdf"],
    mutationFn: (input) =>
      apiClient.put<IssuePdf>(
        `/issues/pdfs/${input.pdfId}`,
        toUpdateFormData(input),
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...ISSUES_QUERY_KEY, variables.issueId],
      });
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });
}
