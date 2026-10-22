"use client";

import EditorialBoardManager from "../components/editorial-board/EditorialBoardManager";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { useGetEditorialBoard } from "@/src/hooks";

export default function EditorialBoardPage() {
  const { isError, error, refetch } = useGetEditorialBoard();

  return (
    <PageContainer>
      <PageHeader
        title="Editorial board"
        description="Create editor categories (Editor-in-Chief, Associate Editors, reviewers, and so on), then add each member’s name, role, affiliation, and email—matching your public editorial board page."
      />

      {isError ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
            {error.message || "Failed to load editorial board."}
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
        <EditorialBoardManager />
      )}
    </PageContainer>
  );
}
