import {
  Room,
  Booking,
  BlockedDate,
  Enquiry,
  Settings,
  PricingRule,
  Service,
} from "./types";
import { findBookingConflict } from "./availability";

const createSectionId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

// Default mock database state
export const DEFAULT_ROOMS: Room[] = [
  {
    id: "room-family",
    name: "Family Room",
    description:
      "A spacious modern room designed for family comfort. Styled with contemporary aesthetics, it features comfortable bedding and modern private washrooms.",
    max_guests: 4,
    base_price: 3500,
    amenities: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Geyser",
      "Tea/Coffee Maker",
      "Spacious Bath",
    ],
    photos: ["/images/bed-3a (3).jpg"],
    status: "active",
  },
  {
    id: "room-double",
    name: "Double Room",
    description:
      "A warm, elegantly decorated room ideal for couples or solo travelers. Features a plush double bed, ambient traditional lighting, and an attached modern bathroom.",
    max_guests: 2,
    base_price: 2500,
    amenities: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Geyser",
      "Queen Bed",
      "Private Bath",
    ],
    photos: ["/images/bed-1a.jpg"],
    status: "active",
  },
];

export const DEFAULT_SETTINGS: Settings = {
  booking_mode: "manual_approval",
  payment_options: ["at_property"],
  contact_details: {
    phone: "+91 7415160134, +91 9425094180",
    email: "agrawalhouse34@gmail.com",
    address: "27, Patwa Bakhal, Patni Bazar, Ujjain, Madhya Pradesh - 456001",
  },
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "service-pandit-booking",
    slug: "pandit-booking",
    name: "Pandit Booking",
    short_description:
      "Experienced pandits in Ujjain for pujas, rituals, and personalised booking support.",
    icon: "Landmark",
    cover_image: "/images/Mahakal.png",
    gallery: [
      "/images/Mahakal.png",
      "/images/front.jpg",
      "/images/hero_sunset.jpg",
    ],
    sort_order: 1,
    status: "active",
    sections: [
      {
        id: createSectionId("pandit-intro"),
        type: "rich-text",
        title: "Guided ritual support for every occasion",
        body: "We connect guests with experienced pandits in Ujjain for sacred rituals, personal ceremonies, and temple-related pujas. The full service structure is content-driven, so you can expand the list of pujas, add new guidance, or create new ritual packages without changing the page layout.",
      },
      {
        id: createSectionId("pandit-pujas"),
        type: "list",
        title: "Popular pujas we currently arrange",
        description:
          "This list is editable and can grow with every new ritual offering.",
        items: [
          "Mahakal Puja",
          "Mangal Dosh Puja",
          "Kaal Sarp Dosh Puja",
          "Rudrabhishek",
          "Navgrah Puja",
          "Pitra Dosh Puja",
        ],
      },
      {
        id: createSectionId("pandit-info"),
        type: "info-grid",
        title: "Service details",
        infoItems: [
          { label: "Booking style", value: "Advance or same-day support" },
          { label: "Languages", value: "Hindi / Sanskrit guidance" },
          {
            label: "Travel assistance",
            value: "Temple and location coordination",
          },
          { label: "Customisation", value: "New rituals can be added anytime" },
        ],
      },
      {
        id: createSectionId("pandit-faq"),
        type: "faq",
        title: "Frequently asked questions",
        faqs: [
          {
            question: "Can new pujas be added later?",
            answer:
              "Yes. The puja list is content-driven, so you can keep adding new rituals from the admin side without redesigning the page.",
          },
          {
            question: "Do you arrange material for the puja?",
            answer:
              "You can note required samagri in the section structure, and later extend it with custom instructions or item lists.",
          },
        ],
      },
      {
        id: createSectionId("pandit-cta"),
        type: "cta",
        title: "Plan a ritual with confidence",
        description:
          "Share the puja type, preferred date, and number of participants. We will help coordinate the right pandit and timing.",
        primaryCta: {
          label: "Enquiry for Pandit Booking",
          href: "/enquiry",
        },
        secondaryCta: {
          label: "Explore all services",
          href: "/services",
        },
      },
    ],
  },
  {
    id: "service-room-assistance",
    slug: "room-booking-assistance",
    name: "Room Booking Assistance",
    short_description:
      "Trusted nearby hotels, guest houses, and dharamshalas when our own rooms are full.",
    icon: "Hotel",
    cover_image: "/images/room_mango_suite.jpg",
    gallery: [
      "/images/room_mango_suite.jpg",
      "/images/room_terracotta_cottage.jpg",
      "/images/room_courtyard.jpg",
    ],
    sort_order: 2,
    status: "active",
    sections: [
      {
        id: createSectionId("room-assist-intro"),
        type: "rich-text",
        title: "Accommodation support beyond our property",
        body: "If rooms are unavailable at Agrawal House, we can arrange accommodation at trusted nearby properties we personally recommend. The page structure supports unlimited hotel options, room types, price details, images, and booking notes.",
      },
      {
        id: createSectionId("room-assist-options"),
        type: "list",
        title: "Accommodation options we can arrange",
        items: [
          "Comfortable hotels near Mahakaleshwar Temple",
          "Family-friendly guest houses",
          "Budget-friendly dharamshalas",
          "Short-stay options for pilgrims",
        ],
      },
      {
        id: createSectionId("room-assist-details"),
        type: "info-grid",
        title: "What you can document on this page",
        infoItems: [
          { label: "Hotel options", value: "Unlimited entries" },
          { label: "Room types", value: "Custom room categories" },
          { label: "Amenities", value: "Editable amenity lists" },
          { label: "Temple distance", value: "Distance from Mahakaleshwar" },
        ],
      },
      {
        id: createSectionId("room-assist-gallery"),
        type: "gallery",
        title: "Reference photos",
        images: [
          "/images/room_mango_suite.jpg",
          "/images/room_terracotta_cottage.jpg",
          "/images/bed-1a.jpg",
        ],
      },
      {
        id: createSectionId("room-assist-faq"),
        type: "faq",
        title: "Frequently asked questions",
        faqs: [
          {
            question: "Can I add more partner hotels later?",
            answer:
              "Yes. Add new accommodation entries from the admin content model whenever you want.",
          },
          {
            question: "Can we note pricing by room type?",
            answer:
              "Yes. Pricing can be documented as a dedicated section, including optional seasonal rates or notes.",
          },
        ],
      },
      {
        id: createSectionId("room-assist-cta"),
        type: "cta",
        title: "Need help finding a stay?",
        description:
          "Tell us your dates, guest count, and budget, and we will suggest the best available option.",
        primaryCta: {
          label: "Request room assistance",
          href: "/enquiry",
        },
        secondaryCta: {
          label: "View rooms",
          href: "/rooms",
        },
      },
    ],
  },
  {
    id: "service-taxi-services",
    slug: "taxi-services",
    name: "Taxi Services",
    short_description:
      "Local and outstation taxi support for temple visits, airport transfers, and nearby routes.",
    icon: "CarFront",
    cover_image: "/images/card.jpg",
    gallery: [
      "/images/card.jpg",
      "/images/front.jpg",
      "/images/hero_sunset.jpg",
    ],
    sort_order: 3,
    status: "active",
    sections: [
      {
        id: createSectionId("taxi-intro"),
        type: "rich-text",
        title: "Flexible taxi support for local and outstation travel",
        body: "We provide taxi services for both local travel and longer routes. Add or update routes, vehicle types, fare notes, timing estimates, and pickup details without changing the page structure.",
      },
      {
        id: createSectionId("taxi-routes"),
        type: "list",
        title: "Initial routes",
        description:
          "These routes are editable and can be expanded whenever new travel needs appear.",
        items: [
          "Ujjain → Indore",
          "Ujjain → Indore Airport",
          "Ujjain → Omkareshwar",
        ],
      },
      {
        id: createSectionId("taxi-details"),
        type: "info-grid",
        title: "Service details",
        infoItems: [
          {
            label: "Vehicle types",
            value: "Sedan, SUV, and outstation options",
          },
          { label: "Fare", value: "Optional route-wise pricing" },
          {
            label: "Pickup / drop",
            value: "Temple, hotel, and city pickup support",
          },
          {
            label: "Travel time",
            value: "Estimated timings can be listed per route",
          },
        ],
      },
      {
        id: createSectionId("taxi-gallery"),
        type: "gallery",
        title: "Travel images",
        images: [
          "/images/card.jpg",
          "/images/front.jpg",
          "/images/hero_sunset.jpg",
        ],
      },
      {
        id: createSectionId("taxi-pricing"),
        type: "pricing",
        title: "Route pricing placeholder",
        pricingItems: [
          { label: "Ujjain → Indore", note: "Add fare later if needed" },
          {
            label: "Ujjain → Indore Airport",
            note: "Optional airport transfer pricing",
          },
          {
            label: "Ujjain → Omkareshwar",
            note: "Flexible one-way or round-trip fare",
          },
        ],
      },
      {
        id: createSectionId("taxi-cta"),
        type: "cta",
        title: "Reserve your ride",
        description:
          "Use this content structure to add new routes, vehicle photos, and travel notes whenever you expand the fleet.",
        primaryCta: {
          label: "Request taxi booking",
          href: "/enquiry",
        },
        secondaryCta: {
          label: "View services",
          href: "/services",
        },
      },
    ],
  },
];

