-- ============================================================
-- VendoorX Blog System — Migration 010
-- Run this in Supabase SQL Editor
-- ============================================================

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  color       text DEFAULT '#16a34a',
  created_at  timestamptz DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  excerpt       text,
  content       text NOT NULL DEFAULT '',
  cover_image   text,
  author_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id   uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags          text[] DEFAULT '{}',
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  is_featured   boolean DEFAULT false,
  views         bigint DEFAULT 0,
  read_time     int DEFAULT 5,
  seo_title     text,
  seo_description text,
  published_at  timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Blog comments
CREATE TABLE IF NOT EXISTS blog_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name  text,
  guest_email text,
  content     text NOT NULL,
  parent_id   uuid REFERENCES blog_comments(id) ON DELETE CASCADE,
  is_approved boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Blog likes
CREATE TABLE IF NOT EXISTS blog_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash     text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post ON blog_likes(post_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_posts_updated_at();

-- RLS
ALTER TABLE blog_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "blog_categories_public_read" ON blog_categories FOR SELECT USING (true);

-- Posts: public read published
CREATE POLICY "blog_posts_public_read" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "blog_posts_admin_all"   ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
);

-- Comments: public read approved
CREATE POLICY "blog_comments_public_read" ON blog_comments FOR SELECT USING (is_approved = true);
CREATE POLICY "blog_comments_insert"      ON blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_comments_admin_all"   ON blog_comments FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
);

-- Likes: anyone can see, authenticated users can insert
CREATE POLICY "blog_likes_public_read" ON blog_likes FOR SELECT USING (true);
CREATE POLICY "blog_likes_insert"      ON blog_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_likes_delete"      ON blog_likes FOR DELETE USING (user_id = auth.uid());

-- Seed categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
  ('Seller Tips',       'seller-tips',       'Guides for campus sellers',          '#16a34a'),
  ('Platform Updates',  'platform-updates',  'Latest VendoorX feature releases',   '#2563eb'),
  ('Campus Life',       'campus-life',       'Student life stories and insights',  '#7c3aed'),
  ('Success Stories',   'success-stories',   'Sellers who made it on VendoorX',    '#ea580c'),
  ('Guides & How-Tos',  'guides',            'Step-by-step tutorials',             '#0891b2')
ON CONFLICT (slug) DO NOTHING;

