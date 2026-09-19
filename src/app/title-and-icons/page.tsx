"use client";

import { Loader2 } from "lucide-react";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { useGetSiteSettings } from "@/src/hooks";
import { getApiErrorMessage } from "@/src/lib/toast";
import { EMPTY_SITE_SETTINGS } from "@/src/types/siteSettings";
import SiteSettingsForm from "../components/title-and-icons/SiteSettingsForm";

export default function TitleAndIconsPage() {
  const { data: settings, isLoading, isError, error } = useGetSiteSettings();

  const hasExistingSettings = Boolean(settings?._id);
  const formSettings = settings ?? EMPTY_SITE_SETTINGS;

  return (
    <PageContainer>
      <PageHeader
        title="Title and Icons"
        description="Update the public site title, contact information, and branding images."
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading site settings...
        </div>
      ) : (
        <>
          {isError ? (
            <div
              className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
              role="alert"
            >
              <p className="font-semibold">Could not load existing site settings</p>
              <p className="mt-1 text-amber-800">
                {getApiErrorMessage(error, "Failed to load site settings.")} You can still add
                settings using the form below.
              </p>
            </div>
          ) : !hasExistingSettings ? (
            <div
              className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-[#024081]"
              role="status"
            >
              <p className="font-semibold">No site settings yet</p>
              <p className="mt-1 text-[#036eb6]">
                Fill in the form below to create your site title, contact details, and branding
                images.
              </p>
            </div>
          ) : null}

          <SiteSettingsForm
            key={settings?.updated_at ?? "new-site-settings"}
            settings={formSettings}
            isNew={!hasExistingSettings}
          />
        </>
      )}
    </PageContainer>
  );
}
