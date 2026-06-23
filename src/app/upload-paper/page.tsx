import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";

export default function UploadPaperPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Upload a paper"
        description="Add new papers or update existing publication records."
      />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm text-[#858c93]">
          Upload and publish workflow will be available here soon.
        </p>
      </div>
    </PageContainer>
  );
}
