"use client";

import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient, ApiError } from "./client";
import type { ApiRequestConfig } from "./types";

type ApiQueryOptions<TData> = Omit<
  UseQueryOptions<TData, ApiError, TData, QueryKey>,
  "queryKey" | "queryFn"
> & {
  params?: ApiRequestConfig["params"];
  headers?: ApiRequestConfig["headers"];
};

export function useApiGet<TData>(
  queryKey: QueryKey,
  endpoint: string,
  options?: ApiQueryOptions<TData>,
): UseQueryResult<TData, ApiError> {
  const { params, headers, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [...(Array.isArray(queryKey) ? queryKey : [queryKey]), params],
    queryFn: ({ signal }) =>
      apiClient.get<TData>(endpoint, { params, headers, signal }),
    ...queryOptions,
  });
}

type ApiMutationOptions<TData, TVariables, TContext = unknown> = Omit<
  UseMutationOptions<TData, ApiError, TVariables, TContext>,
  "mutationFn"
> & {
  params?: ApiRequestConfig["params"];
  headers?: ApiRequestConfig["headers"];
  mapBody?: (variables: TVariables) => unknown;
};

type EndpointResolver<TVariables> = string | ((variables: TVariables) => string);

function resolveEndpoint<TVariables>(
  endpoint: EndpointResolver<TVariables>,
  variables: TVariables,
) {
  return typeof endpoint === "function" ? endpoint(variables) : endpoint;
}

export function useApiPost<TData, TVariables = unknown>(
  endpoint: EndpointResolver<TVariables>,
  options?: ApiMutationOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> {
  const { params, headers, mapBody, ...mutationOptions } = options ?? {};

  return useMutation({
    mutationFn: (variables: TVariables) =>
      apiClient.post<TData>(
        resolveEndpoint(endpoint, variables),
        mapBody ? mapBody(variables) : variables,
        { params, headers },
      ),
    ...mutationOptions,
  });
}

export function useApiPut<TData, TVariables = unknown>(
  endpoint: EndpointResolver<TVariables>,
  options?: ApiMutationOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> {
  const { params, headers, mapBody, ...mutationOptions } = options ?? {};

  return useMutation({
    mutationFn: (variables: TVariables) =>
      apiClient.put<TData>(
        resolveEndpoint(endpoint, variables),
        mapBody ? mapBody(variables) : variables,
        { params, headers },
      ),
    ...mutationOptions,
  });
}

export function useApiPatch<TData, TVariables = unknown>(
  endpoint: EndpointResolver<TVariables>,
  options?: ApiMutationOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> {
  const { params, headers, mapBody, ...mutationOptions } = options ?? {};

  return useMutation({
    mutationFn: (variables: TVariables) =>
      apiClient.patch<TData>(
        resolveEndpoint(endpoint, variables),
        mapBody ? mapBody(variables) : variables,
        { params, headers },
      ),
    ...mutationOptions,
  });
}

export function useApiDelete<TData, TVariables = void>(
  endpoint: EndpointResolver<TVariables>,
  options?: ApiMutationOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> {
  const { params, headers, ...mutationOptions } = options ?? {};

  return useMutation({
    mutationFn: (variables: TVariables) =>
      apiClient.delete<TData>(
        resolveEndpoint(endpoint, variables),
        { params, headers },
      ),
    ...mutationOptions,
  });
}
