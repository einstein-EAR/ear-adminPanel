"use client";

import { AlertCircle, Loader2, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/src/lib/api";
import { useCreateIssue } from "@/src/hooks";

type CreateIssueModalProps = {
  journalId: string;
  open: boolean;
  onClose: () => void;
};

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

export default function CreateIssueModal({
  journalId,
  open,
  onClose,
}: CreateIssueModalProps) {
  const [issueLabel, setIssueLabel] = useState("");
  const [errors, setErrors] = useState({ issueLabel: "", form: "" });

  const createIssue = useCreateIssue();

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setIssueLabel("");
      setErrors({ issueLabel: "", form: "" });
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({ issueLabel: "", form: "" });

    if (!issueLabel.trim()) {
      setErrors({ issueLabel: "Issue label is required", form: "" });
      return;
    }

    try {
      await createIssue.mutateAsync({ journalId, issueLabel });
      onClose();
      alert("Issue created successfully");
      // toast.success("Issue created successfully");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? typeof error.data === "object" &&
            error.data !== null &&
            "message" in error.data &&
            typeof (error.data as { message: unknown }).message === "string"
            ? (error.data as { message: string }).message
            : error.message
          : "Failed to create issue. Please try again.";

      setErrors({ issueLabel: "", form: message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Close modal overlay"
        onClick={onClose}
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
              Create issue
            </h2>
            <p className="mt-1 text-sm text-[#858c93]">
              Add a new issue label for this journal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
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
              setErrors({ issueLabel: "", form: "" });
            }}
            placeholder="Jan 2026"
            className={fieldClassName}
          />
          {errors.issueLabel ? (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.issueLabel}
            </p>
          ) : null}

          {errors.form ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {errors.form}
            </p>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createIssue.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              {createIssue.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Creating...
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
