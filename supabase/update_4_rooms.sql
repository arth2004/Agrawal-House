-- SQL Script: Configure 4 Distinct Bedrooms for Agrawal House
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Rename existing Double Room to 'Double bedroom 1'
update public.rooms
set name = 'Double bedroom 1'
where id = '30eab39c-e0fd-4855-957e-046d72326cb1' or name ILIKE 'Double room%';

-- 2. Rename existing Family Room to 'Family bedroom 1'
update public.rooms
set name = 'Family bedroom 1'
where id = 'c48138d2-b759-4440-972e-8b5d2b7b173a' or name ILIKE 'Family room%';

-- 3. Insert 'Double bedroom 2' (Duplicate of Double bedroom 1)
insert into public.rooms (
  id,
  name,
  description,
  max_guests,
  base_price,
  amenities,
  photos,
  status
) values (
  '30eab39c-e0fd-4855-957e-046d72326cb2',
  'Double bedroom 2',
  'A warm, elegantly decorated room ideal for couples or solo travelers. Features plush bedding, air conditioning, and an attached modern bathroom.',
  2,
  2500,
  array['High-Speed Wi-Fi', 'Air Conditioning', 'Queen Bed', 'Geyser', 'Private Bath'],
  array['/images/bed-2a.jpg', 'https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131535282-x9j2r0t.jpg'],
  'active'
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  max_guests = excluded.max_guests,
  base_price = excluded.base_price,
  amenities = excluded.amenities,
  photos = excluded.photos,
  status = excluded.status;

-- 4. Insert 'Family bedroom 2' (Duplicate of Family bedroom 1)
insert into public.rooms (
  id,
  name,
  description,
  max_guests,
  base_price,
  amenities,
  photos,
  status
) values (
  'c48138d2-b759-4440-972e-8b5d2b7b173b',
  'Family bedroom 2',
  'A spacious modern room designed for family comfort with additional space for up to 4 guests. Features comfortable bedding and modern private washroom.',
  4,
  3000,
  array['Air Conditioning', 'High-Speed Wi-Fi', 'King Bed', 'Geyser', 'Tea/Coffee Maker', 'Spacious Bath'],
  array[
    'https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131873013-44uanus.jpg',
    'https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131872488-rcc6twn.jpg',
    '/images/bed-3a.jpg',
    'https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131860035-jjb9nnt.jpg',
    'https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131872784-7iys3vq.jpg'
  ],
  'active'
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  max_guests = excluded.max_guests,
  base_price = excluded.base_price,
  amenities = excluded.amenities,
  photos = excluded.photos,
  status = excluded.status;
