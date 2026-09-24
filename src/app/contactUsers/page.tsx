"use client";

import AllUsers from "../components/contact/AllUsers";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { useContactForms } from "@/src/hooks";
import { Loader2 } from "lucide-react";

export default function ContactUsers() {
  const { data: contactForms, isLoading, isError, error } = useContactForms();

  return (
    <PageContainer>
      <PageHeader
        title="Contact submissions"
        description="Review inquiries from the contact form. Open a row to see the email, subject, and message."
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading contact submissions…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
          {error.message || "Failed to load contact submissions."}
        </div>
      ) : (
        <AllUsers allUsers={contactForms ?? []} />
      )}
    </PageContainer>
  );
}
