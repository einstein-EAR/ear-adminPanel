"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  Globe,
  Hash,
  ImagePlus,
  Loader2,
  Mail,
  Phone,
  Save,
  Type,
} from "lucide-react";
import { useUpdateSiteSettings } from "@/src/hooks";
import { toastError, toastSuccess } from "@/src/lib/toast";
import type { SiteSettings } from "@/src/types/siteSettings";

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

type SiteSettingsFormProps = {
  settings: SiteSettings;
  isNew?: boolean;
};

type ImageField = "favIcon" | "iconImage";

function ImageUploadField({
  id,
  label,
  description,
  currentUrl,
  previewUrl,
  error,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  currentUrl: string;
  previewUrl: string | null;
  error?: string;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}) {
  const displayUrl = previewUrl || currentUrl || null;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <p className="mb-3 text-xs text-[#858c93]">{description}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-[#f4f8fc]">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt={label} className="h-full w-full object-contain p-2" />
          ) : (
            <ImagePlus className="h-8 w-8 text-[#858c93]" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <input
            id={id}
            type="file"
            accept="image/*"
            disabled={disabled}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#f4f8fc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#024081] hover:file:bg-blue-100"
          />
          {error ? (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SiteSettingsForm({ settings, isNew = false }: SiteSettingsFormProps) {
  const [title, setTitle] = useState(settings.title);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [issn, setIssn] = useState(settings.issn);
  const [favIcon, setFavIcon] = useState<File | null>(null);
  const [iconImage, setIconImage] = useState<File | null>(null);
  const [favIconPreview, setFavIconPreview] = useState<string | null>(null);
  const [iconImagePreview, setIconImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    email: "",
    favIcon: "",
    iconImage: "",
  });

  const favIconPreviewRef = useRef<string | null>(null);
  const iconImagePreviewRef = useRef<string | null>(null);

  const updateSiteSettings = useUpdateSiteSettings();

  useEffect(() => {
    return () => {
      if (favIconPreviewRef.current) URL.revokeObjectURL(favIconPreviewRef.current);
      if (iconImagePreviewRef.current) URL.revokeObjectURL(iconImagePreviewRef.current);
    };
  }, []);

  const handleImageChange = (
    field: ImageField,
    file: File | null,
    event?: ChangeEvent<HTMLInputElement>,
  ) => {
    const setFile = field === "favIcon" ? setFavIcon : setIconImage;
    const setPreview = field === "favIcon" ? setFavIconPreview : setIconImagePreview;
    const previewRef = field === "favIcon" ? favIconPreviewRef : iconImagePreviewRef;

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setFile(file);
    setErrors((prev) => ({ ...prev, [field]: "" }));

    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, [field]: "Only image files are allowed" }));
        setFile(null);
        if (event) event.target.value = "";
        return;
      }

      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const validate = () => {
    const next = { title: "", email: "", favIcon: "", iconImage: "" };

    if (!title.trim()) next.title = "Title is required";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address";
    }

    setErrors(next);
    return !next.title && !next.email && !next.favIcon && !next.iconImage;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({ title: "", email: "", favIcon: "", iconImage: "" });

    if (!validate()) return;

    try {
      await updateSiteSettings.mutateAsync({
        title: title.trim(),
        subtitle: subtitle.trim(),
        phone: phone.trim(),
        email: email.trim(),
        issn: issn.trim(),
        ...(favIcon ? { favIcon } : {}),
        ...(iconImage ? { iconImage } : {}),
      });
      toastSuccess(
        isNew ? "Site settings created successfully." : "Site settings updated successfully.",
      );
    } catch (error) {
      toastError(
        error,
        isNew
          ? "Failed to save site settings. Please try again."
          : "Failed to update site settings. Please try again.",
      );
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
            <Globe className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#092151]">Title &amp; icons</h2>
            <p className="text-sm text-[#858c93]">
              {isNew
                ? "Add the public site title, contact details, and branding images."
                : "Manage the public site title, contact details, and branding images."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="site-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </label>
            <div className="flex items-start gap-3">
              <Type className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  id="site-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="EAR Journal"
                  className={fieldClassName}
                  disabled={updateSiteSettings.isPending}
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
              htmlFor="site-subtitle"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Subtitle
            </label>
            <input
              id="site-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Research publications"
              className={fieldClassName}
              disabled={updateSiteSettings.isPending}
            />
          </div>

          <div>
            <label htmlFor="site-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <div className="flex items-start gap-3">
              <Phone className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <input
                id="site-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
                className={fieldClassName}
                disabled={updateSiteSettings.isPending}
              />
            </div>
          </div>

          <div>
            <label htmlFor="site-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <div className="flex items-start gap-3">
              <Mail className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  id="site-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="info@example.com"
                  className={fieldClassName}
                  disabled={updateSiteSettings.isPending}
                />
                {errors.email ? (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="site-issn" className="mb-1.5 block text-sm font-medium text-slate-700">
              ISSN
            </label>
            <div className="flex items-start gap-3">
              <Hash className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
              <input
                id="site-issn"
                type="text"
                value={issn}
                onChange={(e) => setIssn(e.target.value)}
                placeholder="1234-5678"
                className={fieldClassName}
                disabled={updateSiteSettings.isPending}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-dashed border-slate-200 bg-[#f4f8fc] p-5">
          <ImageUploadField
            id="site-favicon"
            label="Favicon"
            description={
              isNew
                ? "Small icon shown in browser tabs."
                : "Small icon shown in browser tabs. Leave empty to keep the current image."
            }
            currentUrl={settings.favIcon}
            previewUrl={favIconPreview}
            error={errors.favIcon}
            disabled={updateSiteSettings.isPending}
            onChange={(file) => handleImageChange("favIcon", file)}
          />

          <ImageUploadField
            id="site-icon-image"
            label="Icon image"
            description={
              isNew
                ? "Main site logo or branding image."
                : "Main site logo or branding image. Leave empty to keep the current image."
            }
            currentUrl={settings.iconImage}
            previewUrl={iconImagePreview}
            error={errors.iconImage}
            disabled={updateSiteSettings.isPending}
            onChange={(file) => handleImageChange("iconImage", file)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={updateSiteSettings.isPending}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {updateSiteSettings.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-5 w-5" aria-hidden />
            {isNew ? "Save settings" : "Save changes"}
          </>
        )}
      </button>
    </form>
  );
}
