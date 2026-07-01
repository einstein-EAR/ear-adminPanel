"use client";

import { useState } from "react";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { useGetJournals } from "@/src/hooks";
import CreateJournalForm from "../components/upload-paper/CreateJournalForm";
import JournalsList from "../components/upload-paper/JournalsList";

type ViewMode = "create" | "list";

export default function UploadPaperPage() {
  const [view, setView] = useState<ViewMode>("create");
  const { data: journals, isLoading, isError, error, refetch } = useGetJournals({
    enabled: view === "list",
  });

  return (
    <PageContainer>
      <PageHeader
        title={view === "create" ? "Create journal" : "All journals"}
        description={
          view === "create"
            ? "Add a new journal publication with cover image and serial details."
            : "Browse all journals created in the admin panel."
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setView("create")}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
            view === "create"
              ? "bg-[#024081] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Create journal
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            view === "list"
              ? "bg-[#024081] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          View journals
        </button>
      </div>

      {view === "create" ? (
        <CreateJournalForm onCreated={() => setView("list")} />
      ) : isError ? (
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
