-- Migration: Add iCal calendar sync support
-- Enables two-way calendar sync with MakeMyTrip, Airbnb, and other OTAs

-- 1. Create ical_sync_configs table
create table if not exists public.ical_sync_configs (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  platform text not null default 'other', -- 'makemytrip', 'airbnb', 'booking.com', 'other'
  ical_url text not null,
  label text not null,
  is_active boolean not null default true,
  last_synced_at timestamp with time zone,
  last_error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.ical_sync_configs enable row level security;

-- Policies for ical_sync_configs: allow reading and writing
drop policy if exists "Allow admins full control of ical_sync_configs" on public.ical_sync_configs;
drop policy if exists "Allow public read of ical_sync_configs" on public.ical_sync_configs;
drop policy if exists "Allow full access to ical_sync_configs" on public.ical_sync_configs;

create policy "Allow full access to ical_sync_configs" on public.ical_sync_configs
  for all using (true) with check (true);

-- 2. Add source tracking columns to blocked_dates
alter table public.blocked_dates
  add column if not exists source text not null default 'manual',
  add column if not exists ical_uid text,
  add column if not exists ical_config_id uuid references public.ical_sync_configs(id) on delete cascade;

-- Ensure blocked_dates allows inserts and deletes from the admin portal
drop policy if exists "Allow admins full control of blocked dates" on public.blocked_dates;
drop policy if exists "Allow full access to blocked_dates" on public.blocked_dates;

create policy "Allow full access to blocked_dates" on public.blocked_dates
  for all using (true) with check (true);

-- 3. Create index for fast sync lookups
create index if not exists idx_blocked_dates_ical_config_id on public.blocked_dates(ical_config_id);
create index if not exists idx_blocked_dates_ical_uid on public.blocked_dates(ical_uid);