type MockDbState = {
  rooms: Room[];
  services: Service[];
  blockedDates: BlockedDate[];
  bookings: Booking[];
  enquiries: Enquiry[];
  settings: Settings;
  pricingRules: PricingRule[];
};

const STORAGE_KEYS = {
  rooms: "ah_rooms",
  services: "ah_services",
  blockedDates: "ah_blocked_dates",
  bookings: "ah_bookings",
  enquiries: "ah_enquiries",
  settings: "ah_settings",
} as const;

const createDefaultState = (): MockDbState => ({
  rooms: [...DEFAULT_ROOMS],
  services: [...DEFAULT_SERVICES],
  blockedDates: [],
  bookings: [],
  enquiries: [],
  settings: { ...DEFAULT_SETTINGS },
  pricingRules: [],
});

// In-Memory state for Server Side rendering mock database
class MockDB {
  private rooms: Room[] = [...DEFAULT_ROOMS];
  private services: Service[] = [...DEFAULT_SERVICES];
  private blockedDates: BlockedDate[] = [];
  private bookings: Booking[] = [];
  private enquiries: Enquiry[] = [];
  private settings: Settings = { ...DEFAULT_SETTINGS };
  private pricingRules: PricingRule[] = [];

  constructor() {
    const defaults = createDefaultState();
    this.rooms = defaults.rooms;
    this.services = defaults.services;
    this.blockedDates = defaults.blockedDates;
    this.bookings = defaults.bookings;
    this.enquiries = defaults.enquiries;
    this.settings = defaults.settings;
    this.pricingRules = defaults.pricingRules;
  }

