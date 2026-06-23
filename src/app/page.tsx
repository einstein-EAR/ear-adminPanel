import Link from "next/link";
import { Contact, FileText, Upload } from "lucide-react";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { users } from "@/src/apiData/userData";

const quickLinks = [
  {
    label: "Contacts",
    href: "/contactUsers",
    icon: Contact,
    count: users.length,
    description: "View contact submissions",
  },
  {
    label: "Paper Submission",
    href: "/paper-submission",
    icon: FileText,
    count: null,
    description: "Review manuscript submissions",
  },
  {
    label: "Upload a Paper",
    href: "/upload-paper",
    icon: Upload,
    count: null,
    description: "Publish or upload new papers",
  },
];

export default function Home() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Manage contacts, paper submissions, and publication content from one place."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#036eb6] transition group-hover:bg-linear-to-br group-hover:from-[#024081] group-hover:to-[#036eb6] group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                {link.count !== null ? (
                  <span className="rounded-full bg-[#f4f8fc] px-3 py-1 text-xs font-semibold text-[#024081]">
                    {link.count}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#092151] group-hover:text-[#036eb6]">
                {link.label}
              </h2>
              <p className="mt-2 text-sm text-[#858c93]">{link.description}</p>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
