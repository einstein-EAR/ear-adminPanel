"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiGet } from "@/src/lib/api";
import { apiClient, ApiError } from "@/src/lib/api";
import type {
  CreateLatestNewsInput,
  LatestNews,
  UpdateLatestNewsInput,
} from "@/src/types/latestNews";

export const LATEST_NEWS_QUERY_KEY = ["latest-news"] as const;

export function useGetLatestNews() {
  return useApiGet<LatestNews[]>(LATEST_NEWS_QUERY_KEY, "/latest-news");
}

function toNewsFormData(
  input: Omit<CreateLatestNewsInput, "image"> & { image?: File | null },
): FormData {
  const formData = new FormData();
  formData.append("title", input.title.trim());
  formData.append("excerpt", input.excerpt.trim());

  if (input.publishedAt) {
    formData.append("publishedAt", input.publishedAt);
  }

  if (input.sortOrder !== undefined) {
    formData.append("sortOrder", String(input.sortOrder));
  }

  if (input.image) {
    formData.append("image", input.image);
  }

  return formData;
}

export function useCreateLatestNews() {
  const queryClient = useQueryClient();

  return useMutation<LatestNews, ApiError, CreateLatestNewsInput>({
    mutationKey: [...LATEST_NEWS_QUERY_KEY, "create"],
    mutationFn: (input) =>
      apiClient.post<LatestNews>("/latest-news", toNewsFormData(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LATEST_NEWS_QUERY_KEY });
    },
  });
}

export function useUpdateLatestNews() {
  const queryClient = useQueryClient();

  return useMutation<LatestNews, ApiError, UpdateLatestNewsInput>({
    mutationKey: [...LATEST_NEWS_QUERY_KEY, "update"],
    mutationFn: ({ newsId, ...input }) =>
      apiClient.put<LatestNews>(`/latest-news/${newsId}`, toNewsFormData(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LATEST_NEWS_QUERY_KEY });
    },
  });
}

export function useDeleteLatestNews() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, { newsId: string }>({
    mutationKey: [...LATEST_NEWS_QUERY_KEY, "delete"],
    mutationFn: ({ newsId }) =>
      apiClient.delete<{ message: string }>(`/latest-news/${newsId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LATEST_NEWS_QUERY_KEY });
    },
  });
}
