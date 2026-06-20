export interface Room {
  id: string;
  name: string;
  description: string;
  max_guests: number;
  base_price: number;
  amenities: string[];
  photos: string[];
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface BlockedDate {
  id: string;
  room_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason?: string;
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_method: 'online' | 'at_property';
  payment_status: 'unpaid' | 'partial' | 'paid';
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
  status: 'new' | 'responded';
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
  booking_mode: 'instant' | 'manual_approval';
  payment_options: ('online' | 'at_property')[];
  contact_details: {
    phone: string;
    email: string;
    address: string;
  };
}
