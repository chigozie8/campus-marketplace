-- ============================================================
-- VendoorX Blog — Migration 011
-- Adds explicit FK relationships from blog_posts/blog_comments
-- to profiles so PostgREST can resolve joins automatically.
--
-- NOTE: This migration requires that all existing author_id
-- values in blog_posts and user_id values in blog_comments
-- already exist in the profiles table.  Seeded posts with
-- author_id = NULL are safe to migrate immediately.
--
-- Run this in Supabase SQL Editor AFTER 010_blog.sql.
-- ============================================================

-- Drop old FK pointing to auth.users and add one pointing to profiles
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey,
  ADD CONSTRAINT blog_posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Drop old FK pointing to auth.users and add one pointing to profiles
ALTER TABLE blog_comments
  DROP CONSTRAINT IF EXISTS blog_comments_user_id_fkey,
  ADD CONSTRAINT blog_comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Drop old FK for blog_likes pointing to auth.users and add one pointing to profiles
ALTER TABLE blog_likes
  DROP CONSTRAINT IF EXISTS blog_likes_user_id_fkey,
  ADD CONSTRAINT blog_likes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
