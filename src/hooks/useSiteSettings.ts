"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError, useApiGet } from "@/src/lib/api";
import type { SiteSettings, UpdateSiteSettingsInput } from "@/src/types/siteSettings";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

export const SITE_SETTINGS_QUERY_KEY = ["site-settings"] as const;

type UseSiteSettingsOptions = Omit<
  UseQueryOptions<SiteSettings, ApiError, SiteSettings>,
  "queryKey" | "queryFn"
>;

export function useGetSiteSettings(
  options?: UseSiteSettingsOptions,
): UseQueryResult<SiteSettings, ApiError> {
  return useApiGet<SiteSettings>(SITE_SETTINGS_QUERY_KEY, "/site-settings", options);
}

function toSiteSettingsFormData(input: UpdateSiteSettingsInput): FormData {
  const formData = new FormData();

  if (input.title !== undefined) formData.append("title", input.title.trim());
  if (input.subtitle !== undefined) formData.append("subtitle", input.subtitle.trim());
  if (input.phone !== undefined) formData.append("phone", input.phone.trim());
  if (input.email !== undefined) formData.append("email", input.email.trim());
  if (input.issn !== undefined) formData.append("issn", input.issn.trim());
  if (input.favIcon) formData.append("favIcon", input.favIcon);
  if (input.iconImage) formData.append("iconImage", input.iconImage);

  return formData;
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation<SiteSettings, ApiError, UpdateSiteSettingsInput>({
    mutationKey: ["site-settings", "update"],
    mutationFn: (input) =>
      apiClient.put<SiteSettings>("/site-settings", toSiteSettingsFormData(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
    },
  });
}
