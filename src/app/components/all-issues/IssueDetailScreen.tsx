"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { useDeleteIssuePdf, useGetIssueById } from "@/src/hooks";
import { formatToIST } from "@/src/lib/formatDate";
import { toastError, toastSuccess } from "@/src/lib/toast";
import type { IssuePdf } from "@/src/types/issue";
import UploadPdfModal from "./UploadPdfModal";

type IssueDetailScreenProps = {
  journalId: string;
  issueId: string;
};

export default function IssueDetailScreen({ journalId, issueId }: IssueDetailScreenProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<IssuePdf | null>(null);
  const [pdfToDelete, setPdfToDelete] = useState<IssuePdf | null>(null);

  const { data: issue, isLoading, isError, error, refetch } = useGetIssueById(issueId);
  const deletePdf = useDeleteIssuePdf();

  const openCreateModal = () => {
    setEditingPdf(null);
    setModalOpen(true);
  };

  const openEditModal = (pdf: IssuePdf) => {
    setEditingPdf(pdf);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPdf(null);
  };

  const handleConfirmDelete = async () => {
    if (!pdfToDelete) return;

    try {
      await deletePdf.mutateAsync({
        pdfId: pdfToDelete._id,
        issueId,
      });
      toastSuccess("PDF deleted successfully.");
      setPdfToDelete(null);
      refetch();
    } catch (err) {
      toastError(err, "Failed to delete PDF. Please try again.");
    }
  };

  return (
    <PageContainer>
      <Link
        href={`/all-issues?journalId=${journalId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#024081] transition hover:text-[#036eb6]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to issues
      </Link>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading issue...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
          {error.message || "Failed to load issue."}
        </div>
      ) : issue ? (
        <>
          <div className="mb-6 rounded-2xl border border-[#ededed] bg-linear-to-r from-[#024081] to-[#036eb6] px-6 py-5 text-white shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Issue PDFs
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{issue.issueLabel}</h1>
            {issue.description ? (
              <p className="mt-2 text-sm text-blue-100">{issue.description}</p>
            ) : null}
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-100">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Created {formatToIST(issue.created_at)}
            </p>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#092151]">Uploaded PDFs</h2>
              <p className="mt-1 text-sm text-[#858c93]">
                {issue.pdfs.length} PDF{issue.pdfs.length === 1 ? "" : "s"} in this issue
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Upload PDF
            </button>
          </div>

          {issue.pdfs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <FileText className="mx-auto h-10 w-10 text-[#858c93]" aria-hidden />
              <p className="mt-4 text-sm text-[#858c93]">No PDFs uploaded yet.</p>
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#024081] transition hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Upload first PDF
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {issue.pdfs.map((pdf, index) => (
                <li
                  key={pdf._id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#ededed] bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#858c93]">#{index + 1}</p>
                    <h3 className="mt-1 text-base font-semibold text-[#092151]">{pdf.title}</h3>
                    {pdf.author ? (
                      <p className="mt-1 text-sm text-[#858c93]">Author: {pdf.author}</p>
                    ) : null}
                    {pdf.doi ? (
                      <p className="mt-0.5 text-sm text-[#858c93]">DOI: {pdf.doi}</p>
                    ) : null}
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#858c93]">
                      <Clock className="h-3.5 w-3.5 text-[#036eb6]" aria-hidden />
                      Uploaded {formatToIST(pdf.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={pdf.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-[#024081] transition hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      View
                    </a>
                    <a
                      href={pdf.pdfUrl}
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => openEditModal(pdf)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#036eb6]"
                      aria-label={`Edit ${pdf.title}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfToDelete(pdf)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      aria-label={`Delete ${pdf.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}

      {modalOpen ? (
        <UploadPdfModal
          key={editingPdf?._id ?? "upload-pdf"}
          issueId={issueId}
          open={modalOpen}
          pdf={editingPdf}
          onClose={closeModal}
          onSuccess={() => {
            refetch();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pdfToDelete)}
        title="Delete PDF"
        message={
          pdfToDelete
            ? `Are you sure you want to delete ${pdfToDelete.title}?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deletePdf.isPending}
        onClose={() => {
          if (!deletePdf.isPending) setPdfToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}
