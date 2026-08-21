"use client";

import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { isAuthenticated, syncAuthCookie } from "@/src/lib/auth";

const PUBLIC_ROUTES = ["/login"];

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isDesktop) return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isDesktop]);

  useEffect(() => {
    syncAuthCookie();

    if (isPublicRoute) return;

    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [isPublicRoute, pathname, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen lg:flex lg:h-dvh lg:overflow-hidden">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex rounded-lg border border-slate-200 p-2.5 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#024081]"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#036eb6]">
            EAR Admin
          </p>
          <p className="truncate text-sm font-semibold text-[#092151]">Administration Panel</p>
        </div>
      </header>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(100vw,18rem)] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:h-full lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          mobileOpen || isDesktop ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin side menu"
        aria-hidden={!isDesktop && !mobileOpen}
        {...(!isDesktop && mobileOpen
          ? { "aria-modal": true as const, role: "dialog" }
          : {})}
      >
        <AdminSidebar
          showClose
          onClose={() => setMobileOpen(false)}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:overflow-y-auto">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
