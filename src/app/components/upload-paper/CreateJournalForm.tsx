"use client";

import { BookOpen, Hash, ImagePlus, Loader2, ScrollText } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ApiError } from "@/src/lib/api";
import { useCreateJournal } from "@/src/hooks";

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

export default function CreateJournalForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    serialNumber: "",
    image: "",
    form: "",
  });
  const [success, setSuccess] = useState(false);

  const createJournal = useCreateJournal();
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

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
    } else {
      setImagePreview(null);
    }
  };

  const validate = () => {
    const next = { title: "", description: "", serialNumber: "", image: "", form: "" };

    if (!title.trim()) next.title = "Journal title is required";
    if (!description.trim()) next.description = "Description is required";
    if (!serialNumber.trim()) next.serialNumber = "Serial number is required";
    if (!image) next.image = "Journal cover image is required";
    else if (!image.type.startsWith("image/")) next.image = "Only image files are allowed";

    setErrors(next);
    return !next.title && !next.description && !next.serialNumber && !next.image;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({ title: "", description: "", serialNumber: "", image: "", form: "" });
    setSuccess(false);

    if (!validate() || !image) return;

    try {
      await createJournal.mutateAsync({
        title,
        description,
        serialNumber,
        image,
      });

      setTitle("");
      setDescription("");
      setSerialNumber("");
      handleImageChange(null);
      setFileInputKey((prev) => prev + 1);
      setSuccess(true);
      onCreated?.();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? typeof error.data === "object" &&
            error.data !== null &&
            "message" in error.data &&
            typeof (error.data as { message: unknown }).message === "string"
            ? (error.data as { message: string }).message
            : error.message
          : "Failed to create journal. Please try again.";

      setErrors((prev) => ({ ...prev, form: message }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#036eb6]">
            <BookOpen className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#092151]">Create journal</h2>
            <p className="text-sm text-[#858c93]">
              Add a new journal with title, description, serial number, and cover image.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div>
            <label htmlFor="journal-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </label>
            <div className="flex items-start gap-3">
              <BookOpen className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  id="journal-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: "", form: "" }));
                  }}
                  placeholder="International Journal of Research..."
                  className={fieldClassName}
                />
                {errors.title ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.title}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="serial-number"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Serial number
            </label>
            <div className="flex items-start gap-3">
              <Hash className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  id="serial-number"
                  type="text"
                  value={serialNumber}
                  onChange={(e) => {
                    setSerialNumber(e.target.value);
                    setErrors((prev) => ({ ...prev, serialNumber: "", form: "" }));
                  }}
                  placeholder="e.g. ISSN 2455-6211"
                  className={fieldClassName}
                />
                {errors.serialNumber ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.serialNumber}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="journal-description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <div className="flex items-start gap-3">
              <ScrollText className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <textarea
                  id="journal-description"
                  rows={5}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((prev) => ({ ...prev, description: "", form: "" }));
                  }}
                  placeholder="Brief description about the journal scope, indexing, and publication details..."
                  className={`${fieldClassName} resize-none`}
                />
                {errors.description ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="journal-image" className="mb-1.5 block text-sm font-medium text-slate-700">
              Cover image
            </label>
            <div className="flex items-start gap-3">
              <ImagePlus className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  key={fileInputKey}
                  id="journal-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageChange(e.target.files?.[0] ?? null);
                    setErrors((prev) => ({ ...prev, image: "", form: "" }));
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
          </div>
        </div>

        <aside className="rounded-2xl border border-dashed border-slate-200 bg-[#f4f8fc] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#036eb6]">
            Image preview
          </p>
          <div className="flex aspect-3/4 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Journal cover preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="px-4 text-center text-sm text-[#858c93]">
                Upload a cover image to preview it here
              </div>
            )}
          </div>
        </aside>
      </div>

      {errors.form ? (
        <p
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {errors.form}
        </p>
      ) : null}

      {success ? (
        <p
          className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          Journal created successfully.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={createJournal.isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
      >
        {createJournal.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Creating journal...
          </>
        ) : (
          "Create journal"
        )}
      </button>
    </form>
  );
}
