"use client";

import {
  Clock,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Tag,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatToIST } from "@/src/lib/formatDate";
import type { ContactForm } from "@/src/types/contactForm";

const COLS = 3;
const PAGE_SIZE = COLS * 2;

function UserCard({ user, index }: { user: ContactForm; index: number }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#024081] to-[#036eb6] text-sm font-semibold text-white">
          {(user.name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          {/* <p className="text-xs font-medium text-[#858c93]">#{index}</p> */}
          <h3 className="truncate text-base font-semibold text-[#092151]">
            {user.name || "—"}
          </h3>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-3 text-sm">
        <li className="flex items-start gap-2.5 text-slate-700">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span className="break-all">{user.email || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 text-slate-700">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>{user.phone || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 text-slate-700">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>{user.subject || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 text-slate-700">
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>{user.country || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 text-[#858c93]">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span className="line-clamp-4">{user.message || "—"}</span>
        </li>
        <li className="flex items-start gap-2.5 border-t border-slate-100 pt-3 text-slate-600">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>
            <span className="block text-xs font-medium text-[#858c93]">Requested Time</span>
            <span className="font-medium text-[#092151]">{formatToIST(user.created_at)}</span>
          </span>
        </li>
        {/* <li className="flex items-start gap-2.5 text-slate-600">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#036eb6]" aria-hidden />
          <span>
            <span className="block text-xs font-medium text-[#858c93]">Last updated (IST)</span>
            <span className="font-medium text-[#092151]">{formatToIST(user.updated_at)}</span>
          </span>
        </li> */}
      </ul>
    </article>
  );
}

export default function AllUsers({ allUsers }: { allUsers: ContactForm[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleUsers = allUsers.slice(0, visibleCount);
  const hasMore = visibleCount < allUsers.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allUsers.length));
      setIsLoadingMore(false);
    }, 400);
  }, [allUsers.length, hasMore, isLoadingMore]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [allUsers.length]);

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
      {visibleUsers.length === 0 ? (
        <div className="rounded-2xl border border-[#ededed] bg-white px-6 py-16 text-center text-sm text-[#858c93] shadow-sm">
          No contact submissions yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleUsers.map((user, index) => (
              <UserCard key={user._id} user={user} index={index + 1} />
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
                Showing all {allUsers.length} submission
                {allUsers.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
