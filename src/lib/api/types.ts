export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ApiRequestConfig = {
  params?: QueryParams;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export type ApiClientConfig = {
  baseUrl?: string;
  getAuthToken?: () => string | null | undefined;
  defaultHeaders?: HeadersInit;
};
