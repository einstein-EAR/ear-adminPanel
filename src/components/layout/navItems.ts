import {
  Contact,
  FileText,
  LayoutDashboard,
  Settings,
  Type,
  Upload,
  BookOpen,
  Library,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview and quick stats",
  },
  {
    label: "Contacts",
    href: "/contactUsers",
    icon: Contact,
    description: "Contact form submissions",
  },
  {
    label: "Paper Submission",
    href: "/paper-submission",
    icon: FileText,
    description: "Review submitted manuscripts",
  },
  {
    label: "Upload a Paper",
    href: "/upload-paper",
    icon: Upload,
    description: "Add or publish new papers",
  },
  {
    label: "View Journals",
    href: "/view-journals",
    icon: Library,
    description: "Browse created journals",
  },
  {
    label: "Volumes & Issues",
    href: "/volumes",
    icon: BookOpen,
    description: "Manage publication volumes",
  },
  {
    label: "Title and Icons",
    href: "/title-and-icons",
    icon: Type,
    description: "Site title, contact info and branding",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Site and panel preferences",
  },
];
