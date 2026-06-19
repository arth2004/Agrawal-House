import { createClient } from "@supabase/supabase-js";
import { Room, Booking, BlockedDate, Enquiry, Settings } from "./types";
import { mockDB } from "./mockData";
import { findBookingConflict } from "./availability";

type BookingWithRoomName = Booking & {
  rooms?: { name?: string | null } | null;
};

type SettingRow = {
  key: string;
  value: unknown;
};

// Detect if Supabase is fully configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "your-supabase-url" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your-supabase-anon-key";

// Initialize Supabase if configured, otherwise null
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (!isSupabaseConfigured) {
  console.log(
    "Database client: Supabase credentials not found or set to placeholder. Falling back to Local Mock Database.",
  );
} else {
  console.log("Database client: Supabase successfully initialized.");
}

export const db = {
  isMock: !isSupabaseConfigured,

  // --- ROOMS ---
  async getRooms(): Promise<Room[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return data as Room[];
    }
    return mockDB.getRooms();
  },

  async getRoom(id: string): Promise<Room | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        throw error;
      }
      return data ? (data as Room) : undefined;
    }
    return mockDB.getRoom(id);
  },

  async saveRoom(room: Room): Promise<Room> {
    if (supabase) {
      const { data, error } = await supabase
        .from("rooms")
        .upsert(room)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data as Room;
    }
    return mockDB.saveRoom(room);
  },

  // --- BLOCKED DATES ---
  async getBlockedDates(roomId?: string): Promise<BlockedDate[]> {
    if (supabase) {
      let query = supabase.from("blocked_dates").select("*");
      if (roomId) {
        query = query.eq("room_id", roomId);
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as BlockedDate[];
    }
    const dates = await mockDB.getBlockedDates();
    return roomId ? dates.filter((d) => d.room_id === roomId) : dates;
  },

  async addBlockedDate(blocked: Omit<BlockedDate, "id">): Promise<BlockedDate> {
    if (supabase) {
      const { data, error } = await supabase
        .from("blocked_dates")
        .insert(blocked)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data as BlockedDate;
    }
    return mockDB.addBlockedDate(blocked);
  },

  async deleteBlockedDate(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("id", id);
      if (error) {
        throw error;
      }
      return;
    }
    return mockDB.deleteBlockedDate(id);
  },

  // --- BOOKINGS ---
  async getBookings(): Promise<Booking[]> {
    if (supabase) {
      // In Supabase, do a join or separate fetch for room names
      const { data, error } = await supabase
        .from("bookings")
        .select("*, rooms(name)")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return (data as BookingWithRoomName[]).map((b) => ({
        ...b,
        room_name: b.rooms?.name || "Unknown Room",
      })) as Booking[];
    }
    return mockDB.getBookings();
  },

  async createBooking(
    booking: Omit<Booking, "id" | "status" | "payment_status" | "created_at">,
  ): Promise<Booking> {
    const [bookings, blockedDates, settings] = await Promise.all([
      this.getBookings(),
      this.getBlockedDates(booking.room_id),
      this.getSettings(),
    ]);

    const conflictMessage = findBookingConflict(
      booking.check_in,
      booking.check_out,
      bookings.filter(
        (existingBooking) => existingBooking.room_id === booking.room_id,
      ),
      blockedDates,
    );

    if (conflictMessage) {
      throw new Error(conflictMessage);
    }

    if (supabase) {
      // Get settings to decide status
      const status =
        settings.booking_mode === "instant" ? "confirmed" : "pending";
      const payment_status =
        booking.payment_method === "online" ? "paid" : "unpaid";

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          ...booking,
          status,
          payment_status,
        })
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data as Booking;
    }
    return mockDB.createBooking(booking);
  },

  async updateBookingStatus(
    id: string,
    status: Booking["status"],
    payment_status?: Booking["payment_status"],
  ): Promise<Booking | undefined> {
    if (supabase) {
      const updates: Partial<Booking> = { status };
      if (payment_status) updates.payment_status = payment_status;

      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) {
        throw error;
      }
      return data ? (data as Booking) : undefined;
    }
    return mockDB.updateBookingStatus(id, status, payment_status);
  },

  // --- ENQUIRIES ---
  async getEnquiries(): Promise<Enquiry[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return data as Enquiry[];
    }
    return mockDB.getEnquiries();
  },

  async createEnquiry(
    enquiry: Omit<Enquiry, "id" | "status" | "created_at">,
  ): Promise<Enquiry> {
    if (supabase) {
      const { data, error } = await supabase
        .from("enquiries")
        .insert(enquiry)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data as Enquiry;
    }
    return mockDB.createEnquiry(enquiry);
  },

  async updateEnquiryStatus(
    id: string,
    status: Enquiry["status"],
  ): Promise<Enquiry | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from("enquiries")
        .update({ status })
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) {
        throw error;
      }
      return data ? (data as Enquiry) : undefined;
    }
    return mockDB.updateEnquiryStatus(id, status);
  },

  // --- SETTINGS ---
  async getSettings(): Promise<Settings> {
    if (supabase) {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) {
        throw error;
      }
      // Reconstruct Settings object from keys
      const settingsObj: Partial<Settings> = {};
      (data as SettingRow[]).forEach((row) => {
        if (row.key === "booking_mode") {
          settingsObj.booking_mode = row.value as Settings["booking_mode"];
        }
        if (row.key === "payment_options") {
          settingsObj.payment_options =
            row.value as Settings["payment_options"];
        }
        if (row.key === "contact_details") {
          settingsObj.contact_details =
            row.value as Settings["contact_details"];
        }
      });
      const fallbackSettings = await mockDB.getSettings();
      return {
        booking_mode: settingsObj.booking_mode || "manual_approval",
        payment_options: settingsObj.payment_options || ["at_property"],
        contact_details:
          settingsObj.contact_details || fallbackSettings.contact_details,
      } as Settings;
    }
    return mockDB.getSettings();
  },

  async saveSettings(settings: Settings): Promise<Settings> {
    if (supabase) {
      // Upsert keys in Supabase settings table
      const rows = [
        {
          key: "booking_mode",
          value: settings.booking_mode,
          updated_at: new Date().toISOString(),
        },
        {
          key: "payment_options",
          value: settings.payment_options,
          updated_at: new Date().toISOString(),
        },
        {
          key: "contact_details",
          value: settings.contact_details,
          updated_at: new Date().toISOString(),
        },
      ];
      const { error } = await supabase.from("settings").upsert(rows);
      if (error) {
        throw error;
      }
      return settings;
    }
    return mockDB.saveSettings(settings);
  },
};
