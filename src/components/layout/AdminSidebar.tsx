"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuth, getUser } from "@/src/lib/auth";
import { navItems } from "./navItems";

type AdminSidebarProps = {
  onNavigate?: () => void;
  onClose?: () => void;
  showClose?: boolean;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ onNavigate, onClose, showClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    queryClient.clear();
    onNavigate?.();
    router.replace("/login");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-[#024081]/20 bg-linear-to-r from-[#024081] via-[#036eb6] to-[#024081] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
              Administration
            </p>
            <h1 className="mt-1 text-lg font-bold text-white">EAR Admin Panel</h1>
          </div>
          {showClose && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors duration-200 ${
                    active
                      ? "bg-blue-50 text-[#024081] shadow-sm ring-1 ring-blue-100"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[#024081]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      active ? "text-[#036eb6]" : "text-[#858c93] group-hover:text-[#036eb6]"
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    {item.description ? (
                      <span
                        className={`mt-0.5 block text-xs leading-snug ${
                          active ? "text-[#036eb6]/80" : "text-[#858c93]"
                        }`}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-slate-100 px-4 py-4">
        {user ? (
          <div className="mb-3 rounded-xl bg-[#f4f8fc] px-3 py-3">
            <p className="truncate text-sm font-semibold text-[#092151]">{user.name}</p>
            <p className="truncate text-xs text-[#858c93]">{user.email}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Logout
        </button>
        <p className="mt-3 text-center text-xs text-[#858c93]">© EAR Publication Admin</p>
      </div>
    </div>
  );
}