-- Seed a featured sample post
INSERT INTO blog_posts (
  title, slug, excerpt, content, cover_image, category_id,
  tags, status, is_featured, read_time, published_at
) VALUES (
  'How to Make Your First ₦50,000 on VendoorX in 30 Days',
  'how-to-make-first-50k-vendoorx-30-days',
  'A step-by-step guide for new campus sellers — from choosing the right products to crafting listings that convert.',
  '## Getting Started on VendoorX

Welcome to VendoorX — Nigeria''s #1 campus marketplace. Whether you''re selling textbooks, electronics, or food, this guide will help you hit your first **₦50,000** in just 30 days.

## Step 1: Choose the Right Products

The best-selling categories on VendoorX are:

- 📱 **Electronics** — phones, earbuds, laptop accessories
- 📚 **Textbooks** — especially at the start of semester
- 👗 **Fashion** — thrift items, Ankara, shoes
- 🍱 **Food** — homemade meals, snacks, fresh produce

**Pro tip:** Start with things you already own but no longer need. Zero investment = pure profit.

## Step 2: Take Great Photos

Your listing image is the #1 factor in whether someone clicks. Tips:

1. Use natural daylight (morning near a window is best)
2. Clean background — use a plain wall or white sheet
3. Show multiple angles
4. For electronics, show it powered on

## Step 3: Write a Compelling Description

Your title should answer: *What is it? What condition? Key specs?*

**Bad:** "Phone for sale"
**Good:** "iPhone 13 128GB Midnight Black — Like New, with box and charger"

## Step 4: Price Competitively

Check what similar items are selling for on VendoorX and price 5–10% lower when starting out. Once you have reviews, you can price at market rate.

## Step 5: Share on WhatsApp Status

After listing, tap the WhatsApp button on your product page to instantly create a pre-formatted message. Share to your Status every morning at 7 AM and 8 PM for maximum reach.

## Results

Following these steps, our top sellers consistently hit ₦50,000+ in their first month. Some have gone on to build full campus businesses earning ₦500,000/month.

**Start listing today — it''s completely free!**',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop&q=80',
  (SELECT id FROM blog_categories WHERE slug = 'seller-tips'),
  ARRAY['seller tips', 'money', 'campus business', 'beginner'],
  'published',
  true,
  7,
  now() - interval '10 days'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (
  title, slug, excerpt, content, cover_image, category_id,
  tags, status, is_featured, read_time, published_at
) VALUES (
  'Introducing Store Boost: Get 3× More Visibility for Your Listings',
  'introducing-store-boost-3x-visibility',
  'The new Boost feature lets sellers promote their store for 7 days with guaranteed placement at the top of marketplace results.',
  '## What is Store Boost?

Store Boost is VendoorX''s new promotion tool that places your listings at the very top of marketplace search results for **7 days**. Boosted listings are shown with an ⚡ Featured badge, making them impossible to miss.

## How Does It Work?

1. Go to your **Seller Dashboard**
2. Click **"Boost Store"** on any active listing
3. Complete the ₦2,000 payment via Paystack
4. Your listing is immediately pinned to the top

## Results Our Sellers Are Seeing

Boosted listings get on average:

- **3.2× more views** than unboosted listings
- **2.8× more WhatsApp clicks**
- **1.9× faster sales**

## Who Should Use Boost?

Boost is perfect for:

- High-value items (electronics, phones, laptops)
- Time-sensitive listings (semester-start textbooks)
- Sellers launching a new store

## Get Started

Head to your dashboard and boost your first listing today. First-time boost users get **50% off** — use code `BOOST50` at checkout.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&q=80',
  (SELECT id FROM blog_categories WHERE slug = 'platform-updates'),
  ARRAY['features', 'boost', 'visibility', 'promotion'],
  'published',
  false,
  4,
  now() - interval '25 days'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (
  title, slug, excerpt, content, cover_image, category_id,
  tags, status, is_featured, read_time, published_at
) VALUES (
  'From UNILAG Student to ₦2M/Month Campus Entrepreneur',
  'unilag-student-2m-monthly-campus-entrepreneur',
  'Tunde Adeyemi started selling phones from his hostel room in 200L. Today he runs a ₦2M/month campus business entirely through VendoorX.',
  '## Meet Tunde Adeyemi

When Tunde Adeyemi enrolled at the University of Lagos to study Computer Science, he had one goal: graduate without debt. What he didn''t expect was to build a ₦2 million/month business before his final year.

## How It Started

"I had an old iPhone 11 I wasn''t using," Tunde recalls. "I listed it on VendoorX on a Tuesday. It sold on Wednesday. I made ₦15,000 profit. That was it for me — I was hooked."

Within a week, Tunde had sourced three more phones from Alaba Market and listed them on VendoorX. All three sold within 48 hours.

## The Growth

By 200L second semester, Tunde was running a full operation:

- Sourcing 15–20 devices weekly from wholesalers
- Using VendoorX''s WhatsApp integration to handle 50+ inquiries/day
- Employing two other students as delivery partners
- Monthly revenue: **₦800,000–₦1.2M**

## The Turning Point

"What changed everything was the Boost feature. Before boost, I was getting maybe 30 views per listing. After boosting, I was getting 120+ views. My weekly sales doubled in the first month."

## Today

In his final year, Tunde''s monthly revenue hit ₦2.1M in his best month. He''s registered a business, hired 4 full-time students, and is building an inventory system.

"VendoorX gave me the platform, but it''s the community that made it work. Every serious campus seller is here."

## Tunde''s Tips for New Sellers

1. **Start with what you have** — your first listing shouldn''t cost you anything
2. **Be responsive** — reply to WhatsApp messages within 5 minutes
3. **Photos matter** — spend 10 minutes getting good lighting
4. **Boost strategically** — boost your best item, not your newest
5. **Reinvest profits** — don''t spend your first ₦50K, use it to buy more inventory',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=630&fit=crop&q=80',
  (SELECT id FROM blog_categories WHERE slug = 'success-stories'),
  ARRAY['success story', 'entrepreneur', 'UNILAG', 'phones'],
  'published',
  false,
  6,
  now() - interval '5 days'
) ON CONFLICT (slug) DO NOTHING;
