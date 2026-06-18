import { Room, Booking, BlockedDate, Enquiry, Settings } from './types';

// Default mock database state
export const DEFAULT_ROOMS: Room[] = [
  {
    id: 'room-mango-suite',
    name: 'Mango Orchard Suite',
    description: 'A spacious heritage suite overlooking the lush mango orchards. Features high ceilings, handcrafted teakwood furniture, a luxurious king bed, and a private verandah to enjoy your morning tea.',
    max_guests: 3,
    base_price: 5500,
    amenities: ['Air Conditioning', 'High-Speed Wi-Fi', 'King Bed', 'Verandah', 'Geyser', 'Tea/Coffee Maker', 'Mini Fridge'],
    photos: ['/images/room_mango_suite.jpg'],
    status: 'active',
  },
  {
    id: 'room-courtyard',
    name: 'The Courtyard Room',
    description: 'A warm and vibrant room opening directly into the central heritage courtyard. Decorated with local artwork, it offers a plush queen-sized bed, ambient lighting, and access to the shared courtyard swing.',
    max_guests: 2,
    base_price: 3800,
    amenities: ['Air Conditioning', 'High-Speed Wi-Fi', 'Queen Bed', 'Courtyard View', 'Geyser', 'Work Desk'],
    photos: ['/images/room_courtyard.jpg'],
    status: 'active',
  },
  {
    id: 'room-terracotta-cottage',
    name: 'Terracotta Cottage',
    description: 'An independent rustic cottage built using local clay terracotta tiles and sustainable materials. Features a private glass balcony with panoramic valley views, a workspace, and an open-sky shower experience.',
    max_guests: 2,
    base_price: 4500,
    amenities: ['Air Conditioning', 'High-Speed Wi-Fi', 'King Bed', 'Private Balcony', 'Outdoor Shower', 'Work Desk'],
    photos: ['/images/room_terracotta_cottage.jpg'],
    status: 'active',
  }
];

export const DEFAULT_SETTINGS: Settings = {
  booking_mode: 'manual_approval',
  payment_options: ['at_property'],
  contact_details: {
    phone: '+91 98765 43210',
    email: 'stay@agrawalhouse.com',
    address: 'Agrawal House, Heritage Lane, Near Lal Bagh Palace, Indore, Madhya Pradesh - 452002',
  }
};

// In-Memory state for Server Side rendering mock database
class MockDB {
  private rooms: Room[] = [...DEFAULT_ROOMS];
  private blockedDates: BlockedDate[] = [];
  private bookings: Booking[] = [];
  private enquiries: Enquiry[] = [];
  private settings: Settings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.loadFromLocalStorage();
  }

  private isBrowser() {
    return typeof window !== 'undefined';
  }

  private loadFromLocalStorage() {
    if (!this.isBrowser()) return;
    try {
      const storedRooms = localStorage.getItem('ah_rooms');
      if (storedRooms) this.rooms = JSON.parse(storedRooms);
      
      const storedBlocked = localStorage.getItem('ah_blocked_dates');
      if (storedBlocked) this.blockedDates = JSON.parse(storedBlocked);

      const storedBookings = localStorage.getItem('ah_bookings');
      if (storedBookings) this.bookings = JSON.parse(storedBookings);

      const storedEnquiries = localStorage.getItem('ah_enquiries');
      if (storedEnquiries) this.enquiries = JSON.parse(storedEnquiries);

      const storedSettings = localStorage.getItem('ah_settings');
      if (storedSettings) this.settings = JSON.parse(storedSettings);
    } catch (e) {
      console.error('Error loading mock db from localStorage', e);
    }
  }

  private saveToLocalStorage() {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem('ah_rooms', JSON.stringify(this.rooms));
      localStorage.setItem('ah_blocked_dates', JSON.stringify(this.blockedDates));
      localStorage.setItem('ah_bookings', JSON.stringify(this.bookings));
      localStorage.setItem('ah_enquiries', JSON.stringify(this.enquiries));
      localStorage.setItem('ah_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.error('Error saving mock db to localStorage', e);
    }
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    this.loadFromLocalStorage();
    return this.rooms;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    this.loadFromLocalStorage();
    return this.rooms.find(r => r.id === id);
  }

  async saveRoom(room: Room): Promise<Room> {
    this.loadFromLocalStorage();
    const index = this.rooms.findIndex(r => r.id === room.id);
    if (index >= 0) {
      this.rooms[index] = room;
    } else {
      this.rooms.push(room);
    }
    this.saveToLocalStorage();
    return room;
  }

  // Blocked Dates
  async getBlockedDates(): Promise<BlockedDate[]> {
    this.loadFromLocalStorage();
    return this.blockedDates;
  }

  async addBlockedDate(blocked: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    this.loadFromLocalStorage();
    const newBlocked: BlockedDate = {
      ...blocked,
      id: `block-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    this.blockedDates.push(newBlocked);
    this.saveToLocalStorage();
    return newBlocked;
  }

  async deleteBlockedDate(id: string): Promise<void> {
    this.loadFromLocalStorage();
    this.blockedDates = this.blockedDates.filter(b => b.id !== id);
    this.saveToLocalStorage();
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    this.loadFromLocalStorage();
    // Attach room name helper
    return this.bookings.map(b => ({
      ...b,
      room_name: this.rooms.find(r => r.id === b.room_id)?.name || 'Unknown Room'
    }));
  }

  async createBooking(booking: Omit<Booking, 'id' | 'status' | 'payment_status' | 'created_at'>): Promise<Booking> {
    this.loadFromLocalStorage();
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Math.random().toString(36).substr(2, 9)}`,
      status: this.settings.booking_mode === 'instant' ? 'confirmed' : 'pending',
      payment_status: booking.payment_method === 'online' ? 'paid' : 'unpaid',
      created_at: new Date().toISOString()
    };
    this.bookings.push(newBooking);
    this.saveToLocalStorage();
    return newBooking;
  }

  async updateBookingStatus(id: string, status: Booking['status'], payment_status?: Booking['payment_status']): Promise<Booking | undefined> {
    this.loadFromLocalStorage();
    const index = this.bookings.findIndex(b => b.id === id);
    if (index >= 0) {
      this.bookings[index].status = status;
      if (payment_status) {
        this.bookings[index].payment_status = payment_status;
      }
      this.saveToLocalStorage();
      return this.bookings[index];
    }
    return undefined;
  }

  // Enquiries
  async getEnquiries(): Promise<Enquiry[]> {
    this.loadFromLocalStorage();
    return this.enquiries;
  }

  async createEnquiry(enquiry: Omit<Enquiry, 'id' | 'status' | 'created_at'>): Promise<Enquiry> {
    this.loadFromLocalStorage();
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `enq-${Math.random().toString(36).substr(2, 9)}`,
      status: 'new',
      created_at: new Date().toISOString()
    };
    this.enquiries.push(newEnquiry);
    this.saveToLocalStorage();
    return newEnquiry;
  }

  async updateEnquiryStatus(id: string, status: Enquiry['status']): Promise<Enquiry | undefined> {
    this.loadFromLocalStorage();
    const index = this.enquiries.findIndex(e => e.id === id);
    if (index >= 0) {
      this.enquiries[index].status = status;
      this.saveToLocalStorage();
      return this.enquiries[index];
    }
    return undefined;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    this.loadFromLocalStorage();
    return this.settings;
  }

  async saveSettings(settings: Settings): Promise<Settings> {
    this.loadFromLocalStorage();
    this.settings = settings;
    this.saveToLocalStorage();
    return this.settings;
  }
}

export const mockDB = new MockDB();
