"use client";

import { useRouter } from "next/navigation";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import CreateJournalForm from "../components/upload-paper/CreateJournalForm";

export default function UploadPaperPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        title="Create journal"
        description="Add a new journal publication with cover image and serial details."
      />

      <CreateJournalForm onCreated={() => router.push("/view-journals")} />
    </PageContainer>
  );
}
