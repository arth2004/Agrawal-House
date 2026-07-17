import { Room, Booking, BlockedDate, Enquiry, Settings, PricingRule } from "./types";
import { findBookingConflict } from "./availability";

// Default mock database state
export const DEFAULT_ROOMS: Room[] = [
  {
    id: "room-family",
    name: "Family Room",
    description: "A spacious heritage room designed for family comfort. Styled with local aesthetics, it features high ceilings, comfortable bedding, and modern private washrooms.",
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
    description: "A warm, elegantly decorated room ideal for couples or solo travelers. Features a plush double bed, ambient traditional lighting, and an attached modern bathroom.",
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
  }
];

export const DEFAULT_SETTINGS: Settings = {
  booking_mode: "manual_approval",
  payment_options: ["at_property"],
  contact_details: {
    phone: "+91 7415160134, +91 9425094180",
    email: "agrawalhouse34@gmail.com",
    address:
      "27, Patwa Bakhal, Patni Bazar, Ujjain, Madhya Pradesh - 456001",
  },
};

type MockDbState = {
  rooms: Room[];
  blockedDates: BlockedDate[];
  bookings: Booking[];
  enquiries: Enquiry[];
  settings: Settings;
  pricingRules: PricingRule[];
};

const STORAGE_KEYS = {
  rooms: "ah_rooms",
  blockedDates: "ah_blocked_dates",
  bookings: "ah_bookings",
  enquiries: "ah_enquiries",
  settings: "ah_settings",
} as const;

const createDefaultState = (): MockDbState => ({
  rooms: [...DEFAULT_ROOMS],
  blockedDates: [],
  bookings: [],
  enquiries: [],
  settings: { ...DEFAULT_SETTINGS },
  pricingRules: [],
});

// In-Memory state for Server Side rendering mock database
class MockDB {
  private rooms: Room[] = [...DEFAULT_ROOMS];
  private blockedDates: BlockedDate[] = [];
  private bookings: Booking[] = [];
  private enquiries: Enquiry[] = [];
  private settings: Settings = { ...DEFAULT_SETTINGS };
  private pricingRules: PricingRule[] = [];

  constructor() {
    const defaults = createDefaultState();
    this.rooms = defaults.rooms;
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
      blockedDates: this.blockedDates,
      bookings: this.bookings,
      enquiries: this.enquiries,
      settings: this.settings,
      pricingRules: this.pricingRules,
    };
  }

  private applyState(state: MockDbState) {
    this.rooms = state.rooms;
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
        const storedBlocked = localStorage.getItem(STORAGE_KEYS.blockedDates);
        const storedBookings = localStorage.getItem(STORAGE_KEYS.bookings);
        const storedEnquiries = localStorage.getItem(STORAGE_KEYS.enquiries);
        const storedSettings = localStorage.getItem(STORAGE_KEYS.settings);
        const storedPricingRules = localStorage.getItem("ah_pricing_rules");

        const parsedRooms = storedRooms ? JSON.parse(storedRooms) : null;
        if (parsedRooms) {
          const hasOldRooms = parsedRooms.some((r: any) => 
            r.id === 'room-mango-suite' || 
            r.id === 'room-terracotta-cottage' || 
            r.id === 'room-courtyard'
          );
          if (hasOldRooms) {
            this.rooms = [...DEFAULT_ROOMS];
            this.blockedDates = [];
            this.bookings = [];
            this.saveState();
          } else {
            this.rooms = parsedRooms;
            this.blockedDates = storedBlocked ? JSON.parse(storedBlocked) : [];
            this.bookings = storedBookings ? JSON.parse(storedBookings) : [];
          }
        } else {
          this.rooms = [...DEFAULT_ROOMS];
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
      
      const hasOldRooms = parsed.rooms?.some((r: any) => 
        r.id === 'room-mango-suite' || 
        r.id === 'room-terracotta-cottage' || 
        r.id === 'room-courtyard'
      );

      if (hasOldRooms) {
        this.applyState({
          rooms: [...DEFAULT_ROOMS],
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
