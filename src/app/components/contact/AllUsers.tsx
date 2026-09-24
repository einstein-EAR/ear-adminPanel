"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Mail, MessageSquare, Tag } from "lucide-react";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { formatToIST } from "@/src/lib/formatDate";
import type { ContactForm } from "@/src/types/contactForm";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type SortOrder = "newer" | "oldest";

function toIstDateKey(isoDate: string): string {
  if (!isoDate) return "";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function createdAtMs(isoDate: string): number {
  const time = new Date(isoDate).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function pageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = [1, total, current - 1, current, current + 1].filter(
    (page) => page >= 1 && page <= total,
  );
  const unique = [...new Set(pages)].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  unique.forEach((page, index) => {
    if (index > 0 && page - unique[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });

  return items;
}

function DetailField({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#858c93] uppercase">
        {icon}
        {label}
      </p>
      <div className="mt-1.5 text-sm text-[#092151]">{children}</div>
    </div>
  );
}

export default function AllUsers({ allUsers }: { allUsers: ContactForm[] }) {
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newer");
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const matched = allUsers.filter((user) => {
      if (!dateFilter) return true;
      return toIstDateKey(user.created_at) === dateFilter;
    });

    return [...matched].sort((a, b) => {
      const diff = createdAtMs(a.created_at) - createdAtMs(b.created_at);
      return sortOrder === "oldest" ? diff : -diff;
    });
  }, [allUsers, dateFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setExpandedId(null);
  }, [dateFilter, sortOrder, page, pageSize]);

  const currentPage = Math.min(page, totalPages);
  const rangeStart = filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredUsers.length);
  const pageRows = filteredUsers.slice(rangeStart === 0 ? 0 : rangeStart - 1, rangeEnd);

  const resetPage = () => setPage(1);

  const toggleRow = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#ededed] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-[#f7f9fc] pr-3 pl-3.5">
            <span className="text-xs font-semibold tracking-wide text-[#858c93] uppercase">Date</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                resetPage();
              }}
              className="bg-transparent text-sm text-[#092151] outline-none"
            />
          </label>

          {dateFilter ? (
            <button
              type="button"
              onClick={() => {
                setDateFilter("");
                resetPage();
              }}
              className="h-10 rounded-full px-3 text-sm font-medium text-[#036eb6] transition hover:bg-blue-50"
            >
              Clear
            </button>
          ) : null}

          <div
            className="inline-flex h-10 items-center rounded-full bg-[#f4f8fc] p-1"
            role="group"
            aria-label="Sort submissions"
          >
            {(["newer", "oldest"] as const).map((option) => {
              const selected = sortOrder === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSortOrder(option);
                    resetPage();
                  }}
                  className={`h-8 rounded-full px-3.5 text-sm font-medium capitalize transition ${
                    selected
                      ? "bg-white text-[#024081] shadow-sm"
                      : "text-[#858c93] hover:text-[#092151]"
                  }`}
                  aria-pressed={selected}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-[#858c93]">
          <span className="font-semibold text-[#092151]">{filteredUsers.length}</span>
          {dateFilter ? ` of ${allUsers.length}` : ""} submission
          {filteredUsers.length === 1 ? "" : "s"}
        </p>
      </div>

      {pageRows.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-[#858c93]">
          {allUsers.length === 0
            ? "No contact submissions yet."
            : "No submissions match this date."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-[#024081] text-white">
              <tr className="text-[11px] font-semibold tracking-wide uppercase">
                <th className="w-12 px-3 py-3.5" aria-label="Expand" />
                <th className="px-3 py-3.5 font-semibold">Name</th>
                <th className="px-3 py-3.5 font-semibold">Phone</th>
                <th className="px-3 py-3.5 font-semibold">Country</th>
                <th className="px-4 py-3.5 font-semibold">Requested time</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((user) => {
                const expanded = expandedId === user._id;
                const detailId = `contact-detail-${user._id}`;

                return (
                  <Fragment key={user._id}>
                    <tr
                      className={`cursor-pointer border-b transition-colors ${
                        expanded
                          ? "border-transparent bg-[#f4f8fc]"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                      onClick={() => toggleRow(user._id)}
                    >
                      <td className={`px-3 py-3 ${expanded ? "border-l-[3px] border-[#036eb6]" : "border-l-[3px] border-transparent"}`}>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={detailId}
                          aria-label={`${expanded ? "Hide" : "Show"} details for ${user.name || "submission"}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleRow(user._id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#036eb6] transition hover:bg-white"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                            aria-hidden
                          />
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#024081] to-[#036eb6] text-xs font-semibold text-white">
                            {(user.name || "?").charAt(0).toUpperCase()}
                          </span>
                          <span className="font-semibold text-[#092151]">{user.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-700">{user.phone || "—"}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#024081]">
                          {user.country || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {formatToIST(user.created_at)}
                      </td>
                    </tr>

                    {expanded ? (
                      <tr className="border-b border-slate-100 bg-[#f4f8fc]">
                        <td colSpan={5} className="border-l-[3px] border-[#036eb6] px-4 pt-0 pb-4">
                          <div
                            id={detailId}
                            className="ml-11 rounded-xl border border-blue-100 bg-white px-4 py-4 shadow-sm"
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <DetailField
                                icon={<Mail className="h-3.5 w-3.5 text-[#036eb6]" aria-hidden />}
                                label="Email"
                              >
                                {user.email ? (
                                  <a
                                    href={`mailto:${user.email}`}
                                    className="break-all font-medium text-[#024081] hover:text-[#036eb6]"
                                  >
                                    {user.email}
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </DetailField>
                              <DetailField
                                icon={<Tag className="h-3.5 w-3.5 text-[#036eb6]" aria-hidden />}
                                label="Subject"
                              >
                                <span className="font-medium">{user.subject || "—"}</span>
                              </DetailField>
                              <div className="sm:col-span-2">
                                <DetailField
                                  icon={
                                    <MessageSquare className="h-3.5 w-3.5 text-[#036eb6]" aria-hidden />
                                  }
                                  label="Message"
                                >
                                  <p className="leading-relaxed whitespace-pre-wrap text-slate-700">
                                    {user.message || "—"}
                                  </p>
                                </DetailField>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#858c93]">
            {filteredUsers.length === 0
              ? "Showing 0"
              : `Showing ${rangeStart}–${rangeEnd} of ${filteredUsers.length}`}
          </p>
          <label className="inline-flex items-center gap-2 text-sm text-[#858c93]">
            <span className="sr-only">Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]);
                resetPage();
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-[#092151] outline-none focus:border-[#036eb6]"
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage <= 1}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-[#024081] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Prev
          </button>

          {pageItems(currentPage, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-[#858c93]">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition ${
                  item === currentPage
                    ? "bg-[#024081] text-white"
                    : "text-[#092151] hover:bg-blue-50"
                }`}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-[#024081] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
