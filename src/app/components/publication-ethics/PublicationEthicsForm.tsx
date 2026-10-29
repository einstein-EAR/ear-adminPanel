"use client";

import { FormEvent, useState } from "react";
import { Loader2, Save, Scale } from "lucide-react";
import RichTextEditor, {
  sanitizeRichText,
  visibleText,
} from "@/src/components/ui/RichTextEditor";
import { useUpdatePublicationEthics } from "@/src/hooks";
import { toastError, toastSuccess } from "@/src/lib/toast";
import type { PublicationEthics } from "@/src/types/publicationEthics";

type PublicationEthicsFormProps = {
  ethics: PublicationEthics;
  isNew?: boolean;
};

export default function PublicationEthicsForm({
  ethics,
  isNew = false,
}: PublicationEthicsFormProps) {
  const [content, setContent] = useState(ethics.content);
  const updateEthics = useUpdatePublicationEthics();

  const previewHtml = sanitizeRichText(content);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const saved = await updateEthics.mutateAsync({ content: previewHtml });
      setContent(saved.content ?? "");
      toastSuccess(
        previewHtml
          ? isNew
            ? "Publication ethics saved."
            : "Publication ethics updated."
          : "Publication ethics cleared.",
      );
    } catch (saveError) {
      toastError(saveError, "Failed to save publication ethics. Please try again.");
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
            <Scale className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#092151]">Publication ethics</h2>
            <p className="text-sm text-[#858c93]">
              {isNew
                ? "Write the ethics statement, then use the toolbar to set size, bold, italic, or underline."
                : "Select text and use the toolbar to change its size, bold, italic, or underline."}
            </p>
          </div>
        </div>
      </div>

      <label htmlFor="publication-ethics" className="mb-1.5 block text-sm font-medium text-slate-700">
        Ethics text
      </label>
      <RichTextEditor
        id="publication-ethics"
        value={content}
        onChange={setContent}
        placeholder="Write the publication ethics policy. Select text to change its style."
        disabled={updateEthics.isPending}
      />
      <p className="mt-1.5 text-xs text-[#858c93]">
        Select the words you want to change, then choose a font size or a style. Saving an empty
        editor clears the public page. {visibleText(content).trim().length} characters
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-[#f4f8fc] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#036eb6]">Preview</p>
        {previewHtml ? (
          <div
            className="mt-3 text-base leading-7 text-slate-800 [&_b]:font-bold [&_div]:mb-3 [&_em]:italic [&_i]:italic [&_p]:mb-3 [&_strong]:font-bold [&_u]:underline"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <p className="mt-3 text-sm text-[#858c93]">The public page is empty until you save text.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={updateEthics.isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {updateEthics.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-5 w-5" aria-hidden />
            {isNew ? "Save ethics" : "Save changes"}
          </>
        )}
      </button>
    </form>
  );
}
