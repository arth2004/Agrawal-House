-- Migration: Allow full access to enquiries table
-- Enables Admin panel to delete, update, and manage enquiries

alter table public.enquiries enable row level security;

drop policy if exists "Allow public insert of enquiries" on public.enquiries;
drop policy if exists "Allow admins full control of enquiries" on public.enquiries;
drop policy if exists "Allow full access to enquiries" on public.enquiries;

create policy "Allow full access to enquiries" on public.enquiries
  for all using (true) with check (true);
