-- ============================================================
-- VendoorX Blog — Migration 011
-- Adds explicit FK relationships from blog_posts, blog_comments,
-- and blog_likes to profiles so PostgREST can resolve joins
-- automatically (e.g. profiles(full_name, avatar_url)).
--
-- PRECONDITIONS — verify before running:
--   1. blog_posts.author_id: all non-NULL values must exist in
--      profiles(id). Seeded posts have author_id = NULL so they
--      are safe. Any manually created posts with an author_id
--      must have a matching profile row.
--   2. blog_comments.user_id: all non-NULL values must exist in
--      profiles(id). Guest comments (user_id = NULL) are safe.
--   3. blog_likes.user_id: all non-NULL values must exist in
--      profiles(id). Likes without a logged-in user (user_id = NULL)
--      are safe.
--
-- If in doubt, run this query first to check for orphans:
--   SELECT bp.id FROM blog_posts bp
--     LEFT JOIN profiles p ON p.id = bp.author_id
--     WHERE bp.author_id IS NOT NULL AND p.id IS NULL;
--
-- Run this in Supabase SQL Editor AFTER 010_blog.sql.
-- ============================================================

-- blog_posts: remap author_id FK from auth.users → profiles
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey,
  ADD CONSTRAINT blog_posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- blog_comments: remap user_id FK from auth.users → profiles
ALTER TABLE blog_comments
  DROP CONSTRAINT IF EXISTS blog_comments_user_id_fkey,
  ADD CONSTRAINT blog_comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- blog_likes: remap user_id FK from auth.users → profiles
-- Precondition: every non-NULL user_id must have a profiles row.
ALTER TABLE blog_likes
  DROP CONSTRAINT IF EXISTS blog_likes_user_id_fkey,
  ADD CONSTRAINT blog_likes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
