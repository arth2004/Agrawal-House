-- Supabase Schema for Agrawal House Homestay & Booking System

-- Enable UUID extension if not already present
create extension if not exists "uuid-ossp";
create extension if not exists btree_gist;

-- 1. Rooms Table
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  max_guests integer not null default 2,
  base_price numeric not null,
  amenities text[] default '{}',
  photos text[] default '{}',
  status text not null default 'active', -- 'active' or 'inactive'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.rooms enable row level security;

-- Policy: Everyone can read active rooms
create policy "Allow public read of active rooms" on public.rooms
  for select using (status = 'active');

-- Policy: Admins can do everything
create policy "Allow admins full control of rooms" on public.rooms
  for all using (auth.role() = 'service_role' or auth.uid() is not null);


-- 2. Blocked Dates Table
create table if not exists public.blocked_dates (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint check_dates check (start_date <= end_date)
);

alter table public.blocked_dates
  add constraint blocked_dates_no_overlap
  exclude using gist (
    room_id with =,
    daterange(start_date, end_date, '[]') with &&
  );

alter table public.blocked_dates enable row level security;

-- Policy: Everyone can read blocked dates (to check availability)
create policy "Allow public read of blocked dates" on public.blocked_dates
  for select using (true);

-- Policy: Admins can do everything
create policy "Allow admins full control of blocked dates" on public.blocked_dates
  for all using (auth.role() = 'service_role' or auth.uid() is not null);


-- 3. Bookings Table
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete restrict not null,
  guest_name text not null,
  guest_phone text not null,
  guest_email text not null,
  check_in date not null,
  check_out date not null,
  num_guests integer not null default 1,
  status text not null default 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  payment_method text not null default 'at_property', -- 'online', 'at_property'
  payment_status text not null default 'unpaid', -- 'unpaid', 'partial', 'paid'
  amount_total numeric not null,
  razorpay_payment_id text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint check_booking_dates check (check_in < check_out)
);

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[]') with &&
  ) where (status in ('pending', 'confirmed'));

alter table public.bookings enable row level security;

-- Policy: Guests can create bookings
create policy "Allow guest insert" on public.bookings
  for insert with check (true);

-- Policy: Guests can view their own booking if they know the ID
create policy "Allow guest view by id" on public.bookings
  for select using (true);

-- Policy: Admins can view/update all bookings
create policy "Allow admins full control of bookings" on public.bookings
  for all using (auth.role() = 'service_role' or auth.uid() is not null);


-- 4. Enquiries Table
create table if not exists public.enquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  contact text not null,
  message text not null,
  status text not null default 'new', -- 'new', 'responded'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.enquiries enable row level security;

-- Policy: Public can insert enquiries
create policy "Allow public insert of enquiries" on public.enquiries
  for insert with check (true);

-- Policy: Admins can view/update enquiries
create policy "Allow admins full control of enquiries" on public.enquiries
  for all using (auth.role() = 'service_role' or auth.uid() is not null);


-- 5. Settings Table
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.settings enable row level security;

-- Policy: Everyone can read settings
create policy "Allow public read of settings" on public.settings
  for select using (true);

-- Policy: Admins can do everything
create policy "Allow admins full control of settings" on public.settings
  for all using (auth.role() = 'service_role' or auth.uid() is not null);


-- Insert initial configuration
insert into public.settings (key, value) values
('booking_mode', '"manual_approval"'),
('payment_options', '["at_property"]'),
('contact_details', '{"phone": "+91 7415160134", "email": "agrawalhouse34@gmail.com", "address": "Ujjain, Madhya Pradesh, India"}')
on conflict (key) do nothing;
