import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Room,
  Booking,
  BlockedDate,
  Enquiry,
  Settings,
  PricingRule,
  Service,
  IcalSyncConfig,
} from "./types";
import { mockDB, DEFAULT_ROOMS } from "./mockData";
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

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== "your-supabase-url" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your-supabase-anon-key",
);

// Singleton instance to prevent "Multiple GoTrueClient instances" warnings in browser context during Fast Refresh / HMR
const globalForSupabase = globalThis as unknown as {
  supabaseClient?: SupabaseClient;
};

const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured) return null;
  if (typeof window !== "undefined") {
    if (!globalForSupabase.supabaseClient) {
      globalForSupabase.supabaseClient = createClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        },
      );
    }
    return globalForSupabase.supabaseClient;
  }
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: { persistSession: false },
  });
};

const isMissingServicesTableError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "PGRST205" ||
    maybeError.message?.includes("public.services") ||
    maybeError.message?.includes("Could not find the table 'public.services'")
  );
};

const isMissingIcalTableError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "PGRST205" ||
    maybeError.code === "PGRST204" ||
    maybeError.code === "42P01" ||
    maybeError.code === "42703" ||
    maybeError.code === "42501" ||
    maybeError.message?.includes("ical_sync_configs") ||
    maybeError.message?.includes("ical_config_id") ||
    maybeError.message?.includes("ical_uid") ||
    maybeError.message?.includes("source") ||
    maybeError.message?.includes("Could not find the table 'public.ical_sync_configs'") ||
    maybeError.message?.includes("relation \"ical_sync_configs\" does not exist")
  );
};

export const supabase: SupabaseClient | null = getSupabaseClient();

if (!isSupabaseConfigured) {
  console.log(
    "Database client: Supabase credentials not found or set to placeholder. Falling back to Local Mock Database.",
  );
}

