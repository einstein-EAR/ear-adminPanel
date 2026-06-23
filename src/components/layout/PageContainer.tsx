import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:py-10 lg:px-8 lg:py-12">
      {children}
    </div>
  );
}
