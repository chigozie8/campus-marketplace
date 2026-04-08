-- Migration: Add UNIQUE constraint on admin_roles.email
-- This prevents duplicate admin entries for the same email address
-- and allows upsert on conflict by email as well as user_id.

-- Add the unique constraint if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_roles_email_key'
      AND conrelid = 'public.admin_roles'::regclass
  ) THEN
    ALTER TABLE public.admin_roles
      ADD CONSTRAINT admin_roles_email_key UNIQUE (email);
  END IF;
END
$$;
