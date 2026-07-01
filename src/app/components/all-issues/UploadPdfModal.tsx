"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileUp, Loader2, ScrollText, X } from "lucide-react";
import { ApiError } from "@/src/lib/api";
import { useUploadIssuePdfs } from "@/src/hooks";

type UploadPdfModalProps = {
  issueId: string;
  open: boolean;
  onClose: () => void;
  onUploaded?: () => void;
};

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

export default function UploadPdfModal({
  issueId,
  open,
  onClose,
  onUploaded,
}: UploadPdfModalProps) {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [errors, setErrors] = useState({ title: "", files: "", form: "" });

  const uploadPdfs = useUploadIssuePdfs();

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
      setTitle("");
      setFiles([]);
      setFileInputKey(0);
      setErrors({ title: "", files: "", form: "" });
    }
  }, [open]);

  if (!open) return null;

  const validate = () => {
    const next = { title: "", files: "", form: "" };

    if (!title.trim()) next.title = "PDF title is required";
    if (files.length === 0) next.files = "Select at least one PDF file";
    else if (files.some((file) => file.type !== "application/pdf")) {
      next.files = "Only PDF files are allowed";
    }

    setErrors(next);
    return !next.title && !next.files;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({ title: "", files: "", form: "" });

    if (!validate()) return;

    try {
      await uploadPdfs.mutateAsync({ issueId, title, files });
      onUploaded?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? typeof err.data === "object" &&
            err.data !== null &&
            "message" in err.data &&
            typeof (err.data as { message: unknown }).message === "string"
            ? (err.data as { message: string }).message
            : err.message
          : "Failed to upload PDFs. Please try again.";

      setErrors((prev) => ({ ...prev, form: message }));
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
        aria-labelledby="upload-pdf-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="upload-pdf-title" className="text-xl font-semibold text-[#092151]">
              Upload PDF
            </h2>
            <p className="mt-1 text-sm text-[#858c93]">
              Add one or more PDF files with a display title.
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

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="pdf-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </label>
            <div className="flex items-start gap-3">
              <ScrollText className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  id="pdf-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: "", form: "" }));
                  }}
                  placeholder="Paper title or document name"
                  className={fieldClassName}
                />
                {errors.title ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.title}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="pdf-files" className="mb-1.5 block text-sm font-medium text-slate-700">
              PDF files
            </label>
            <div className="flex items-start gap-3">
              <FileUp className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  key={fileInputKey}
                  id="pdf-files"
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  onChange={(e) => {
                    setFiles(Array.from(e.target.files ?? []));
                    setErrors((prev) => ({ ...prev, files: "", form: "" }));
                  }}
                  className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#f4f8fc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#024081] hover:file:bg-blue-100"
                />
                {files.length > 0 ? (
                  <p className="mt-2 text-xs text-[#858c93]">
                    {files.length} file{files.length === 1 ? "" : "s"} selected
                  </p>
                ) : null}
                {errors.files ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.files}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {errors.form ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {errors.form}
            </p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadPdfs.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              {uploadPdfs.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Uploading...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" aria-hidden />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
