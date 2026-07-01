"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/src/lib/api";
import { JOURNALS_QUERY_KEY } from "./useGetJournals";
import type { CreateJournalInput, Journal } from "@/src/types/journal";

function toJournalFormData(input: CreateJournalInput): FormData {
  const formData = new FormData();
  formData.append("title", input.title.trim());
  formData.append("description", input.description.trim());
  formData.append("serialNumber", input.serialNumber.trim());
  formData.append("image", input.image);
  return formData;
}

export function useCreateJournal() {
  const queryClient = useQueryClient();

  return useMutation<Journal, ApiError, CreateJournalInput>({
    mutationKey: ["journals", "create"],
    mutationFn: (input) =>
      apiClient.post<Journal>("/journals", toJournalFormData(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNALS_QUERY_KEY });
    },
  });
}
