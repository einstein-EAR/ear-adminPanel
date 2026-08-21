"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileUp, Loader2, Pencil, ScrollText, User, X } from "lucide-react";
import { useUpdateIssuePdf, useUploadIssuePdfs } from "@/src/hooks";
import { toastError, toastSuccess } from "@/src/lib/toast";
import type { IssuePdf } from "@/src/types/issue";

type UploadPdfModalProps = {
  issueId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  pdf?: IssuePdf | null;
};

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

export default function UploadPdfModal({
  issueId,
  open,
  onClose,
  onSuccess,
  pdf = null,
}: UploadPdfModalProps) {
  const isEdit = Boolean(pdf);
  const [title, setTitle] = useState(pdf?.title ?? "");
  const [author, setAuthor] = useState(pdf?.author ?? "");
  const [doi, setDoi] = useState(pdf?.doi ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState({
    title: "",
    author: "",
    doi: "",
    files: "",
  });

  const uploadPdfs = useUploadIssuePdfs();
  const updatePdf = useUpdateIssuePdf();
  const isPending = uploadPdfs.isPending || updatePdf.isPending;

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

  const validate = () => {
    const next = { title: "", author: "", doi: "", files: "" };

    if (!title.trim()) next.title = "PDF title is required";
    if (!author.trim()) next.author = "Author is required";
    if (!doi.trim()) next.doi = "DOI is required";

    if (!isEdit) {
      if (files.length === 0) next.files = "Select at least one PDF file";
      else if (files.some((file) => file.type !== "application/pdf")) {
        next.files = "Only PDF files are allowed";
      }
    } else if (files.length > 0 && files.some((file) => file.type !== "application/pdf")) {
      next.files = "Only PDF files are allowed";
    }

    setErrors(next);
    return !next.title && !next.author && !next.doi && !next.files;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({ title: "", author: "", doi: "", files: "" });

    if (!validate()) return;

    try {
      if (isEdit && pdf) {
        await updatePdf.mutateAsync({
          pdfId: pdf._id,
          issueId,
          title: title.trim(),
          author: author.trim(),
          doi: doi.trim(),
          file: files[0] ?? null,
        });
        toastSuccess("PDF updated successfully.");
      } else {
        await uploadPdfs.mutateAsync({
          issueId,
          title: title.trim(),
          author: author.trim(),
          doi: doi.trim(),
          files,
        });
        toastSuccess("PDF uploaded successfully.");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      toastError(
        err,
        isEdit
          ? "Failed to update PDF. Please try again."
          : "Failed to upload PDFs. Please try again.",
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
        aria-labelledby="upload-pdf-title"
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="upload-pdf-title" className="text-xl font-semibold text-[#092151]">
              {isEdit ? "Edit PDF" : "Upload PDF"}
            </h2>
            <p className="mt-1 text-sm text-[#858c93]">
              {isEdit
                ? "Update PDF details. Replace the file only if needed."
                : "Add PDF files with title, author, and DOI."}
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
                    setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="Paper title or document name"
                  className={fieldClassName}
                  disabled={isPending}
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
            <label htmlFor="pdf-author" className="mb-1.5 block text-sm font-medium text-slate-700">
              Author
            </label>
            <div className="flex items-start gap-3">
              <User className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  id="pdf-author"
                  type="text"
                  value={author}
                  onChange={(e) => {
                    setAuthor(e.target.value);
                    setErrors((prev) => ({ ...prev, author: "" }));
                  }}
                  placeholder="Author name"
                  className={fieldClassName}
                  disabled={isPending}
                />
                {errors.author ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.author}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="pdf-doi" className="mb-1.5 block text-sm font-medium text-slate-700">
              DOI
            </label>
            <input
              id="pdf-doi"
              type="text"
              value={doi}
              onChange={(e) => {
                setDoi(e.target.value);
                setErrors((prev) => ({ ...prev, doi: "" }));
              }}
              placeholder="10.1000/xyz123"
              className={fieldClassName}
              disabled={isPending}
            />
            {errors.doi ? (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.doi}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="pdf-files" className="mb-1.5 block text-sm font-medium text-slate-700">
              {isEdit ? "Replace PDF (optional)" : "PDF files"}
            </label>
            <div className="flex items-start gap-3">
              <FileUp className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  id="pdf-files"
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple={!isEdit}
                  onChange={(e) => {
                    setFiles(Array.from(e.target.files ?? []));
                    setErrors((prev) => ({ ...prev, files: "" }));
                  }}
                  className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#f4f8fc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#024081] hover:file:bg-blue-100"
                  disabled={isPending}
                />
                {files.length > 0 ? (
                  <p className="mt-2 text-xs text-[#858c93]">
                    {files.length} file{files.length === 1 ? "" : "s"} selected
                  </p>
                ) : isEdit && pdf ? (
                  <p className="mt-2 text-xs text-[#858c93]">Current file will be kept if none selected.</p>
                ) : null}
                {errors.files ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.files}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
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
                  {isEdit ? "Saving..." : "Uploading..."}
                </>
              ) : isEdit ? (
                <>
                  <Pencil className="h-4 w-4" aria-hidden />
                  Save changes
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