  private isBrowser() {
    return typeof window !== "undefined";
  }

  private getStateSnapshot(): MockDbState {
    return {
      rooms: this.rooms,
      services: this.services,
      blockedDates: this.blockedDates,
      bookings: this.bookings,
      enquiries: this.enquiries,
      settings: this.settings,
      pricingRules: this.pricingRules,
    };
  }

  private applyState(state: MockDbState) {
    this.rooms = state.rooms;
    this.services = state.services;
    this.blockedDates = state.blockedDates;
    this.bookings = state.bookings;
    this.enquiries = state.enquiries;
    this.settings = state.settings;
    this.pricingRules = state.pricingRules;
  }

  private async loadState() {
    if (this.isBrowser()) {
      try {
        const storedRooms = localStorage.getItem(STORAGE_KEYS.rooms);
        const storedServices = localStorage.getItem(STORAGE_KEYS.services);
        const storedBlocked = localStorage.getItem(STORAGE_KEYS.blockedDates);
        const storedBookings = localStorage.getItem(STORAGE_KEYS.bookings);
        const storedEnquiries = localStorage.getItem(STORAGE_KEYS.enquiries);
        const storedSettings = localStorage.getItem(STORAGE_KEYS.settings);
        const storedPricingRules = localStorage.getItem("ah_pricing_rules");

        const parsedRooms = storedRooms ? JSON.parse(storedRooms) : null;
        if (parsedRooms) {
          const hasOldRooms = parsedRooms.some(
            (r: any) =>
              r.id === "room-mango-suite" ||
              r.id === "room-terracotta-cottage" ||
              r.id === "room-courtyard",
          );
          if (hasOldRooms) {
            this.rooms = [...DEFAULT_ROOMS];
            this.services = [...DEFAULT_SERVICES];
            this.blockedDates = [];
            this.bookings = [];
            this.saveState();
          } else {
            this.rooms = parsedRooms;
            this.services = storedServices
              ? JSON.parse(storedServices)
              : [...DEFAULT_SERVICES];
            this.blockedDates = storedBlocked ? JSON.parse(storedBlocked) : [];
            this.bookings = storedBookings ? JSON.parse(storedBookings) : [];
          }
        } else {
          this.rooms = [...DEFAULT_ROOMS];
          this.services = storedServices
            ? JSON.parse(storedServices)
            : [...DEFAULT_SERVICES];
          this.blockedDates = storedBlocked ? JSON.parse(storedBlocked) : [];
          this.bookings = storedBookings ? JSON.parse(storedBookings) : [];
        }

        this.enquiries = storedEnquiries ? JSON.parse(storedEnquiries) : [];
        this.settings = storedSettings
          ? JSON.parse(storedSettings)
          : { ...DEFAULT_SETTINGS };
        this.pricingRules = storedPricingRules
          ? JSON.parse(storedPricingRules)
          : [];
      } catch (e) {
        console.error("Error loading mock db from localStorage", e);
      }
      return;
    }

    try {
      const fs = await import("node:fs/promises");
      const filePath = `${process.cwd()}/.mock-db.json`;
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<MockDbState>;

      const hasOldRooms = parsed.rooms?.some(
        (r: any) =>
          r.id === "room-mango-suite" ||
          r.id === "room-terracotta-cottage" ||
          r.id === "room-courtyard",
      );

      if (hasOldRooms) {
        this.applyState({
          rooms: [...DEFAULT_ROOMS],
          services: [...DEFAULT_SERVICES],
          blockedDates: [],
          bookings: [],
          enquiries: parsed.enquiries ?? [],
          settings: parsed.settings ?? { ...DEFAULT_SETTINGS },
          pricingRules: parsed.pricingRules ?? [],
        });
        await this.saveState();
      } else {
        this.applyState({
          rooms: parsed.rooms ?? [...DEFAULT_ROOMS],
          services: parsed.services ?? [...DEFAULT_SERVICES],
          blockedDates: parsed.blockedDates ?? [],
          bookings: parsed.bookings ?? [],
          enquiries: parsed.enquiries ?? [],
          settings: parsed.settings ?? { ...DEFAULT_SETTINGS },
          pricingRules: parsed.pricingRules ?? [],
        });
      }
    } catch (e) {
      const defaults = createDefaultState();
      this.applyState(defaults);
    }
  }

