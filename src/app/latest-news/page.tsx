"use client";

import LatestNewsManager from "../components/latest-news/LatestNewsManager";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { useGetLatestNews } from "@/src/hooks";

export default function LatestNewsPage() {
  const { isError, error, refetch } = useGetLatestNews();

  return (
    <PageContainer>
      <PageHeader
        title="Latest news"
        description="Create, edit, and delete news items with images. Crop and position each photo before it is saved. These appear in the Latest news section on the public website."
      />

      {isError ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
            {error.message || "Failed to load latest news."}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#024081] transition hover:bg-blue-50"
          >
            Try again
          </button>
        </div>
      ) : (
        <LatestNewsManager />
      )}
    </PageContainer>
  );
}
