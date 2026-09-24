"use client";

import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { useGetJournals } from "@/src/hooks";
import JournalsList from "../components/upload-paper/JournalsList";

export default function ViewJournalsPage() {
  const { data: journals, isLoading, isError, error, refetch } = useGetJournals();

  return (
    <PageContainer>
      <PageHeader
        title="View journals"
        description="Browse journals and open a title to manage its issues."
      />

      {isError ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
            {error.message || "Failed to load journals."}
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
        <JournalsList journals={journals ?? []} isLoading={isLoading} />
      )}
    </PageContainer>
  );
}
