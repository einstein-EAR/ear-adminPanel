"use client";

import {
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  ScrollText,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatToIST } from "@/src/lib/formatDate";
import type { PaperSubmission } from "@/src/types/paperSubmission";

const COLS = 3;
const PAGE_SIZE = COLS * 2;

function getFileName(url: string) {
  try {
    const segment = url.split("/").pop() ?? url;
    const decoded = decodeURIComponent(segment);
    const parts = decoded.split("-");
    if (parts.length > 2) {
      return parts.slice(2).join("-");
    }
    return decoded;
  } catch {
    return "View paper";
  }
}

function PaperCard({ paper, index }: { paper: PaperSubmission; index: number }) {
  const fileName = getFileName(paper.paperFileUrl);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#024081] to-[#036eb6] text-sm font-semibold text-white">
          {(paper.name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#858c93]">#{index}</p>
          <h3 className="truncate text-base font-semibold text-[#092151]">
            {paper.name || "—"}
          </h3>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-3 text-sm">
        <li className="flex items-start gap-2.5 text-slate-700">
          <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>
            <span className="block text-xs font-medium text-[#858c93]">Paper title</span>
            <span className="font-medium text-[#092151]">{paper.titleOfPaper || "—"}</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5 text-slate-700">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span className="break-all">{paper.emailId || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 text-slate-700">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>{paper.mobile || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 text-slate-700">
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>{paper.country || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 text-[#858c93]">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span className="line-clamp-4">{paper.message || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-[#858c93]">Submitted file</span>
            {paper.paperFileUrl ? (
              <a
                href={paper.paperFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate font-medium text-[#024081] transition hover:text-[#036eb6]"
              >
                <span className="truncate">{fileName}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
            ) : (
              <span>—</span>
            )}
          </span>
        </li>
        <li className="flex items-start gap-2.5 text-slate-600">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>
            <span className="block text-xs font-medium text-[#858c93]">Submitted (IST)</span>
            <span className="font-medium text-[#092151]">{formatToIST(paper.created_at)}</span>
          </span>
        </li>
        {/* <li className="flex items-start gap-2.5 text-slate-600">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>
            <span className="block text-xs font-medium text-[#858c93]">Last updated (IST)</span>
            <span className="font-medium text-[#092151]">{formatToIST(paper.updated_at)}</span>
          </span>
        </li> */}
      </ul>
    </article>
  );
}

export default function PaperData({ paperSubmissions }: { paperSubmissions: PaperSubmission[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visiblePapers = paperSubmissions.slice(0, visibleCount);
  const hasMore = visibleCount < paperSubmissions.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, paperSubmissions.length));
      setIsLoadingMore(false);
    }, 400);
  }, [paperSubmissions.length, hasMore, isLoadingMore]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [paperSubmissions.length]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: "120px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <section className="w-full">
      {visiblePapers.length === 0 ? (
        <div className="rounded-2xl border border-[#ededed] bg-white px-6 py-16 text-center text-sm text-[#858c93] shadow-sm">
          No paper submissions yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePapers.map((paper, index) => (
              <PaperCard key={paper._id} paper={paper} index={index + 1} />
            ))}
          </div>

          <div
            ref={loadMoreRef}
            className="mt-8 flex min-h-16 flex-col items-center justify-center gap-2"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-sm font-medium text-[#036eb6]">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Loading more submissions…
              </div>
            ) : hasMore ? (
              <p className="text-sm text-[#858c93]">Scroll down to load more</p>
            ) : (
              <p className="text-sm font-medium text-[#858c93]">
                Showing all {paperSubmissions.length} submission
                {paperSubmissions.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
