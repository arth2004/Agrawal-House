import { Room, Booking, BlockedDate, Enquiry, Settings } from "./types";
import { findBookingConflict } from "./availability";

// Default mock database state
export const DEFAULT_ROOMS: Room[] = [
  {
    id: "room-mango-suite",
    name: "Mango Orchard Suite",
    description:
      "A spacious heritage suite overlooking the lush mango orchards. Features high ceilings, handcrafted teakwood furniture, a luxurious king bed, and a private verandah to enjoy your morning tea.",
    max_guests: 3,
    base_price: 5500,
    amenities: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "King Bed",
      "Verandah",
      "Geyser",
      "Tea/Coffee Maker",
      "Mini Fridge",
    ],
    photos: ["/images/room_mango_suite.jpg"],
    status: "active",
  },
  {
    id: "room-courtyard",
    name: "The Courtyard Room",
    description:
      "A warm and vibrant room opening directly into the central heritage courtyard. Decorated with local artwork, it offers a plush queen-sized bed, ambient lighting, and access to the shared courtyard swing.",
    max_guests: 2,
    base_price: 3800,
    amenities: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Queen Bed",
      "Courtyard View",
      "Geyser",
      "Work Desk",
    ],
    photos: ["/images/room_courtyard.jpg"],
    status: "active",
  },
  {
    id: "room-terracotta-cottage",
    name: "Terracotta Cottage",
    description:
      "An independent rustic cottage built using local clay terracotta tiles and sustainable materials. Features a private glass balcony with panoramic valley views, a workspace, and an open-sky shower experience.",
    max_guests: 2,
    base_price: 4500,
    amenities: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "King Bed",
      "Private Balcony",
      "Outdoor Shower",
      "Work Desk",
    ],
    photos: ["/images/room_terracotta_cottage.jpg"],
    status: "active",
  },
];

export const DEFAULT_SETTINGS: Settings = {
  booking_mode: "manual_approval",
  payment_options: ["at_property"],
  contact_details: {
    phone: "+91 98765 43210",
    email: "stay@agrawalhouse.com",
    address:
      "Agrawal House, Heritage Lane, Near Lal Bagh Palace, Indore, Madhya Pradesh - 452002",
  },
};

type MockDbState = {
  rooms: Room[];
  blockedDates: BlockedDate[];
  bookings: Booking[];
  enquiries: Enquiry[];
  settings: Settings;
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
});

// In-Memory state for Server Side rendering mock database
class MockDB {
  private rooms: Room[] = [...DEFAULT_ROOMS];
  private blockedDates: BlockedDate[] = [];
  private bookings: Booking[] = [];
  private enquiries: Enquiry[] = [];
  private settings: Settings = { ...DEFAULT_SETTINGS };

  constructor() {
    const defaults = createDefaultState();
    this.rooms = defaults.rooms;
    this.blockedDates = defaults.blockedDates;
    this.bookings = defaults.bookings;
    this.enquiries = defaults.enquiries;
    this.settings = defaults.settings;
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
    };
  }

  private applyState(state: MockDbState) {
    this.rooms = state.rooms;
    this.blockedDates = state.blockedDates;
    this.bookings = state.bookings;
    this.enquiries = state.enquiries;
    this.settings = state.settings;
  }

  private async loadState() {
    if (this.isBrowser()) {
      try {
        const storedRooms = localStorage.getItem(STORAGE_KEYS.rooms);
        const storedBlocked = localStorage.getItem(STORAGE_KEYS.blockedDates);
        const storedBookings = localStorage.getItem(STORAGE_KEYS.bookings);
        const storedEnquiries = localStorage.getItem(STORAGE_KEYS.enquiries);
        const storedSettings = localStorage.getItem(STORAGE_KEYS.settings);

        this.rooms = storedRooms ? JSON.parse(storedRooms) : [...DEFAULT_ROOMS];
        this.blockedDates = storedBlocked ? JSON.parse(storedBlocked) : [];
        this.bookings = storedBookings ? JSON.parse(storedBookings) : [];
        this.enquiries = storedEnquiries ? JSON.parse(storedEnquiries) : [];
        this.settings = storedSettings
          ? JSON.parse(storedSettings)
          : { ...DEFAULT_SETTINGS };
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
      this.applyState({
        rooms: parsed.rooms ?? [...DEFAULT_ROOMS],
        blockedDates: parsed.blockedDates ?? [],
        bookings: parsed.bookings ?? [],
        enquiries: parsed.enquiries ?? [],
        settings: parsed.settings ?? { ...DEFAULT_SETTINGS },
      });
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
