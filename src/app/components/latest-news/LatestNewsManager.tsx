"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ImagePlus,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import { formatToIST } from "@/src/lib/formatDate";
import { toastError, toastSuccess } from "@/src/lib/toast";
import {
  useCreateLatestNews,
  useDeleteLatestNews,
  useGetLatestNews,
  useUpdateLatestNews,
} from "@/src/hooks";
import type { LatestNews } from "@/src/types/latestNews";

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function LatestNewsManager() {
  const { data: newsItems = [], isLoading } = useGetLatestNews();
  const createNews = useCreateLatestNews();
  const updateNews = useUpdateLatestNews();
  const deleteNews = useDeleteLatestNews();

  const [editing, setEditing] = useState<LatestNews | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [itemToDelete, setItemToDelete] = useState<LatestNews | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    excerpt: "",
    image: "",
    sortOrder: "",
  });

  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setExcerpt("");
    setPublishedAt("");
    setSortOrder("0");
    handleImageChange(null);
    setFileInputKey((prev) => prev + 1);
    setErrors({ title: "", excerpt: "", image: "", sortOrder: "" });
  };

  const startEdit = (item: LatestNews) => {
    setEditing(item);
    setTitle(item.title);
    setExcerpt(item.excerpt);
    setPublishedAt(toDateInputValue(item.publishedAt));
    setSortOrder(String(item.sortOrder ?? 0));
    handleImageChange(null);
    setImagePreview(item.imageUrl);
    setFileInputKey((prev) => prev + 1);
    setErrors({ title: "", excerpt: "", image: "", sortOrder: "" });
  };

  const handleImageChange = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setImage(file);

    if (file) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setImagePreview(url);
    } else if (!editing) {
      setImagePreview(null);
    }
  };

  const validate = () => {
    const next = { title: "", excerpt: "", image: "", sortOrder: "" };

    if (!title.trim()) next.title = "Title is required";
    if (!excerpt.trim()) next.excerpt = "Excerpt is required";
    if (!editing && !image) next.image = "News image is required";
    if (image && !image.type.startsWith("image/")) {
      next.image = "Only image files are allowed";
    }
    if (sortOrder !== "" && Number.isNaN(Number(sortOrder))) {
      next.sortOrder = "Sort order must be a number";
    }

    setErrors(next);
    return !next.title && !next.excerpt && !next.image && !next.sortOrder;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      if (editing) {
        await updateNews.mutateAsync({
          newsId: editing._id,
          title,
          excerpt,
          publishedAt: publishedAt || undefined,
          sortOrder: Number(sortOrder || 0),
          image,
        });
        toastSuccess("News item updated successfully.");
      } else {
        if (!image) return;
        await createNews.mutateAsync({
          title,
          excerpt,
          publishedAt: publishedAt || undefined,
          sortOrder: Number(sortOrder || 0),
          image,
        });
        toastSuccess("News item created successfully.");
      }
      resetForm();
    } catch (error) {
      toastError(
        error,
        editing ? "Failed to update news item." : "Failed to create news item.",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteNews.mutateAsync({ newsId: itemToDelete._id });
      toastSuccess("News item deleted successfully.");
      if (editing?._id === itemToDelete._id) {
        resetForm();
      }
      setItemToDelete(null);
    } catch (error) {
      toastError(error, "Failed to delete news item. Please try again.");
    }
  };

  const isSaving = createNews.isPending || updateNews.isPending;

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#036eb6]">
              {editing ? <Pencil className="h-5 w-5" aria-hidden /> : <Plus className="h-5 w-5" aria-hidden />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#092151]">
                {editing ? "Edit news item" : "Add news item"}
              </h2>
              <p className="text-sm text-[#858c93]">
                This appears in the Latest news section on the website homepage.
              </p>
            </div>
          </div>
          {editing ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-5">
            <div>
              <label htmlFor="news-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="news-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="2026 author submission window now open"
                className={fieldClassName}
              />
              {errors.title ? (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.title}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="news-excerpt" className="mb-1.5 block text-sm font-medium text-slate-700">
                Excerpt
              </label>
              <textarea
                id="news-excerpt"
                rows={4}
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setErrors((prev) => ({ ...prev, excerpt: "" }));
                }}
                placeholder="Short summary shown on the news card..."
                className={`${fieldClassName} resize-none`}
              />
              {errors.excerpt ? (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.excerpt}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="news-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Published date
                </label>
                <input
                  id="news-date"
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="news-sort" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Sort order
                </label>
                <input
                  id="news-sort"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setErrors((prev) => ({ ...prev, sortOrder: "" }));
                  }}
                  className={fieldClassName}
                />
                {errors.sortOrder ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.sortOrder}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="news-image" className="mb-1.5 block text-sm font-medium text-slate-700">
                Image {editing ? "(optional on edit)" : ""}
              </label>
              <input
                key={fileInputKey}
                id="news-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleImageChange(e.target.files?.[0] ?? null);
                  setErrors((prev) => ({ ...prev, image: "" }));
                }}
                className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#f4f8fc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#024081] hover:file:bg-blue-100"
              />
              {errors.image ? (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.image}
                </p>
              ) : null}
            </div>
          </div>

          <aside className="rounded-2xl border border-dashed border-slate-200 bg-[#f4f8fc] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#036eb6]">
              Image preview
            </p>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="News preview" className="h-full w-full object-cover" />
              ) : (
                <div className="px-4 text-center text-sm text-[#858c93]">
                  <ImagePlus className="mx-auto mb-2 h-8 w-8" aria-hidden />
                  Upload an image to preview it here
                </div>
              )}
            </div>
          </aside>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              {editing ? "Saving changes..." : "Creating news..."}
            </>
          ) : editing ? (
            "Save changes"
          ) : (
            "Create news item"
          )}
        </button>
      </form>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#036eb6]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading news...
        </div>
      ) : newsItems.length === 0 ? (
        <div className="rounded-2xl border border-[#ededed] bg-white px-6 py-16 text-center text-sm text-[#858c93] shadow-sm">
          No news items yet. Add the first update to show it on the website.
        </div>
      ) : (
        <section className="grid gap-4">
          {newsItems.map((item) => (
            <article
              key={item._id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:flex-row"
            >
              <div className="h-40 w-full shrink-0 bg-[#f4f8fc] sm:h-auto sm:w-48">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#858c93]">
                    <Newspaper className="h-8 w-8" aria-hidden />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                <h3 className="text-base font-semibold text-[#092151]">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-[#858c93]">{item.excerpt}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#858c93]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#036eb6]" aria-hidden />
                  {formatToIST(item.publishedAt || item.created_at)}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#024081] transition hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(itemToDelete)}
        title="Delete news item"
        message={
          itemToDelete
            ? `Are you sure you want to delete "${itemToDelete.title}"?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteNews.isPending}
        onClose={() => {
          if (!deleteNews.isPending) setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
