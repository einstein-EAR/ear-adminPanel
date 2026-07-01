"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, Hash, Loader2, Plus } from "lucide-react";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { useGetJournalById, useIssuesByJournal } from "@/src/hooks";
import CreateIssueModal from "../components/all-issues/CreateIssueModal";
import IssueDetailScreen from "../components/all-issues/IssueDetailScreen";
import IssuesList from "../components/all-issues/IssuesList";

export default function AllIssuesContent() {
  const searchParams = useSearchParams();
  const journalId = searchParams.get("journalId");
  const issueId = searchParams.get("issueId");
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data: journal,
    isLoading: journalLoading,
    isError: journalError,
    error: journalErrorData,
  } = useGetJournalById(journalId);

  const {
    data: issues,
    isLoading: issuesLoading,
    isError: issuesError,
    error: issuesErrorData,
  } = useIssuesByJournal(journalId);

  if (journalId && issueId) {
    return <IssueDetailScreen journalId={journalId} issueId={issueId} />;
  }

  if (!journalId) {
    return (
      <PageContainer>
        <PageHeader title="All issues" description="View issues for a journal." />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-800">
          No journal selected. Open a journal from the journals list first.
        </div>
        <Link
          href="/upload-paper"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#024081] hover:text-[#036eb6]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to journals
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        href="/upload-paper"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#024081] transition hover:text-[#036eb6]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to journals
      </Link>

      {journalLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading journal...
        </div>
      ) : journalError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
          {journalErrorData.message || "Failed to load journal."}
        </div>
      ) : journal ? (
        <>
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
              <div className="relative aspect-3/4 bg-[#f4f8fc] lg:aspect-auto lg:min-h-[220px]">
                {journal.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={journal.imageUrl}
                    alt={journal.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#858c93]">
                    <BookOpen className="h-12 w-12" aria-hidden />
                  </div>
                )}
              </div>

              <div className="p-6">
                <PageHeader
                  eyebrow="Journal issues"
                  title={journal.title}
                  description={journal.description}
                />
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#024081]">
                  <Hash className="h-4 w-4" aria-hidden />
                  {journal.serialNumber}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#092151]">Issues</h2>
              <p className="mt-1 text-sm text-[#858c93]">
                {issues?.length ?? 0} issue{(issues?.length ?? 0) === 1 ? "" : "s"} for this journal
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create issue
            </button>
          </div>

          {issuesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
              {issuesErrorData.message || "Failed to load issues."}
            </div>
          ) : (
            <IssuesList
              journalId={journalId}
              issues={issues ?? []}
              isLoading={issuesLoading}
            />
          )}
        </>
      ) : null}

      <CreateIssueModal
        journalId={journalId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </PageContainer>
  );
}
