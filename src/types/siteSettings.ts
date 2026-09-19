export type SiteSettings = {
  _id: string;
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  issn: string;
  favIcon: string;
  iconImage: string;
  created_at: string;
  updated_at: string;
};

export const EMPTY_SITE_SETTINGS: SiteSettings = {
  _id: "",
  title: "",
  subtitle: "",
  phone: "",
  email: "",
  issn: "",
  favIcon: "",
  iconImage: "",
  created_at: "",
  updated_at: "",
};

export type UpdateSiteSettingsInput = {
  title?: string;
  subtitle?: string;
  phone?: string;
  email?: string;
  issn?: string;
  favIcon?: File | null;
  iconImage?: File | null;
};
