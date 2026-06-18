import { createClient } from '@supabase/supabase-js';
import { Room, Booking, BlockedDate, Enquiry, Settings } from './types';
import { mockDB } from './mockData';

// Detect if Supabase is fully configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'your-supabase-url' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-supabase-anon-key';

// Initialize Supabase if configured, otherwise null
const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (!isSupabaseConfigured) {
  console.log('Database client: Supabase credentials not found or set to placeholder. Falling back to Local Mock Database.');
} else {
  console.log('Database client: Supabase successfully initialized.');
}

export const db = {
  isMock: !isSupabaseConfigured,

  // --- ROOMS ---
  async getRooms(): Promise<Room[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching rooms from Supabase, falling back to mock:', error);
        return mockDB.getRooms();
      }
      return data as Room[];
    }
    return mockDB.getRooms();
  },

  async getRoom(id: string): Promise<Room | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error(`Error fetching room ${id} from Supabase, falling back to mock:`, error);
        return mockDB.getRoom(id);
      }
      return data ? (data as Room) : undefined;
    }
    return mockDB.getRoom(id);
  },

  async saveRoom(room: Room): Promise<Room> {
    if (supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .upsert(room)
        .select()
        .single();
      if (error) {
        console.error('Error saving room to Supabase, falling back to mock:', error);
        return mockDB.saveRoom(room);
      }
      return data as Room;
    }
    return mockDB.saveRoom(room);
  },

  // --- BLOCKED DATES ---
  async getBlockedDates(roomId?: string): Promise<BlockedDate[]> {
    if (supabase) {
      let query = supabase.from('blocked_dates').select('*');
      if (roomId) {
        query = query.eq('room_id', roomId);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error getting blocked dates from Supabase, falling back to mock:', error);
        return mockDB.getBlockedDates();
      }
      return data as BlockedDate[];
    }
    const dates = await mockDB.getBlockedDates();
    return roomId ? dates.filter(d => d.room_id === roomId) : dates;
  },

  async addBlockedDate(blocked: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    if (supabase) {
      const { data, error } = await supabase
        .from('blocked_dates')
        .insert(blocked)
        .select()
        .single();
      if (error) {
        console.error('Error blocking date in Supabase, falling back to mock:', error);
        return mockDB.addBlockedDate(blocked);
      }
      return data as BlockedDate;
    }
    return mockDB.addBlockedDate(blocked);
  },

  async deleteBlockedDate(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting blocked date from Supabase, falling back to mock:', error);
        return mockDB.deleteBlockedDate(id);
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
        .from('bookings')
        .select('*, rooms(name)')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching bookings from Supabase, falling back to mock:', error);
        return mockDB.getBookings();
      }
      return data.map((b: any) => ({
        ...b,
        room_name: b.rooms?.name || 'Unknown Room'
      })) as Booking[];
    }
    return mockDB.getBookings();
  },

  async createBooking(booking: Omit<Booking, 'id' | 'status' | 'payment_status' | 'created_at'>): Promise<Booking> {
    if (supabase) {
      // Get settings to decide status
      const settings = await this.getSettings();
      const status = settings.booking_mode === 'instant' ? 'confirmed' : 'pending';
      const payment_status = booking.payment_method === 'online' ? 'paid' : 'unpaid';

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          status,
          payment_status,
        })
        .select()
        .single();
      if (error) {
        console.error('Error creating booking in Supabase, falling back to mock:', error);
        return mockDB.createBooking(booking);
      }
      return data as Booking;
    }
    return mockDB.createBooking(booking);
  },

  async updateBookingStatus(id: string, status: Booking['status'], payment_status?: Booking['payment_status']): Promise<Booking | undefined> {
    if (supabase) {
      const updates: Partial<Booking> = { status };
      if (payment_status) updates.payment_status = payment_status;

      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('Error updating booking in Supabase, falling back to mock:', error);
        return mockDB.updateBookingStatus(id, status, payment_status);
      }
      return data ? (data as Booking) : undefined;
    }
    return mockDB.updateBookingStatus(id, status, payment_status);
  },

  // --- ENQUIRIES ---
  async getEnquiries(): Promise<Enquiry[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error getting enquiries from Supabase, falling back to mock:', error);
        return mockDB.getEnquiries();
      }
      return data as Enquiry[];
    }
    return mockDB.getEnquiries();
  },

  async createEnquiry(enquiry: Omit<Enquiry, 'id' | 'status' | 'created_at'>): Promise<Enquiry> {
    if (supabase) {
      const { data, error } = await supabase
        .from('enquiries')
        .insert(enquiry)
        .select()
        .single();
      if (error) {
        console.error('Error creating enquiry in Supabase, falling back to mock:', error);
        return mockDB.createEnquiry(enquiry);
      }
      return data as Enquiry;
    }
    return mockDB.createEnquiry(enquiry);
  },

  async updateEnquiryStatus(id: string, status: Enquiry['status']): Promise<Enquiry | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from('enquiries')
        .update({ status })
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('Error updating enquiry in Supabase, falling back to mock:', error);
        return mockDB.updateEnquiryStatus(id, status);
      }
      return data ? (data as Enquiry) : undefined;
    }
    return mockDB.updateEnquiryStatus(id, status);
  },

  // --- SETTINGS ---
  async getSettings(): Promise<Settings> {
    if (supabase) {
      const { data, error } = await supabase
        .from('settings')
        .select('*');
      if (error) {
        console.error('Error getting settings from Supabase, falling back to mock:', error);
        return mockDB.getSettings();
      }
      // Reconstruct Settings object from keys
      const settingsObj: Partial<Settings> = {};
      data.forEach((row: any) => {
        if (row.key === 'booking_mode') settingsObj.booking_mode = row.value;
        if (row.key === 'payment_options') settingsObj.payment_options = row.value;
        if (row.key === 'contact_details') settingsObj.contact_details = row.value;
      });
      return {
        booking_mode: settingsObj.booking_mode || 'manual_approval',
        payment_options: settingsObj.payment_options || ['at_property'],
        contact_details: settingsObj.contact_details || mockDB.getSettings().then(s => s.contact_details),
      } as Settings;
    }
    return mockDB.getSettings();
  },

  async saveSettings(settings: Settings): Promise<Settings> {
    if (supabase) {
      // Upsert keys in Supabase settings table
      const rows = [
        { key: 'booking_mode', value: settings.booking_mode, updated_at: new Date().toISOString() },
        { key: 'payment_options', value: settings.payment_options, updated_at: new Date().toISOString() },
        { key: 'contact_details', value: settings.contact_details, updated_at: new Date().toISOString() },
      ];
      const { error } = await supabase
        .from('settings')
        .upsert(rows);
      if (error) {
        console.error('Error saving settings to Supabase, falling back to mock:', error);
        return mockDB.saveSettings(settings);
      }
      return settings;
    }
    return mockDB.saveSettings(settings);
  }
};
