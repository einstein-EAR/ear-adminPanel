"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/src/lib/api";
import type { JournalIssue } from "@/src/types/issue";
import { ISSUES_QUERY_KEY } from "./useIssuesByJournal";

export type UploadIssuePdfsInput = {
  issueId: string;
  title: string;
  files: File[];
};

function getFileExtension(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot) : ".pdf";
}

function toUploadFormData({ title, files }: UploadIssuePdfsInput): FormData {
  const formData = new FormData();
  const safeTitle = title.trim();

  files.forEach((file, index) => {
    const ext = getFileExtension(file.name);
    const filename =
      files.length === 1 ? `${safeTitle}${ext}` : `${safeTitle}-${index + 1}${ext}`;

    formData.append("pdfs", new File([file], filename, { type: file.type }));
  });

  return formData;
}

export function useUploadIssuePdfs() {
  const queryClient = useQueryClient();

  return useMutation<JournalIssue, ApiError, UploadIssuePdfsInput>({
    mutationKey: ["issues", "upload-pdfs"],
    mutationFn: (input) =>
      apiClient.post<JournalIssue>(
        `/issues/${input.issueId}/pdfs`,
        toUploadFormData(input),
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...ISSUES_QUERY_KEY, variables.issueId],
      });
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });
}
