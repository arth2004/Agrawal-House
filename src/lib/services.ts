import {
  BadgeIndianRupee,
  Building2,
  CarFront,
  Clock3,
  HelpCircle,
  Hotel,
  Landmark,
  ListChecks,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Images,
} from "lucide-react";

export const SERVICE_ICON_OPTIONS = [
  { value: "Landmark", label: "Landmark / Temple" },
  { value: "Hotel", label: "Hotel / Stay" },
  { value: "CarFront", label: "Taxi / Car" },
  { value: "Building2", label: "Buildings / Local business" },
  { value: "MapPin", label: "Location marker" },
  { value: "Clock3", label: "Timings / Availability" },
  { value: "BadgeIndianRupee", label: "Pricing / Rates" },
  { value: "Images", label: "Photo / Gallery" },
  { value: "ListChecks", label: "Checklist / Inclusions" },
  { value: "HelpCircle", label: "Help / FAQ" },
  { value: "ShieldCheck", label: "Trust / Verification" },
  { value: "Search", label: "Search / Discovery" },
  { value: "Sparkles", label: "General / Premium" },
] as const;

export const SERVICE_ICON_MAP = {
  Landmark,
  Hotel,
  CarFront,
  Building2,
  MapPin,
  Clock3,
  BadgeIndianRupee,
  Images,
  ListChecks,
  HelpCircle,
  ShieldCheck,
  Search,
  Sparkles,
} as const;

export const slugifyServiceName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
