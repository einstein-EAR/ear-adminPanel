"use client";

import { Loader2 } from "lucide-react";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import PublicationEthicsForm from "@/src/app/components/publication-ethics/PublicationEthicsForm";
import { useGetPublicationEthics } from "@/src/hooks";
import { ApiError } from "@/src/lib/api";
import { getApiErrorMessage } from "@/src/lib/toast";
import { EMPTY_PUBLICATION_ETHICS } from "@/src/types/publicationEthics";

export default function PublicationEthicsPage() {
  const { data: ethics, isLoading, isError, error } = useGetPublicationEthics();

  const isMissing = isError && error instanceof ApiError && error.status === 404;
  const hasExistingEthics = Boolean(ethics?._id);
  const formEthics = ethics ?? EMPTY_PUBLICATION_ETHICS;

  return (
    <PageContainer>
      <PageHeader
        title="Publication ethics"
        description="Write the publication ethics text and style it with font size, bold, italic, and underline."
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading publication ethics...
        </div>
      ) : (
        <>
          {isError && !isMissing ? (
            <div
              className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
              role="alert"
            >
              <p className="font-semibold">Could not load publication ethics</p>
              <p className="mt-1 text-amber-800">
                {getApiErrorMessage(error, "Failed to load publication ethics.")} You can still
                write the text and save it below.
              </p>
            </div>
          ) : !hasExistingEthics ? (
            <div
              className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-[#024081]"
              role="status"
            >
              <p className="font-semibold">No publication ethics text yet</p>
              <p className="mt-1 text-[#036eb6]">
                Write the ethics statement below and save it. You can edit the same text later.
              </p>
            </div>
          ) : null}

          <PublicationEthicsForm
            key={ethics?.updated_at ?? "new-publication-ethics"}
            ethics={formEthics}
            isNew={!hasExistingEthics}
          />
        </>
      )}
    </PageContainer>
  );
}
