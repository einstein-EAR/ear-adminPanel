"use client";

import { Loader2, X } from "lucide-react";
import { PointerEvent, useEffect, useRef, useState } from "react";

const OUTPUT_WIDTH = 1600;
const OUTPUT_HEIGHT = 900;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type ImageAdjusterProps = {
  open: boolean;
  file?: File | null;
  imageUrl?: string | null;
  onClose: () => void;
  onApply: (file: File) => void;
};

type Size = { w: number; h: number };
type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampFocal(focal: Point, zoom: number, frame: Size, natural: Size): Point {
  if (!frame.w || !frame.h || !natural.w || !natural.h) return focal;

  const coverScale = Math.max(frame.w / natural.w, frame.h / natural.h);
  const dispW = natural.w * coverScale * zoom;
  const dispH = natural.h * coverScale * zoom;
  const halfX = frame.w / 2 / dispW;
  const halfY = frame.h / 2 / dispH;

  return {
    x: clamp(focal.x, halfX, 1 - halfX),
    y: clamp(focal.y, halfY, 1 - halfY),
  };
}

async function fileFromImageUrl(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("Could not load the saved image.");
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("The saved file is not an image.");
  }

  return new File([blob], "news-image", { type: blob.type });
}

export default function ImageAdjuster({
  open,
  file = null,
  imageUrl = null,
  onClose,
  onApply,
}: ImageAdjusterProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ x: number; y: number; focal: Point } | null>(null);
  const loadedKeyRef = useRef("");

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [frame, setFrame] = useState<Size>({ w: 0, h: 0 });
  const [natural, setNatural] = useState<Size>({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [focal, setFocal] = useState<Point>({ x: 0.5, y: 0.5 });
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !applying) onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, applying, onClose]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let objectUrl = "";

    const sourceKey = file
      ? `${file.name}:${file.size}:${file.lastModified}`
      : (imageUrl ?? "");
    const keepFrame = loadedKeyRef.current === sourceKey && sourceKey !== "";
    loadedKeyRef.current = sourceKey;

    if (!keepFrame) {
      setZoom(MIN_ZOOM);
      setFocal({ x: 0.5, y: 0.5 });
    }
    setNatural({ w: 0, h: 0 });
    setError("");
    setSourceFile(null);
    setPreviewUrl(null);

    const attach = (nextFile: File) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(nextFile);
      setSourceFile(nextFile);
      setPreviewUrl(objectUrl);
      setLoading(false);
    };

    if (file) {
      setLoading(true);
      attach(file);
    } else if (imageUrl) {
      setLoading(true);
      fileFromImageUrl(imageUrl)
        .then((nextFile) => {
          if (!cancelled) attach(nextFile);
        })
        .catch(() => {
          if (cancelled) return;
          setLoading(false);
          setError("This saved image can't be adjusted here. Upload the file again to crop it.");
        });
    } else {
      setError("Choose an image to adjust.");
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, file, imageUrl]);

  useEffect(() => {
    const node = frameRef.current;
    if (!open || !node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      setFrame((current) =>
        current.w === rect.width && current.h === rect.height
          ? current
          : { w: rect.width, h: rect.height },
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open, previewUrl]);

  useEffect(() => {
    setFocal((current) => clampFocal(current, zoom, frame, natural));
  }, [zoom, frame, natural]);

  if (!open) return null;

  const coverScale =
    frame.w && natural.w ? Math.max(frame.w / natural.w, frame.h / natural.h) : 0;
  const displayScale = coverScale * zoom;
  const displayWidth = natural.w * displayScale;
  const displayHeight = natural.h * displayScale;
  const imageLeft = frame.w / 2 - focal.x * displayWidth;
  const imageTop = frame.h / 2 - focal.y * displayHeight;
  const ready = Boolean(previewUrl && natural.w && frame.w && !loading && !error);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, focal };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !displayWidth || !displayHeight) return;

    const next = clampFocal(
      {
        x: drag.focal.x - (event.clientX - drag.x) / displayWidth,
        y: drag.focal.y - (event.clientY - drag.y) / displayHeight,
      },
      zoom,
      frame,
      natural,
    );
    setFocal(next);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setDragging(false);
  };

  const handleApply = async () => {
    const image = imageRef.current;
    if (!ready || !image || !sourceFile || applying) return;

    setApplying(true);
    setError("");

    try {
      const srcW = Math.min(natural.w, frame.w / displayScale);
      const srcH = Math.min(natural.h, frame.h / displayScale);
      const srcX = clamp(focal.x * natural.w - srcW / 2, 0, natural.w - srcW);
      const srcY = clamp(focal.y * natural.h - srcH / 2, 0, natural.h - srcH);

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare the image.");

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      const outputType = sourceFile.type === "image/png" ? "image/png" : "image/jpeg";
      if (outputType === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      }
      context.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error("Could not save the adjusted image."));
          },
          outputType,
          0.92,
        );
      });

      const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || "news-image";
      const extension = outputType === "image/png" ? "png" : "jpg";
      onApply(new File([blob], `${baseName}-cropped.${extension}`, { type: outputType }));
    } catch (applyError) {
      setError(
        applyError instanceof Error ? applyError.message : "Could not save the adjusted image.",
      );
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close image adjuster"
        onClick={applying ? undefined : onClose}
        disabled={applying}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-adjuster-title"
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="image-adjuster-title" className="text-lg font-semibold text-[#092151]">
              Adjust image
            </h2>
            <p className="mt-1 text-sm text-[#858c93]">
              Drag to reposition and use the slider to zoom. The photo is saved as a 16:9 crop.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div
          ref={frameRef}
          className={`relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 touch-none ${
            dragging ? "cursor-grabbing" : ready ? "cursor-grab" : ""
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imageRef}
              src={previewUrl}
              alt=""
              draggable={false}
              onLoad={(event) => {
                setNatural({
                  w: event.currentTarget.naturalWidth,
                  h: event.currentTarget.naturalHeight,
                });
              }}
              className="absolute max-w-none select-none"
              style={{
                width: displayWidth || undefined,
                height: displayHeight || undefined,
                left: imageLeft,
                top: imageTop,
                visibility: displayWidth ? "visible" : "hidden",
              }}
            />
          ) : null}
          {loading || (previewUrl && !natural.w) ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Loading image...
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <label htmlFor="news-image-zoom" className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Zoom</span>
            <span className="tabular-nums text-[#036eb6]">{Math.round(zoom * 100)}%</span>
          </label>
          <input
            id="news-image-zoom"
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            disabled={!ready || applying}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-[#036eb6] disabled:opacity-50"
          />
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(MIN_ZOOM);
              setFocal({ x: 0.5, y: 0.5 });
            }}
            disabled={!ready || applying}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#024081] transition hover:bg-blue-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!ready || applying}
            className="flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 sm:flex-1"
          >
            {applying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Applying...
              </>
            ) : (
              "Use this crop"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
