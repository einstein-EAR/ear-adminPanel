"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AllIssuesContent from "./AllIssuesContent";


export default function AllIssuesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm font-medium text-[#036eb6]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading...
        </div>
      }
    >
      <AllIssuesContent />
    </Suspense>
  );
}