export const db = {
  isMock: !isSupabaseConfigured,

  // --- ROOMS ---
  async getRooms(): Promise<Room[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .order("name", { ascending: true });
        if (error) {
          throw error;
        }
        return (data as Room[]) || [];
      } catch (err) {
        console.warn("Supabase getRooms failed, using mockDB:", err);
        return mockDB.getRooms();
      }
    }
    return mockDB.getRooms();
  },

  async getRoom(id: string): Promise<Room | undefined> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) {
          if (error.code === "22P02") {
            return undefined;
          }
          throw error;
        }
        return data ? (data as Room) : undefined;
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err &&
          "code" in err &&
          (err as { code: string }).code === "22P02"
        ) {
          return undefined;
        }
        throw err;
      }
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

  // --- SERVICES ---
  async getServices(): Promise<Service[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });
        if (error) {
          throw error;
        }
        return data as Service[];
      } catch (error) {
        if (isMissingServicesTableError(error)) {
          console.warn(
            "Supabase services table is missing. Falling back to local mock services.",
          );
          return mockDB.getServices();
        }
        throw error;
      }
    }
    return mockDB.getServices();
  },

  async getService(slug: string): Promise<Service | undefined> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (error) {
          throw error;
        }
        return data ? (data as Service) : undefined;
      } catch (error) {
        if (isMissingServicesTableError(error)) {
          return mockDB.getService(slug);
        }
        throw error;
      }
    }
    return mockDB.getService(slug);
  },

  async saveService(service: Service): Promise<Service> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("services")
          .upsert(service)
          .select()
          .single();
        if (error) {
          throw error;
        }
        return data as Service;
      } catch (error) {
        if (isMissingServicesTableError(error)) {
          console.warn(
            "Supabase services table is missing. Saving service to local mock database instead.",
          );
          return mockDB.saveService(service);
        }
        throw error;
      }
    }
    return mockDB.saveService(service);
  },

  async deleteService(id: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from("services").delete().eq("id", id);
        if (error) {
          throw error;
        }
        return;
      } catch (error) {
        if (isMissingServicesTableError(error)) {
          console.warn(
            "Supabase services table is missing. Deleting service from local mock database instead.",
          );
          return mockDB.deleteService(id);
        }
        throw error;
      }
    }
    return mockDB.deleteService(id);
  },

  async uploadRoomPhoto(file: File): Promise<string> {
    if (supabase) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from("room-photos")
          .upload(filePath, file, { upsert: true });

        if (error) {
          console.error("Supabase Storage Upload Error:", error.message, error);
        } else if (data) {
          const { data: publicUrlData } = supabase.storage
            .from("room-photos")
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            console.log(
              "Photo successfully uploaded to Supabase Storage:",
              publicUrlData.publicUrl,
            );
            return publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.error("Supabase storage upload error:", err);
      }
    }

    // Fallback: convert file to Base64 Data URL if Supabase storage is unconfigured or errors out
    console.warn("Falling back to Base64 Data URL for room photo upload.");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // --- BLOCKED DATES ---
  async getBlockedDates(roomId?: string): Promise<BlockedDate[]> {
    let supabaseDates: BlockedDate[] = [];
    if (supabase) {
      try {
        let query = supabase.from("blocked_dates").select("*");
        if (roomId) {
          query = query.eq("room_id", roomId);
        }
        const { data, error } = await query;
        if (!error && data) {
          supabaseDates = data as BlockedDate[];
        }
      } catch {
        // Fall through to mockDB
      }
    }
    const mockDates = await mockDB.getBlockedDates(roomId);
    const map = new Map<string, BlockedDate>();
    supabaseDates.forEach((d) => map.set(d.id, d));
    mockDates.forEach((d) => map.set(d.id, d));
    return Array.from(map.values()).sort((a, b) =>
      a.start_date.localeCompare(b.start_date),
    );
  },

  async addBlockedDate(blocked: Omit<BlockedDate, "id">): Promise<BlockedDate> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("blocked_dates")
          .insert(blocked)
          .select()
          .single();
        if (error) {
          throw error;
        }
        return data as BlockedDate;
      } catch (error) {
        console.warn("Supabase addBlockedDate fallback to local mock:", error);
        return mockDB.addBlockedDate(blocked);
      }
    }
    return mockDB.addBlockedDate(blocked);
  },

  async deleteBlockedDate(id: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("blocked_dates")
          .delete()
          .eq("id", id);
        if (error) {
          throw error;
        }
        await mockDB.deleteBlockedDate(id);
        return;
      } catch (error) {
        console.warn("Supabase deleteBlockedDate fallback to local mock:", error);
        return mockDB.deleteBlockedDate(id);
      }
    }
    return mockDB.deleteBlockedDate(id);
  },

  // --- BOOKINGS ---
  async getBookings(): Promise<Booking[]> {
    let supabaseBookings: Booking[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*, rooms(name)")
          .order("created_at", { ascending: false });
        if (!error && data) {
          supabaseBookings = (data as BookingWithRoomName[]).map((b) => ({
            ...b,
            room_name: b.rooms?.name || "Unknown Room",
          })) as Booking[];
        }
      } catch {
        // Fall through to mockDB
      }
    }
    const mockBookings = await mockDB.getBookings();
    const map = new Map<string, Booking>();
    supabaseBookings.forEach((b) => map.set(b.id, b));
    mockBookings.forEach((b) => map.set(b.id, b));
    return Array.from(map.values()).sort((a, b) =>
      (b.created_at || "").localeCompare(a.created_at || ""),
    );
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

  // --- PRICING RULES ---
  async getPricingRules(roomId?: string): Promise<PricingRule[]> {
    if (supabase) {
      let query = supabase.from("pricing_rules").select("*");
      if (roomId) {
        query = query.eq("room_id", roomId);
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as PricingRule[];
    }
    const rules = await mockDB.getPricingRules();
    return roomId ? rules.filter((r) => r.room_id === roomId) : rules;
  },

  async getPricingRuleForDate(
    roomId: string,
    date: string,
  ): Promise<PricingRule | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("*")
        .eq("room_id", roomId)
        .eq("is_active", true)
        .lte("start_date", date)
        .gte("end_date", date)
        .order("priority", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        throw error;
      }
      return data ? (data as PricingRule) : undefined;
    }
    return mockDB.getPricingRuleForDate(roomId, date);
  },

  async calculateTotalPrice(
    roomId: string,
    checkIn: string,
    checkOut: string,
    basePrice: number,
  ): Promise<{
    total: number;
    breakdown: { date: string; price: number; rule?: PricingRule }[];
  }> {
    const rules = await this.getPricingRules(roomId);
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const breakdown: { date: string; price: number; rule?: PricingRule }[] = [];
    let total = 0;

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const applicableRule = rules
        .filter(
          (r) =>
            r.is_active && r.start_date <= dateStr && r.end_date >= dateStr,
        )
        .sort((a, b) => b.priority - a.priority)[0];

      const price = applicableRule
        ? Math.round(basePrice * applicableRule.price_modifier)
        : basePrice;

      breakdown.push({
        date: dateStr,
        price,
        rule: applicableRule,
      });
      total += price;
    }

    return { total, breakdown };
  },

  async addPricingRule(rule: Omit<PricingRule, "id">): Promise<PricingRule> {
    if (supabase) {
      const { data, error } = await supabase
        .from("pricing_rules")
        .insert(rule)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data as PricingRule;
    }
    return mockDB.addPricingRule(rule);
  },

  async updatePricingRule(
    id: string,
    updates: Partial<Omit<PricingRule, "id">>,
  ): Promise<PricingRule> {
    if (supabase) {
      const { data, error } = await supabase
        .from("pricing_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data as PricingRule;
    }
    const updated = await mockDB.updatePricingRule(id, updates);
    if (!updated) {
      throw new Error("Pricing rule not found");
    }
    return updated;
  },

  async deletePricingRule(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from("pricing_rules")
        .delete()
        .eq("id", id);
      if (error) {
        throw error;
      }
      return;
    }
    return mockDB.deletePricingRule(id);
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

  // --- ICAL SYNC CONFIGS ---
  async getIcalSyncConfigs(roomId?: string): Promise<IcalSyncConfig[]> {
    if (supabase) {
      try {
        let query = supabase.from("ical_sync_configs").select("*");
        if (roomId) {
          query = query.eq("room_id", roomId);
        }
        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          return data as IcalSyncConfig[];
        }

        // If Supabase table exists but is empty, migrate any existing configs from local storage
        const localConfigs = await mockDB.getIcalSyncConfigs(roomId);
        if (localConfigs.length > 0) {
          for (const lc of localConfigs) {
            try {
              await supabase.from("ical_sync_configs").insert({
                room_id: lc.room_id,
                platform: lc.platform,
                ical_url: lc.ical_url,
                label: lc.label,
                is_active: lc.is_active,
                last_synced_at: lc.last_synced_at,
                last_error: lc.last_error,
              });
            } catch {
              // Ignore insert error
            }
          }
          const { data: refreshed } = await query.order("created_at", { ascending: false });
          if (refreshed && refreshed.length > 0) {
            return refreshed as IcalSyncConfig[];
          }
        }

        return (data as IcalSyncConfig[]) || [];
      } catch (error) {
        if (isMissingIcalTableError(error)) {
          console.warn(
            "Supabase ical_sync_configs table is missing. Falling back to local mock storage.",
          );
          return mockDB.getIcalSyncConfigs(roomId);
        }
        throw error;
      }
    }
    return mockDB.getIcalSyncConfigs(roomId);
  },

  async addIcalSyncConfig(
    config: Omit<IcalSyncConfig, "id">,
  ): Promise<IcalSyncConfig> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("ical_sync_configs")
          .insert(config)
          .select()
          .single();
        if (error) {
          throw error;
        }
        return data as IcalSyncConfig;
      } catch (error) {
        if (isMissingIcalTableError(error)) {
          return mockDB.addIcalSyncConfig(config);
        }
        throw error;
      }
    }
    return mockDB.addIcalSyncConfig(config);
  },

  async updateIcalSyncConfig(
    id: string,
    updates: Partial<Omit<IcalSyncConfig, "id">>,
  ): Promise<IcalSyncConfig | undefined> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("ical_sync_configs")
          .update(updates)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) {
          throw error;
        }
        return data ? (data as IcalSyncConfig) : undefined;
      } catch (error) {
        if (isMissingIcalTableError(error)) {
          return mockDB.updateIcalSyncConfig(id, updates);
        }
        throw error;
      }
    }
    return mockDB.updateIcalSyncConfig(id, updates);
  },

  async deleteIcalSyncConfig(id: string): Promise<void> {
    if (supabase) {
      try {
        // First delete all blocked dates created by this config
        await supabase
          .from("blocked_dates")
          .delete()
          .eq("ical_config_id", id);
        // Then delete the config itself
        const { error } = await supabase
          .from("ical_sync_configs")
          .delete()
          .eq("id", id);
        if (error) {
          throw error;
        }
        return;
      } catch (error) {
        if (isMissingIcalTableError(error)) {
          return mockDB.deleteIcalSyncConfig(id);
        }
        throw error;
      }
    }
    return mockDB.deleteIcalSyncConfig(id);
  },

  async getBlockedDatesByIcalConfig(
    configId: string,
  ): Promise<BlockedDate[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("blocked_dates")
          .select("*")
          .eq("ical_config_id", configId);
        if (error) {
          throw error;
        }
        return data as BlockedDate[];
      } catch (error) {
        if (isMissingIcalTableError(error)) {
          return mockDB.getBlockedDatesByIcalConfig(configId);
        }
        throw error;
      }
    }
    return mockDB.getBlockedDatesByIcalConfig(configId);
  },

  async deleteBlockedDatesByIcalConfig(configId: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("blocked_dates")
          .delete()
          .eq("ical_config_id", configId);
        if (error) {
          throw error;
        }
        return;
      } catch (error) {
        if (isMissingIcalTableError(error)) {
          return mockDB.deleteBlockedDatesByIcalConfig(configId);
        }
        throw error;
      }
    }
    return mockDB.deleteBlockedDatesByIcalConfig(configId);
  },
};
