"use client";

import PaperData from "../components/paper-submission/PaperData";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { usePaperSubmissions } from "@/src/hooks";
import { Loader2 } from "lucide-react";

export default function PaperSubmissionPage() {
  const { data: paperSubmissions, isLoading, isError, error } = usePaperSubmissions();

  return (
    <PageContainer>
      <PageHeader
        title="Paper submission"
        description="Review and manage manuscripts submitted by authors."
      />

      <div className="mb-6 rounded-2xl bg-linear-to-r from-[#024081] to-[#036eb6] px-6 py-4 text-white shadow-md">
        <p className="text-sm font-medium text-blue-100">
          <span className="text-white">{paperSubmissions?.length ?? 0}</span> total submission
          {paperSubmissions?.length === 1 ? "" : "s"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading paper submissions…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
          {error.message || "Failed to load paper submissions."}
        </div>
      ) : (
        <PaperData paperSubmissions={paperSubmissions ?? []} />
      )}
    </PageContainer>
  );
}
