import type { ApiClientConfig, ApiRequestConfig, HttpMethod } from "./types";
import { clearAuth, getToken } from "@/src/lib/auth";

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data: unknown;

  constructor(status: number, statusText: string, data: unknown) {
    super(`API Error ${status}: ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

const defaultConfig: ApiClientConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  getAuthToken: () => getToken(),
};

let clientConfig: ApiClientConfig = { ...defaultConfig };

export function configureApiClient(config: ApiClientConfig) {
  clientConfig = { ...clientConfig, ...config };
}

function buildUrl(endpoint: string, params?: ApiRequestConfig["params"]) {
  const base = clientConfig.baseUrl?.replace(/\/$/, "") ?? "";
  const path = endpoint.startsWith("http")
    ? endpoint
    : `${base}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (!params || Object.keys(params).length === 0) return path;

  const url = path.startsWith("http")
    ? new URL(path)
    : new URL(path, "http://placeholder.local");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return path.startsWith("http") ? url.toString() : `${url.pathname}${url.search}`;
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

async function parseErrorBody(response: Response) {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  } catch {
    return null;
  }
}

function buildHeaders(config?: ApiRequestConfig, body?: unknown): HeadersInit {
  const headers = new Headers(clientConfig.defaultHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = clientConfig.getAuthToken?.()?.trim();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (config?.headers) {
    new Headers(config.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const url = buildUrl(endpoint, config?.params);

  const response = await fetch(url, {
    method,
    headers: buildHeaders(config, body),
    body: serializeBody(body),
    signal: config?.signal,
  });

  if (!response.ok) {
    const errorData = await parseErrorBody(response);

    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !endpoint.includes("/auth/login") &&
      getToken()
    ) {
      clearAuth();
      window.location.replace("/login");
    }

    throw new ApiError(response.status, response.statusText, errorData);
  }

  return parseResponseBody<T>(response);
}

export const apiClient = {
  get<T>(endpoint: string, config?: ApiRequestConfig) {
    return request<T>("GET", endpoint, undefined, config);
  },

  post<T, B = unknown>(endpoint: string, body?: B, config?: ApiRequestConfig) {
    return request<T>("POST", endpoint, body, config);
  },

  put<T, B = unknown>(endpoint: string, body?: B, config?: ApiRequestConfig) {
    return request<T>("PUT", endpoint, body, config);
  },

  patch<T, B = unknown>(endpoint: string, body?: B, config?: ApiRequestConfig) {
    return request<T>("PATCH", endpoint, body, config);
  },

  delete<T>(endpoint: string, config?: ApiRequestConfig) {
    return request<T>("DELETE", endpoint, undefined, config);
  },
};