  private async saveState() {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(this.rooms));
        localStorage.setItem(
          STORAGE_KEYS.services,
          JSON.stringify(this.services),
        );
        localStorage.setItem(
          STORAGE_KEYS.blockedDates,
          JSON.stringify(this.blockedDates),
        );
        localStorage.setItem(
          STORAGE_KEYS.bookings,
          JSON.stringify(this.bookings),
        );
        localStorage.setItem(
          STORAGE_KEYS.enquiries,
          JSON.stringify(this.enquiries),
        );
        localStorage.setItem(
          STORAGE_KEYS.settings,
          JSON.stringify(this.settings),
        );
        localStorage.setItem(
          "ah_pricing_rules",
          JSON.stringify(this.pricingRules),
        );
      } catch (e) {
        console.error("Error saving mock db to localStorage", e);
      }
      return;
    }

    try {
      const fs = await import("node:fs/promises");
      const filePath = `${process.cwd()}/.mock-db.json`;
      await fs.writeFile(
        filePath,
        JSON.stringify(this.getStateSnapshot(), null, 2),
        "utf8",
      );
    } catch (e) {
      console.error("Error saving mock db file", e);
    }
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    await this.loadState();
    return this.rooms;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    await this.loadState();
    return this.rooms.find((r) => r.id === id);
  }

  async saveRoom(room: Room): Promise<Room> {
    await this.loadState();
    const index = this.rooms.findIndex((r) => r.id === room.id);
    if (index >= 0) {
      this.rooms[index] = room;
    } else {
      this.rooms.push(room);
    }
    await this.saveState();
    return room;
  }

  // Services
  async getServices(): Promise<Service[]> {
    await this.loadState();
    return [...this.services].sort(
      (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
    );
  }

  async getService(slug: string): Promise<Service | undefined> {
    await this.loadState();
    return this.services.find((service) => service.slug === slug);
  }

  async saveService(service: Service): Promise<Service> {
    await this.loadState();
    const index = this.services.findIndex((entry) => entry.id === service.id);
    const nextService = {
      ...service,
      created_at: service.created_at ?? new Date().toISOString(),
    };

    if (index >= 0) {
      this.services[index] = nextService;
    } else {
      this.services.push(nextService);
    }

    this.services = [...this.services].sort(
      (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
    );
    await this.saveState();
    return nextService;
  }

  async deleteService(id: string): Promise<void> {
    await this.loadState();
    this.services = this.services.filter((service) => service.id !== id);
    await this.saveState();
  }

  // Blocked Dates
  async getBlockedDates(): Promise<BlockedDate[]> {
    await this.loadState();
    return this.blockedDates;
  }

  async addBlockedDate(blocked: Omit<BlockedDate, "id">): Promise<BlockedDate> {
    await this.loadState();
    const newBlocked: BlockedDate = {
      ...blocked,
      id: `block-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    this.blockedDates.push(newBlocked);
    await this.saveState();
    return newBlocked;
  }

  async deleteBlockedDate(id: string): Promise<void> {
    await this.loadState();
    this.blockedDates = this.blockedDates.filter((b) => b.id !== id);
    await this.saveState();
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    await this.loadState();
    // Attach room name helper
    return this.bookings.map((b) => ({
      ...b,
      room_name:
        this.rooms.find((r) => r.id === b.room_id)?.name || "Unknown Room",
    }));
  }

  async createBooking(
    booking: Omit<Booking, "id" | "status" | "payment_status" | "created_at">,
  ): Promise<Booking> {
    await this.loadState();
    const conflictMessage = findBookingConflict(
      booking.check_in,
      booking.check_out,
      this.bookings.filter(
        (existingBooking) => existingBooking.room_id === booking.room_id,
      ),
      this.blockedDates.filter(
        (blockedDate) => blockedDate.room_id === booking.room_id,
      ),
    );

    if (conflictMessage) {
      throw new Error(conflictMessage);
    }

    const newBooking: Booking = {
      ...booking,
      id: `booking-${Math.random().toString(36).substr(2, 9)}`,
      status:
        this.settings.booking_mode === "instant" ? "confirmed" : "pending",
      payment_status: booking.payment_method === "online" ? "paid" : "unpaid",
      created_at: new Date().toISOString(),
    };
    this.bookings.push(newBooking);
    await this.saveState();
    return newBooking;
  }

  async updateBookingStatus(
    id: string,
    status: Booking["status"],
    payment_status?: Booking["payment_status"],
  ): Promise<Booking | undefined> {
    await this.loadState();
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index >= 0) {
      this.bookings[index].status = status;
      if (payment_status) {
        this.bookings[index].payment_status = payment_status;
      }
      await this.saveState();
      return this.bookings[index];
    }
    return undefined;
  }

  // Enquiries
  async getEnquiries(): Promise<Enquiry[]> {
    await this.loadState();
    return this.enquiries;
  }

  async createEnquiry(
    enquiry: Omit<Enquiry, "id" | "status" | "created_at">,
  ): Promise<Enquiry> {
    await this.loadState();
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `enq-${Math.random().toString(36).substr(2, 9)}`,
      status: "new",
      created_at: new Date().toISOString(),
    };
    this.enquiries.push(newEnquiry);
    await this.saveState();
    return newEnquiry;
  }

  async updateEnquiryStatus(
    id: string,
    status: Enquiry["status"],
  ): Promise<Enquiry | undefined> {
    await this.loadState();
    const index = this.enquiries.findIndex((e) => e.id === id);
    if (index >= 0) {
      this.enquiries[index].status = status;
      await this.saveState();
      return this.enquiries[index];
    }
    return undefined;
  }

  // Pricing Rules
  async getPricingRules(): Promise<PricingRule[]> {
    await this.loadState();
    return this.pricingRules;
  }

  async getPricingRuleForDate(
    roomId: string,
    date: string,
  ): Promise<PricingRule | undefined> {
    await this.loadState();
    return this.pricingRules
      .filter(
        (r) =>
          r.room_id === roomId &&
          r.is_active &&
          r.start_date <= date &&
          r.end_date >= date,
      )
      .sort((a, b) => b.priority - a.priority)[0];
  }

  async addPricingRule(rule: Omit<PricingRule, "id">): Promise<PricingRule> {
    await this.loadState();
    const newRule: PricingRule = {
      ...rule,
      id: `pricing-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    this.pricingRules.push(newRule);
    await this.saveState();
    return newRule;
  }

  async updatePricingRule(
    id: string,
    updates: Partial<Omit<PricingRule, "id">>,
  ): Promise<PricingRule | undefined> {
    await this.loadState();
    const index = this.pricingRules.findIndex((r) => r.id === id);
    if (index >= 0) {
      this.pricingRules[index] = {
        ...this.pricingRules[index],
        ...updates,
      };
      await this.saveState();
      return this.pricingRules[index];
    }
    return undefined;
  }

  async deletePricingRule(id: string): Promise<void> {
    await this.loadState();
    this.pricingRules = this.pricingRules.filter((r) => r.id !== id);
    await this.saveState();
  }

  // Settings
  async getSettings(): Promise<Settings> {
    await this.loadState();
    return this.settings;
  }

  async saveSettings(settings: Settings): Promise<Settings> {
    await this.loadState();
    this.settings = settings;
    await this.saveState();
    return this.settings;
  }
}

export const mockDB = new MockDB();
