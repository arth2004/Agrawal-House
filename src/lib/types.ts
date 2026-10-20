export interface Room {
  id: string;
  name: string;
  description: string;
  max_guests: number;
  base_price: number;
  amenities: string[];
  photos: string[];
  status: "active" | "inactive";
  created_at?: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServicePricingItem {
  label: string;
  value?: string;
  note?: string;
}

export interface ServiceInfoItem {
  label: string;
  value: string;
  detail?: string;
}

export interface ServiceSection {
  id: string;
  type:
    | "rich-text"
    | "list"
    | "gallery"
    | "faq"
    | "pricing"
    | "info-grid"
    | "cta"
    | "custom";
  title?: string;
  description?: string;
  body?: string;
  items?: string[];
  faqs?: ServiceFaq[];
  pricingItems?: ServicePricingItem[];
  infoItems?: ServiceInfoItem[];
  images?: string[];
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  customFields?: Record<string, string>;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  icon: string;
  cover_image: string;
  gallery: string[];
  sections: ServiceSection[];
  sort_order: number;
  status: "active" | "inactive" | "paused";
  created_at?: string;
}

export interface BlockedDate {
  id: string;
  room_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason?: string;
  source?: "manual" | "ical"; // Where this block came from
  ical_uid?: string; // UID from the iCal event (for tracking)
  ical_config_id?: string; // Which sync config created this block
  created_at?: string;
}

export interface IcalSyncConfig {
  id: string;
  room_id: string;
  platform: string; // "makemytrip" | "airbnb" | "booking.com" | "other"
  ical_url: string; // The .ics export URL from MMT/Airbnb
  label: string; // Display name, e.g. "MakeMyTrip - Deluxe Room"
  is_active: boolean;
  last_synced_at?: string; // ISO timestamp of last successful sync
  last_error?: string; // Last sync error message (if any)
  created_at?: string;
}

export interface Booking {
  id: string;
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  num_guests: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_method: "online" | "at_property";
  payment_status: "unpaid" | "partial" | "paid";
  amount_total: number;
  razorpay_payment_id?: string;
  notes?: string;
  created_at?: string;
  room_name?: string; // Joint helper
}

export interface Enquiry {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: "new" | "responded";
  created_at?: string;
}

export interface PricingRule {
  id: string;
  room_id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  price_modifier: number; // multiplier on base_price
  priority: number;
  is_active: boolean;
  created_at?: string;
}

export interface Settings {
  booking_mode: "instant" | "manual_approval";
  payment_options: ("online" | "at_property")[];
  contact_details: {
    phone: string;
    email: string;
    address: string;
  };
}

export interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
  category: string;
  sort_order?: number;
  created_at?: string;
}

