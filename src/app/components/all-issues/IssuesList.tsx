"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, FileText, Loader2, Trash2 } from "lucide-react";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import { formatToIST } from "@/src/lib/formatDate";
import { useDeleteIssue } from "@/src/hooks";
import type { JournalIssue } from "@/src/types/issue";

type IssuesListProps = {
  journalId: string;
  issues: JournalIssue[];
  isLoading?: boolean;
};

export default function IssuesList({ journalId, issues, isLoading }: IssuesListProps) {
  const router = useRouter();
  const [issueToDelete, setIssueToDelete] = useState<JournalIssue | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const deleteIssue = useDeleteIssue();

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleConfirmDelete = async () => {
    if (!issueToDelete) return;

    try {
      await deleteIssue.mutateAsync({
        issueId: issueToDelete._id,
        journalId,
      });
      setSuccessMessage("Issue deleted successfully.");
      setIssueToDelete(null);
    } catch {
      // Error handling can be extended with inline error state if needed.
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading issues...
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ededed] bg-white px-6 py-16 text-center text-sm text-[#858c93] shadow-sm">
        No issues yet. Create the first issue for this journal.
      </div>
    );
  }

  return (
    <>
      {successMessage ? (
        <div
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
          role="status"
        >
          {successMessage}
        </div>
      ) : null}

      <ul className="space-y-4">
        {issues.map((issue) => (
          <li
            key={issue._id}
            className="flex overflow-hidden rounded-2xl border border-[#ededed] bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <button
              type="button"
              onClick={() =>
                router.push(`/all-issues?journalId=${journalId}&issueId=${issue._id}`)
              }
              className="min-w-0 flex-1 p-5 text-left sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-[#092151]">{issue.issueLabel}</h3>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#858c93]">
                    <Clock className="h-3.5 w-3.5 text-[#036eb6]" aria-hidden />
                    Created {formatToIST(issue.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#024081]">
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    {issue.pdfs?.length ?? 0} PDF{issue.pdfs?.length === 1 ? "" : "s"}
                  </span>
                  <ChevronRight className="h-5 w-5 text-[#858c93]" aria-hidden />
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIssueToDelete(issue)}
              className="flex shrink-0 items-center justify-center border-l border-slate-100 px-4 text-slate-400 transition hover:bg-red-50 hover:text-red-600 sm:px-5"
              aria-label={`Delete ${issue.issueLabel}`}
            >
              <Trash2 className="h-5 w-5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(issueToDelete)}
        title="Delete issue"
        message={
          issueToDelete
            ? `Are you sure you want to delete ${issueToDelete.issueLabel}?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteIssue.isPending}
        onClose={() => {
          if (!deleteIssue.isPending) setIssueToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
