import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";

export default function VolumesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Volumes & issues"
        description="Organize publication volumes and issue listings."
      />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm text-[#858c93]">
          Volume and issue management will be added here soon.
        </p>
      </div>
    </PageContainer>
  );
}
