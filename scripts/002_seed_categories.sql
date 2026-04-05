-- ============================================================
-- VendoorX — Seed Categories
-- ============================================================

insert into public.categories (name, slug, icon, description)
values
  ('Electronics',    'electronics',    '💻', 'Phones, laptops, gadgets and accessories'),
  ('Fashion',        'fashion',        '👗', 'Clothes, shoes, bags and accessories'),
  ('Textbooks',      'textbooks',      '📚', 'Course materials, novels and academic books'),
  ('Food & Snacks',  'food',           '🍱', 'Homemade food, snacks and beverages'),
  ('Services',       'services',       '🛠️', 'Tutoring, repairs, design and freelance work'),
  ('Beauty',         'beauty',         '💄', 'Skincare, haircare and beauty products'),
  ('Sports & Fitness','sports',        '⚽', 'Sports equipment, gym gear and activewear'),
  ('Home & Dorm',    'home',           '🏠', 'Furniture, bedding and dorm essentials'),
  ('Art & Crafts',   'art',            '🎨', 'Handmade items, art prints and crafts'),
  ('Vehicles',       'vehicles',       '🚲', 'Bikes, scooters and vehicle accessories')
on conflict (slug) do nothing;
