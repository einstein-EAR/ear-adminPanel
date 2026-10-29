"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";

const FONT_SIZES = ["14px", "16px", "18px", "20px", "24px", "28px", "32px"] as const;

const ALLOWED_TAGS = new Set(["b", "strong", "i", "em", "u", "span", "br", "p", "div"]);

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function visibleText(html: string) {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  }

  const container = document.createElement("div");
  container.innerHTML = html;
  return container.textContent ?? "";
}

function readFontSize(element: HTMLElement) {
  const styleSize = element.style.fontSize;
  if (/^\d+(\.\d+)?px$/.test(styleSize)) return styleSize;
  if (styleSize === "xxx-large" || styleSize === "-webkit-xxx-large") return "32px";

  const attr = element.getAttribute("size");
  const mapped: Record<string, string> = {
    "1": "14px",
    "2": "16px",
    "3": "18px",
    "4": "20px",
    "5": "24px",
    "6": "28px",
    "7": "32px",
  };
  return attr ? (mapped[attr] ?? "") : "";
}

function sanitizeNode(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const fontSize = tag === "font" || tag === "span" ? readFontSize(element) : "";

  if (fontSize) {
    const span = doc.createElement("span");
    span.style.fontSize = fontSize;
    appendSanitizedChildren(element, span, doc);
    return span.childNodes.length > 0 ? span : null;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const fragment = doc.createDocumentFragment();
    appendSanitizedChildren(element, fragment, doc);
    return fragment;
  }

  const clean = doc.createElement(tag);
  if (tag !== "br") {
    appendSanitizedChildren(element, clean, doc);
  }
  return clean;
}

function appendSanitizedChildren(source: Node, target: Node, doc: Document) {
  for (const child of Array.from(source.childNodes)) {
    const clean = sanitizeNode(child, doc);
    if (clean) target.appendChild(clean);
  }
}

export function sanitizeRichText(html: string) {
  if (typeof document === "undefined" || !html.trim()) return "";

  const parsed = new DOMParser().parseFromString(html, "text/html");
  const doc = document.implementation.createHTMLDocument("");
  appendSanitizedChildren(parsed.body, doc.body, doc);
  const text = doc.body.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
  return text ? doc.body.innerHTML.trim() : "";
}

function toEditorHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return sanitizeRichText(trimmed);

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function applyCommand(command: "bold" | "italic" | "underline") {
  document.execCommand("styleWithCSS", false, "false");
  document.execCommand(command);
}

function applyFontSize(editor: HTMLElement, size: string) {
  editor.querySelectorAll("font[size='7'], span").forEach((node) => {
    const element = node as HTMLElement;
    const current = element.style.fontSize;
    if (
      element.tagName === "FONT" ||
      current === "xxx-large" ||
      current === "-webkit-xxx-large"
    ) {
      element.dataset.existingSize = "true";
    }
  });

  editor.focus();
  document.execCommand("styleWithCSS", false, "true");
  document.execCommand("fontSize", false, "7");

  editor.querySelectorAll("font[size='7']").forEach((node) => {
    if (node.dataset.existingSize) {
      delete node.dataset.existingSize;
      return;
    }
    const span = document.createElement("span");
    span.style.fontSize = size;
    span.innerHTML = node.innerHTML;
    node.replaceWith(span);
  });

  editor.querySelectorAll("span").forEach((span) => {
    const current = span.style.fontSize;
    if (current !== "xxx-large" && current !== "-webkit-xxx-large") return;
    if (span.dataset.existingSize) {
      delete span.dataset.existingSize;
      return;
    }
    span.style.fontSize = size;
  });

  editor.querySelectorAll("[data-existing-size]").forEach((node) => {
    delete (node as HTMLElement).dataset.existingSize;
  });
}

const toolButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-[#024081] transition hover:bg-blue-50 aria-pressed:bg-[#024081] aria-pressed:text-white";

export default function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write here...",
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [empty, setEmpty] = useState(() => !visibleText(value).trim());
  const [active, setActive] = useState({ bold: false, italic: false, underline: false });
  const [fontSize, setFontSize] = useState("");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const next = toEditorHtml(value);
    if (editor.innerHTML !== next) {
      editor.innerHTML = next;
      setEmpty(!visibleText(next).trim());
    }
  }, [value]);

  const publish = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const text = editor.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    setEmpty(!text);
    onChange(text ? editor.innerHTML : "");
  };

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    if (!editor.contains(selection.anchorNode)) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const range = savedRangeRef.current;
    if (!editor || !range) return;
    editor.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const refreshActiveState = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || !editor.contains(selection.anchorNode)) {
      setActive({ bold: false, italic: false, underline: false });
      return;
    }

    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  };

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActiveState);
    return () => document.removeEventListener("selectionchange", refreshActiveState);
  }, []);

  const runCommand = (command: "bold" | "italic" | "underline") => {
    restoreSelection();
    applyCommand(command);
    publish();
    refreshActiveState();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors focus-within:border-[#036eb6] focus-within:ring-2 focus-within:ring-[#036eb6]/20">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-[#f4f8fc] px-2 py-2">
        <button
          type="button"
          className={toolButtonClass}
          aria-label="Bold"
          aria-pressed={active.bold}
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            saveSelection();
            runCommand("bold");
          }}
        >
          <Bold className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={toolButtonClass}
          aria-label="Italic"
          aria-pressed={active.italic}
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            saveSelection();
            runCommand("italic");
          }}
        >
          <Italic className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={toolButtonClass}
          aria-label="Underline"
          aria-pressed={active.underline}
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            saveSelection();
            runCommand("underline");
          }}
        >
          <Underline className="h-4 w-4" aria-hidden />
        </button>
        <label className="ml-1 text-xs font-medium text-slate-500" htmlFor={`${id}-size`}>
          Font size
        </label>
        <select
          id={`${id}-size`}
          value={fontSize}
          disabled={disabled}
          onMouseDown={saveSelection}
          onChange={(event) => {
            const size = event.target.value;
            setFontSize("");
            if (!size) return;
            restoreSelection();
            const editor = editorRef.current;
            if (!editor) return;
            applyFontSize(editor, size);
            publish();
          }}
          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:border-[#036eb6] focus:outline-none"
        >
          <option value="">Size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        {empty ? (
          <span className="pointer-events-none absolute left-4 top-3 text-slate-400">{placeholder}</span>
        ) : null}
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label="Ethics text"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={publish}
          onKeyUp={refreshActiveState}
          onMouseUp={refreshActiveState}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            publish();
          }}
          className="min-h-80 px-4 py-3 text-base leading-7 text-slate-800 outline-none [&_b]:font-bold [&_div]:mb-3 [&_em]:italic [&_i]:italic [&_p]:mb-3 [&_strong]:font-bold [&_u]:underline"
        />
      </div>
    </div>
  );
}
