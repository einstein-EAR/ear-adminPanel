"use client";

import { Loader2, Pencil, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useCreateIssue, useUpdateIssue } from "@/src/hooks";
import { toastError, toastSuccess } from "@/src/lib/toast";
import type { JournalIssue } from "@/src/types/issue";

type CreateIssueModalProps = {
  journalId: string;
  open: boolean;
  onClose: () => void;
  issue?: JournalIssue | null;
};

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

export default function CreateIssueModal({
  journalId,
  open,
  onClose,
  issue = null,
}: CreateIssueModalProps) {
  const isEdit = Boolean(issue);
  const [issueLabel, setIssueLabel] = useState(issue?.issueLabel ?? "");
  const [description, setDescription] = useState(issue?.description ?? "");
  const [errors, setErrors] = useState({ issueLabel: "", description: "" });

  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue();
  const isPending = createIssue.isPending || updateIssue.isPending;

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, isPending]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({ issueLabel: "", description: "" });

    const trimmedLabel = issueLabel.trim();
    const trimmedDescription = description.trim();
    const nextErrors = { issueLabel: "", description: "" };

    if (!trimmedLabel) nextErrors.issueLabel = "Issue label is required";
    if (!trimmedDescription) nextErrors.description = "Issue description is required";

    if (nextErrors.issueLabel || nextErrors.description) {
      setErrors(nextErrors);
      return;
    }

    try {
      if (isEdit && issue) {
        await updateIssue.mutateAsync({
          issueId: issue._id,
          journalId,
          issueLabel: trimmedLabel,
          description: trimmedDescription,
        });
        toastSuccess("Issue updated successfully");
      } else {
        await createIssue.mutateAsync({
          journalId,
          issueLabel: trimmedLabel,
          description: trimmedDescription,
        });
        toastSuccess("Issue created successfully");
      }
      onClose();
    } catch (error) {
      toastError(
        error,
        isEdit
          ? "Failed to update issue. Please try again."
          : "Failed to create issue. Please try again.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Close modal overlay"
        onClick={isPending ? undefined : onClose}
        disabled={isPending}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-issue-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="create-issue-title" className="text-xl font-semibold text-[#092151]">
              {isEdit ? "Edit issue" : "Create issue"}
            </h2>
            <p className="mt-1 text-sm text-[#858c93]">
              {isEdit
                ? "Update the issue label and description."
                : "Add a new issue label and description for this journal."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="issue-label" className="mb-1.5 block text-sm font-medium text-slate-700">
            Issue label
          </label>
          <input
            id="issue-label"
            type="text"
            value={issueLabel}
            onChange={(e) => {
              setIssueLabel(e.target.value);
              setErrors((prev) => ({ ...prev, issueLabel: "" }));
            }}
            placeholder="Jan 2026"
            className={fieldClassName}
            disabled={isPending}
          />
          {errors.issueLabel ? (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.issueLabel}
            </p>
          ) : null}

          <label
            htmlFor="issue-description"
            className="mb-1.5 mt-4 block text-sm font-medium text-slate-700"
          >
            Issue description
          </label>
          <textarea
            id="issue-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: "" }));
            }}
            placeholder="Brief description of this issue"
            rows={4}
            className={`${fieldClassName} resize-y`}
            disabled={isPending}
          />
          {errors.description ? (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.description}
            </p>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : isEdit ? (
                <>
                  <Pencil className="h-4 w-4" aria-hidden />
                  Save changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" aria-hidden />
                  Create issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
