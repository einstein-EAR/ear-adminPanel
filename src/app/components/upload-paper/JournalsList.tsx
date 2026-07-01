"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Hash, Loader2, Trash2 } from "lucide-react";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import { formatToIST } from "@/src/lib/formatDate";
import { useDeleteJournal } from "@/src/hooks";
import type { Journal } from "@/src/types/journal";

type JournalsListProps = {
  journals: Journal[];
  isLoading?: boolean;
};

type JournalCardProps = {
  journal: Journal;
  onDelete: (journal: Journal) => void;
};

function JournalCard({ journal, onDelete }: JournalCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/all-issues?journalId=${journal._id}`);
  };

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <button
        type="button"
        onClick={handleClick}
        className="flex h-full flex-col text-left"
      >
        <div className="relative aspect-3/4 w-full overflow-hidden bg-[#f4f8fc]">
          {journal.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={journal.imageUrl}
              alt={journal.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#858c93]">
              <BookOpen className="h-10 w-10" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-semibold text-[#092151]">{journal.title}</h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-[#036eb6]">
            <Hash className="h-4 w-4 shrink-0" aria-hidden />
            <span className="font-medium">{journal.serialNumber}</span>
          </div>

          <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-[#858c93]">
            {journal.description}
          </p>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 text-xs text-[#858c93]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#036eb6]" aria-hidden />
              {formatToIST(journal.created_at)}
            </span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onDelete(journal)}
        className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-600"
        aria-label={`Delete ${journal.title}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </article>
  );
}

export default function JournalsList({ journals, isLoading }: JournalsListProps) {
  const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const deleteJournal = useDeleteJournal();

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleConfirmDelete = async () => {
    if (!journalToDelete) return;

    try {
      await deleteJournal.mutateAsync({ journalId: journalToDelete._id });
      setSuccessMessage("Journal deleted successfully.");
      setJournalToDelete(null);
    } catch {
      // Error handling can be extended with inline error state if needed.
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading journals...
      </div>
    );
  }

  if (journals.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ededed] bg-white px-6 py-16 text-center text-sm text-[#858c93] shadow-sm">
        No journals found. Create your first journal to get started.
      </div>
    );
  }

  return (
    <section className="w-full">
      {successMessage ? (
        <div
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
          role="status"
        >
          {successMessage}
        </div>
      ) : null}

      <div className="mb-6 rounded-2xl bg-linear-to-r from-[#024081] to-[#036eb6] px-6 py-4 text-white shadow-md">
        <p className="text-sm font-medium text-blue-100">
          <span className="text-white">{journals.length}</span> journal
          {journals.length === 1 ? "" : "s"} published
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {journals.map((journal) => (
          <JournalCard
            key={journal._id}
            journal={journal}
            onDelete={setJournalToDelete}
          />
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(journalToDelete)}
        title="Delete journal"
        message={
          journalToDelete
            ? `Are you sure you want to delete ${journalToDelete.title}?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteJournal.isPending}
        onClose={() => {
          if (!deleteJournal.isPending) setJournalToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
