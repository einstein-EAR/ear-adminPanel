"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Hash, Loader2, Trash2 } from "lucide-react";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import { formatToIST } from "@/src/lib/formatDate";
import { toastError, toastSuccess } from "@/src/lib/toast";
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
    <article className="relative flex overflow-hidden rounded-2xl border border-blue-100 bg-[#f3f8fc] p-3 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-4">
      <button
        type="button"
        onClick={handleClick}
        className="flex min-w-0 flex-1 items-start gap-3 pr-10 text-left sm:gap-4"
      >
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white sm:h-28 sm:w-20">
          {journal.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={journal.imageUrl}
              alt={journal.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#858c93]">
              <BookOpen className="h-6 w-6" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <h3 className="text-sm font-bold uppercase leading-snug text-[#1d4f91] sm:text-base">
            {journal.title}
          </h3>

          <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#036eb6]">
            <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">ISSN / ISBN: {journal.serialNumber}</span>
          </p>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 sm:line-clamp-3">
            <span className="font-semibold text-[#092151]">About: </span>
            {journal.description}
          </p>

          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#858c93]">
            <Clock className="h-3.5 w-3.5 text-[#036eb6]" aria-hidden />
            {formatToIST(journal.created_at)}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onDelete(journal)}
        className="absolute top-3 right-3 rounded-lg bg-white p-2 text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-600"
        aria-label={`Delete ${journal.title}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </article>
  );
}

export default function JournalsList({ journals, isLoading }: JournalsListProps) {
  const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);

  const deleteJournal = useDeleteJournal();

  const handleConfirmDelete = async () => {
    if (!journalToDelete) return;

    try {
      await deleteJournal.mutateAsync({ journalId: journalToDelete._id });
      toastSuccess("Journal deleted successfully.");
      setJournalToDelete(null);
    } catch (error) {
      toastError(error, "Failed to delete journal. Please try again.");
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
      <div className="flex flex-col gap-4">
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
