-- Migration 006: Allow service role to insert notifications
-- Run in Supabase SQL Editor

-- Service role bypasses RLS automatically, but this explicit policy
-- allows admin API routes to insert notifications for any user.
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);
