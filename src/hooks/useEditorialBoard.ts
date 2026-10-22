"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiGet } from "@/src/lib/api";
import { apiClient, ApiError } from "@/src/lib/api";
import type {
  CreateEditorialCategoryInput,
  CreateEditorialMemberInput,
  EditorialBoardCategory,
  EditorialBoardMember,
  UpdateEditorialCategoryInput,
  UpdateEditorialMemberInput,
} from "@/src/types/editorialBoard";

export const EDITORIAL_BOARD_QUERY_KEY = ["editorial-board"] as const;

export function useGetEditorialBoard() {
  return useApiGet<EditorialBoardCategory[]>(
    EDITORIAL_BOARD_QUERY_KEY,
    "/editorial-board",
  );
}

export function useCreateEditorialCategory() {
  const queryClient = useQueryClient();

  return useMutation<EditorialBoardCategory, ApiError, CreateEditorialCategoryInput>({
    mutationKey: [...EDITORIAL_BOARD_QUERY_KEY, "create-category"],
    mutationFn: (input) =>
      apiClient.post<EditorialBoardCategory>("/editorial-board/categories", {
        title: input.title.trim(),
        sortOrder: input.sortOrder ?? 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDITORIAL_BOARD_QUERY_KEY });
    },
  });
}

export function useUpdateEditorialCategory() {
  const queryClient = useQueryClient();

  return useMutation<EditorialBoardCategory, ApiError, UpdateEditorialCategoryInput>({
    mutationKey: [...EDITORIAL_BOARD_QUERY_KEY, "update-category"],
    mutationFn: ({ categoryId, ...body }) =>
      apiClient.put<EditorialBoardCategory>(
        `/editorial-board/categories/${categoryId}`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDITORIAL_BOARD_QUERY_KEY });
    },
  });
}

export function useDeleteEditorialCategory() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, { categoryId: string }>({
    mutationKey: [...EDITORIAL_BOARD_QUERY_KEY, "delete-category"],
    mutationFn: ({ categoryId }) =>
      apiClient.delete<{ message: string }>(
        `/editorial-board/categories/${categoryId}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDITORIAL_BOARD_QUERY_KEY });
    },
  });
}

export function useCreateEditorialMember() {
  const queryClient = useQueryClient();

  return useMutation<EditorialBoardMember, ApiError, CreateEditorialMemberInput>({
    mutationKey: [...EDITORIAL_BOARD_QUERY_KEY, "create-member"],
    mutationFn: ({ categoryId, ...body }) =>
      apiClient.post<EditorialBoardMember>(
        `/editorial-board/categories/${categoryId}/members`,
        {
          name: body.name.trim(),
          designation: body.designation?.trim() ?? "",
          affiliation: body.affiliation?.trim() ?? "",
          email: body.email?.trim() ?? "",
          sortOrder: body.sortOrder ?? 0,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDITORIAL_BOARD_QUERY_KEY });
    },
  });
}

export function useUpdateEditorialMember() {
  const queryClient = useQueryClient();

  return useMutation<EditorialBoardMember, ApiError, UpdateEditorialMemberInput>({
    mutationKey: [...EDITORIAL_BOARD_QUERY_KEY, "update-member"],
    mutationFn: ({ memberId, ...body }) =>
      apiClient.put<EditorialBoardMember>(
        `/editorial-board/members/${memberId}`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDITORIAL_BOARD_QUERY_KEY });
    },
  });
}

export function useDeleteEditorialMember() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, { memberId: string }>({
    mutationKey: [...EDITORIAL_BOARD_QUERY_KEY, "delete-member"],
    mutationFn: ({ memberId }) =>
      apiClient.delete<{ message: string }>(`/editorial-board/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDITORIAL_BOARD_QUERY_KEY });
    },
  });
}
