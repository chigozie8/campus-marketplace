-- ============================================================
-- VendoorX Blog — Migration 014
-- Creates the increment_blog_views() RPC function used by
-- /api/blog/views to track post view counts.
--
-- Run this in Supabase SQL Editor AFTER 010_blog.sql.
-- ============================================================

-- increment_blog_views: safely increments views for a given post.
-- SECURITY DEFINER so it runs as the function owner (bypassing RLS),
-- allowing anonymous visitors to trigger view counts without needing
-- direct UPDATE permission on blog_posts.
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.blog_posts
  SET views = views + 1
  WHERE id = post_id;
$$;

-- Grant execute to anon and authenticated roles so the API route
-- (which uses the service-role key) can call this function.
GRANT EXECUTE ON FUNCTION public.increment_blog_views(uuid) TO anon, authenticated;
