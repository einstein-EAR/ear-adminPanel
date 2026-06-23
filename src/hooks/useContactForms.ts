"use client";

import { useApiGet } from "@/src/lib/api";
import type { QueryParams } from "@/src/lib/api";
import type { ContactForm } from "@/src/types/contactForm";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiError } from "@/src/lib/api";

export const CONTACT_FORMS_QUERY_KEY = ["contact-forms"] as const;

type UseContactFormsOptions = Omit<
  UseQueryOptions<ContactForm[], ApiError, ContactForm[]>,
  "queryKey" | "queryFn"
> & {
  params?: QueryParams;
};

export function useContactForms(
  options?: UseContactFormsOptions,
): UseQueryResult<ContactForm[], ApiError> {
  const { params, ...queryOptions } = options ?? {};

  return useApiGet<ContactForm[]>(CONTACT_FORMS_QUERY_KEY, "/contact-forms", {
    params,
    ...queryOptions,
  });
}
