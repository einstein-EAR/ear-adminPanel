import {
  Contact,
  FileText,
  LayoutDashboard,
  Newspaper,
  Scale,
  Settings,
  Type,
  Upload,
  BookOpen,
  Library,
  Users,
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
    label: "Editorial Board",
    href: "/editorial-board",
    icon: Users,
    description: "Editor categories and board members",
  },
  {
    label: "Latest News",
    href: "/latest-news",
    icon: Newspaper,
    description: "Homepage news cards and updates",
  },
  {
    label: "Publication Ethics",
    href: "/publication-ethics",
    icon: Scale,
    description: "Write and edit the ethics statement",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Site and panel preferences",
  },
];
