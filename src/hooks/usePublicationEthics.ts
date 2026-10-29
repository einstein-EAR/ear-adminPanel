"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError, useApiGet } from "@/src/lib/api";
import type {
  PublicationEthics,
  UpdatePublicationEthicsInput,
} from "@/src/types/publicationEthics";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

export const PUBLICATION_ETHICS_QUERY_KEY = ["publication-ethics"] as const;

type UsePublicationEthicsOptions = Omit<
  UseQueryOptions<PublicationEthics, ApiError, PublicationEthics>,
  "queryKey" | "queryFn"
>;

export function useGetPublicationEthics(
  options?: UsePublicationEthicsOptions,
): UseQueryResult<PublicationEthics, ApiError> {
  return useApiGet<PublicationEthics>(
    PUBLICATION_ETHICS_QUERY_KEY,
    "/publication-ethics",
    {
      retry: (failureCount, error) => error.status !== 404 && failureCount < 2,
      ...options,
    },
  );
}

export function useUpdatePublicationEthics() {
  const queryClient = useQueryClient();

  return useMutation<PublicationEthics, ApiError, UpdatePublicationEthicsInput>({
    mutationKey: ["publication-ethics", "update"],
    mutationFn: (input) =>
      apiClient.put<PublicationEthics>("/publication-ethics", {
        content: input.content,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData([...PUBLICATION_ETHICS_QUERY_KEY, undefined], data);
    },
  });
}
