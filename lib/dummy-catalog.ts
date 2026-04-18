/**
 * Curated catalogue of realistic-looking demo listings used by the admin
 * "Dummy data" tool. Every entry has a stable `slug` so the tool can tell
 * which items have already been added to the marketplace.
 *
 * Image URLs come from Unsplash's public hot-link CDN — free to use,
 * no API key required.
 */

export type DummyItem = {
  /** Stable identifier — never change once shipped. */
  slug: string
  title: string
  description: string
  price: number
  originalPrice?: number
  condition: 'new' | 'like_new' | 'good' | 'fair'
  /** Matches a row in the `categories` table by slug; falls back to null. */
  categorySlug: string
  campus: string
  /** Direct image URL (Unsplash hot-link, sized for marketplace cards). */
  image: string
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

export const DUMMY_LISTINGS: DummyItem[] = [
  // ── Electronics (10) ──────────────────────────────────────────────────
  { slug: 'apple-airpods-pro-2nd', title: 'Apple AirPods Pro (2nd Gen)', description: 'Barely used AirPods Pro with active noise cancellation. Comes with charging case and original cable.',
    price: 165000, originalPrice: 220000, condition: 'like_new', categorySlug: 'electronics', campus: 'UNILAG', image: img('photo-1606220588913-b3aacb4d2f37') },
  { slug: 'iphone-13-128gb', title: 'iPhone 13 — 128GB Midnight', description: 'Clean iPhone 13, 128GB, battery health 91%. Comes with box, cable, and a free silicone case.',
    price: 425000, originalPrice: 520000, condition: 'good', categorySlug: 'electronics', campus: 'UI', image: img('photo-1632661674596-df8be070a5c5') },
  { slug: 'macbook-air-m1', title: 'MacBook Air M1 (2020) — 8GB/256GB', description: 'Perfect for school work. Light, fast, all-day battery. Includes original charger.',
    price: 720000, originalPrice: 950000, condition: 'good', categorySlug: 'electronics', campus: 'OAU', image: img('photo-1611186871348-b1ce696e52c9') },
  { slug: 'sony-wh1000xm4', title: 'Sony WH-1000XM4 Headphones', description: 'Industry-leading noise cancellation. Padding still in great shape.',
    price: 145000, condition: 'good', categorySlug: 'electronics', campus: 'ABU', image: img('photo-1583394838336-acd977736f90') },
  { slug: 'gaming-mouse-rgb', title: 'Logitech G502 Gaming Mouse', description: 'Wired RGB gaming mouse with 11 programmable buttons. Lightly used.',
    price: 28000, condition: 'like_new', categorySlug: 'electronics', campus: 'BUK', image: img('photo-1527814050087-3793815479db') },
  { slug: 'mechanical-keyboard', title: 'Royal Kludge RK68 Mechanical Keyboard', description: 'Hot-swappable, brown switches, RGB. Very satisfying typing experience.',
    price: 42000, condition: 'new', categorySlug: 'electronics', campus: 'FUTA', image: img('photo-1587829741301-dc798b83add3') },
  { slug: 'samsung-galaxy-tab-s7', title: 'Samsung Galaxy Tab S7', description: 'Great for note-taking with the included S-Pen. Screen is flawless.',
    price: 280000, originalPrice: 360000, condition: 'good', categorySlug: 'electronics', campus: 'UNILAG', image: img('photo-1561154464-82e9adf32764') },
  { slug: 'jbl-flip-6', title: 'JBL Flip 6 Bluetooth Speaker', description: 'Loud, waterproof party speaker. Battery lasts forever.',
    price: 55000, condition: 'like_new', categorySlug: 'electronics', campus: 'UI', image: img('photo-1608043152269-423dbba4e7e1') },
  { slug: 'canon-eos-200d', title: 'Canon EOS 200D DSLR + 18-55mm Lens', description: 'Beginner-friendly DSLR for content creators. Shutter count under 8k.',
    price: 320000, condition: 'good', categorySlug: 'electronics', campus: 'COVENANT', image: img('photo-1502920917128-1aa500764cbd') },
  { slug: 'power-bank-20000mah', title: 'Anker 20,000mAh Power Bank', description: 'Charges your phone 4-5 times. Fast charge supported.',
    price: 22000, condition: 'new', categorySlug: 'electronics', campus: 'UNIBEN', image: img('photo-1609091839311-d5365f9ff1c5') },

  // ── Textbooks (8) ─────────────────────────────────────────────────────
  { slug: 'engineering-mechanics-hibbeler', title: 'Engineering Mechanics by Hibbeler (14th Ed.)', description: 'Clean copy, no highlights. Compulsory text for 200-level engineering.',
    price: 8500, originalPrice: 15000, condition: 'good', categorySlug: 'textbooks', campus: 'UNILAG', image: img('photo-1544716278-ca5e3f4abd8c') },
  { slug: 'gross-anatomy-snell', title: 'Snell\'s Clinical Anatomy 9th Edition', description: 'Medical school essential. Spine intact, minor pencil notes.',
    price: 12000, condition: 'good', categorySlug: 'textbooks', campus: 'UI', image: img('photo-1543002588-bfa74002ed7e') },
  { slug: 'intro-to-economics-jhingan', title: 'Macroeconomic Theory by M.L. Jhingan', description: 'Standard ECO 101 textbook. Like-new condition.',
    price: 5500, condition: 'like_new', categorySlug: 'textbooks', campus: 'OAU', image: img('photo-1519682337058-a94d519337bc') },
  { slug: 'data-structures-weiss', title: 'Data Structures & Algorithm Analysis (Weiss)', description: 'For CSC 301. C++ examples included.',
    price: 9000, condition: 'good', categorySlug: 'textbooks', campus: 'FUTA', image: img('photo-1497633762265-9d179a990aa6') },
  { slug: 'gcalculus-stewart', title: 'Calculus — Early Transcendentals (Stewart)', description: '8th edition. Some pages dog-eared but very readable.',
    price: 7000, condition: 'fair', categorySlug: 'textbooks', campus: 'ABU', image: img('photo-1456513080510-7bf3a84b82f8') },
  { slug: 'company-law-orojo', title: 'Company Law in Nigeria by Orojo', description: 'Standard law school reference. Perfect for 300-level.',
    price: 11000, condition: 'good', categorySlug: 'textbooks', campus: 'UNILAG', image: img('photo-1589998059171-988d887df646') },
  { slug: 'organic-chemistry-clayden', title: 'Organic Chemistry by Clayden et al.', description: 'The bible for organic chem. Heavy but worth every kobo.',
    price: 14000, condition: 'good', categorySlug: 'textbooks', campus: 'UI', image: img('photo-1532012197267-da84d127e765') },
  { slug: 'principles-marketing-kotler', title: 'Principles of Marketing — Philip Kotler', description: '17th edition. Required for marketing students.',
    price: 8000, condition: 'like_new', categorySlug: 'textbooks', campus: 'BUK', image: img('photo-1481627834876-b7833e8f5570') },

  // ── Fashion (8) ───────────────────────────────────────────────────────
  { slug: 'air-jordan-1-low', title: 'Nike Air Jordan 1 Low — Size 42', description: 'Worn twice. Original box and dust bag included.',
    price: 65000, originalPrice: 95000, condition: 'like_new', categorySlug: 'fashion', campus: 'UNILAG', image: img('photo-1542291026-7eec264c27ff') },
  { slug: 'thrift-denim-jacket', title: 'Vintage Denim Jacket (Oversized)', description: 'Carefully sourced thrift piece. Unisex fit, works with everything.',
    price: 12000, condition: 'good', categorySlug: 'fashion', campus: 'OAU', image: img('photo-1543076447-215ad9ba6923') },
  { slug: 'ankara-two-piece', title: 'Custom Ankara Two-Piece Set', description: 'Made by a campus tailor. Modern cut, never worn.',
    price: 18000, condition: 'new', categorySlug: 'fashion', campus: 'UNILORIN', image: img('photo-1564257631407-4deb1f99d992') },
  { slug: 'leather-laptop-bag', title: 'Brown Leather Laptop Bag', description: 'Fits up to 16-inch laptop plus books. Sturdy and stylish.',
    price: 25000, condition: 'good', categorySlug: 'fashion', campus: 'UI', image: img('photo-1547949003-9792a18a2601') },
  { slug: 'casio-watch-ae1200', title: 'Casio AE-1200 Royale Watch', description: 'Iconic digital watch. Battery just replaced.',
    price: 18000, condition: 'like_new', categorySlug: 'fashion', campus: 'ABU', image: img('photo-1524592094714-0f0654e20314') },
  { slug: 'oversized-hoodie-black', title: 'Oversized Black Hoodie (Unisex)', description: 'Heavyweight cotton fleece. Size L fits most.',
    price: 14000, condition: 'new', categorySlug: 'fashion', campus: 'COVENANT', image: img('photo-1556821840-3a63f95609a7') },
  { slug: 'sunglasses-aviator', title: 'Aviator Sunglasses — Polarised', description: 'UV-400 protection. Comes with hard case.',
    price: 7500, condition: 'new', categorySlug: 'fashion', campus: 'FUTA', image: img('photo-1572635196237-14b3f281503f') },
  { slug: 'bucket-hat-beige', title: 'Beige Bucket Hat', description: 'Trendy and lightweight. One size fits all.',
    price: 4500, condition: 'new', categorySlug: 'fashion', campus: 'UNIBEN', image: img('photo-1566174053879-31528523f8ae') },

  // ── Food & Snacks (5) ─────────────────────────────────────────────────
  { slug: 'homemade-meat-pie', title: 'Homemade Meat Pies (Pack of 6)', description: 'Freshly baked, beef and potato filling. Order before 9am for same-day pickup.',
    price: 3000, condition: 'new', categorySlug: 'food', campus: 'UNILAG', image: img('photo-1565299624946-b28f40a0ae38') },
  { slug: 'jollof-rice-pack', title: 'Party Jollof + Chicken (Single Pack)', description: 'Smoky party-style jollof with spicy fried chicken and plantain.',
    price: 2800, condition: 'new', categorySlug: 'food', campus: 'OAU', image: img('photo-1604329760661-e71dc83f8f26') },
  { slug: 'chin-chin-jar', title: 'Crunchy Chin Chin (1L Jar)', description: 'Sweet and crunchy, made fresh weekly. Perfect for late-night reading.',
    price: 2500, condition: 'new', categorySlug: 'food', campus: 'UI', image: img('photo-1606312619070-d48b4c652a52') },
  { slug: 'smoothie-pack', title: 'Mixed Fruit Smoothie (4 Pack)', description: 'Mango, banana, pineapple, watermelon. Delivered chilled to your hostel.',
    price: 4500, condition: 'new', categorySlug: 'food', campus: 'COVENANT', image: img('photo-1502741338009-cac2772e18bc') },
  { slug: 'puff-puff-50pcs', title: 'Puff Puff (50 pieces)', description: 'Fluffy and sweet. Great for hostel gatherings.',
    price: 3500, condition: 'new', categorySlug: 'food', campus: 'BUK', image: img('photo-1626078299034-94f9f6ad3a72') },

  // ── Services (5) ──────────────────────────────────────────────────────
  { slug: 'logo-design-service', title: 'Custom Logo Design (3 Concepts)', description: 'Professional logo design with unlimited revisions on your chosen concept. 48-hour delivery.',
    price: 15000, condition: 'new', categorySlug: 'services', campus: 'UNILAG', image: img('photo-1626785774573-4b799315345d') },
  { slug: 'project-binding', title: 'Project Binding & Printing', description: 'Hardcover binding with gold lettering for your final-year project. Same-day service.',
    price: 6500, condition: 'new', categorySlug: 'services', campus: 'UI', image: img('photo-1457369804613-52c61a468e7d') },
  { slug: 'haircut-home-service', title: 'Hostel Haircut Service', description: 'Mobile barber comes to your hostel. Clean fade, taper, or buzz cut.',
    price: 2500, condition: 'new', categorySlug: 'services', campus: 'OAU', image: img('photo-1599351431202-1e0f0137899a') },
  { slug: 'photography-event', title: 'Event Photography (3-hour package)', description: 'Birthdays, hangouts, dinner parties. Includes 50 edited photos.',
    price: 35000, condition: 'new', categorySlug: 'services', campus: 'COVENANT', image: img('photo-1542038784456-1ea8e935640e') },
  { slug: 'web-dev-portfolio', title: 'Personal Portfolio Website Build', description: 'Responsive single-page portfolio. Deployed and ready in 5 days.',
    price: 45000, condition: 'new', categorySlug: 'services', campus: 'FUTA', image: img('photo-1547658719-da2b51169166') },

  // ── Beauty (4) ────────────────────────────────────────────────────────
  { slug: 'fenty-foundation', title: 'Fenty Beauty Pro Filt\'r Foundation (340)', description: 'Used twice. Wrong shade for me. Original packaging.',
    price: 18000, originalPrice: 28000, condition: 'like_new', categorySlug: 'beauty', campus: 'UNILAG', image: img('photo-1522335789203-aaa00cf2ef96') },
  { slug: 'maybelline-mascara', title: 'Maybelline Lash Sensational Mascara', description: 'Sealed, never opened. Bought extra by mistake.',
    price: 6500, condition: 'new', categorySlug: 'beauty', campus: 'UI', image: img('photo-1631214524115-f43f30bf1ef3') },
  { slug: 'shea-butter-jar', title: 'Pure Shea Butter (500g)', description: 'Sourced from Northern Nigeria. 100% natural, no additives.',
    price: 4500, condition: 'new', categorySlug: 'beauty', campus: 'ABU', image: img('photo-1556228720-195a672e8a03') },
  { slug: 'wig-bob-cut', title: 'Human Hair Bob Wig (12 inches)', description: 'Pre-styled, lace front. Only worn for one event.',
    price: 38000, originalPrice: 55000, condition: 'like_new', categorySlug: 'beauty', campus: 'OAU', image: img('photo-1522337360788-8b13dee7a37e') },

  // ── Sports & Fitness (4) ──────────────────────────────────────────────
  { slug: 'football-size-5', title: 'Adidas Tango Football (Size 5)', description: 'FIFA-approved match ball. Used for one season.',
    price: 12000, condition: 'good', categorySlug: 'sports', campus: 'UNILAG', image: img('photo-1614632537190-23e4146777db') },
  { slug: 'dumbbells-10kg', title: 'Adjustable Dumbbells (Pair, up to 10kg each)', description: 'Save space in your hostel. Plates included.',
    price: 35000, condition: 'good', categorySlug: 'sports', campus: 'UI', image: img('photo-1517836357463-d25dfeac3438') },
  { slug: 'yoga-mat-purple', title: 'Premium Yoga Mat (6mm thick)', description: 'Non-slip, eco-friendly material. Comes with carry strap.',
    price: 9500, condition: 'new', categorySlug: 'sports', campus: 'COVENANT', image: img('photo-1545205597-3d9d02c29597') },
  { slug: 'skipping-rope', title: 'Weighted Skipping Rope', description: 'Adjustable length, ball-bearing handles. Burns calories fast.',
    price: 4500, condition: 'new', categorySlug: 'sports', campus: 'FUTA', image: img('photo-1518611012118-696072aa579a') },

  // ── Home & Dorm (4) ───────────────────────────────────────────────────
  { slug: 'led-desk-lamp', title: 'LED Desk Lamp with USB Port', description: 'Three brightness levels, touch control. Great for late-night reading.',
    price: 8500, condition: 'new', categorySlug: 'home', campus: 'UNILAG', image: img('photo-1507473885765-e6ed057f782c') },
  { slug: 'mini-fridge', title: 'Mini Fridge (45L) — White', description: 'Perfect for hostel rooms. Quiet, energy-efficient. Used for one semester.',
    price: 65000, originalPrice: 90000, condition: 'good', categorySlug: 'home', campus: 'OAU', image: img('photo-1571175443880-49e1d25b2bc5') },
  { slug: 'electric-kettle-1l', title: 'Electric Kettle (1.0L)', description: 'Fast-boil, auto shut-off. Like new.',
    price: 7500, condition: 'like_new', categorySlug: 'home', campus: 'UI', image: img('photo-1517677208171-0bc6725a3e60') },
  { slug: 'standing-fan-18inch', title: '18-inch Standing Fan (3 speeds)', description: 'Quiet operation, oscillating head. Survived two semesters of heat.',
    price: 22000, condition: 'good', categorySlug: 'home', campus: 'BUK', image: img('photo-1565374395542-0ce18882c857') },

  // ── Vehicles (2) ──────────────────────────────────────────────────────
  { slug: 'bicycle-mountain', title: 'Mountain Bike — 26-inch', description: '21 gears, front suspension. Great for getting around campus quickly.',
    price: 75000, condition: 'good', categorySlug: 'vehicles', campus: 'COVENANT', image: img('photo-1532298229144-0ec0c57515c7') },
  { slug: 'electric-scooter', title: 'Electric Scooter — 25km Range', description: 'Foldable, lightweight. Ideal for big campuses. Comes with charger.',
    price: 185000, originalPrice: 240000, condition: 'good', categorySlug: 'vehicles', campus: 'UNILAG', image: img('photo-1604868189265-219ba7bf7ea3') },

  // ── TVs & Displays (5) ────────────────────────────────────────────────
  { slug: 'samsung-43-smart-tv', title: 'Samsung 43" Smart TV (4K UHD)', description: 'Crystal-clear 4K display with built-in Netflix, YouTube and Prime Video. Comes with original remote and stand.',
    price: 235000, originalPrice: 320000, condition: 'good', categorySlug: 'electronics', campus: 'UNILAG', image: img('photo-1593359677879-a4bb92f829d1') },
  { slug: 'lg-32-led-tv', title: 'LG 32" LED TV with HDMI', description: 'Compact LED TV — perfect for hostel rooms. Two HDMI ports, USB playback. Lightly used.',
    price: 110000, condition: 'good', categorySlug: 'electronics', campus: 'OAU', image: img('photo-1461151304267-38535e780c79') },
  { slug: 'hisense-50-4k-tv', title: 'Hisense 50" 4K Smart TV', description: 'Big-screen 4K experience with Vidaa OS, voice remote and screen mirroring. Box still available.',
    price: 295000, originalPrice: 380000, condition: 'like_new', categorySlug: 'electronics', campus: 'COVENANT', image: img('photo-1601944179066-29786cb9d32a') },
  { slug: 'tv-wall-mount', title: 'Universal TV Wall Mount (32–55")', description: 'Heavy-duty tilt-and-swivel mount with all screws included. Brand new in box.',
    price: 12500, condition: 'new', categorySlug: 'electronics', campus: 'UI', image: img('photo-1567016432779-094069958ea5') },
  { slug: 'projector-mini-1080p', title: 'Mini Projector — 1080p HDMI', description: 'Movie nights anywhere on campus. Bluetooth speaker support, HDMI + USB inputs. Comes with carry pouch.',
    price: 95000, originalPrice: 130000, condition: 'like_new', categorySlug: 'electronics', campus: 'ABU', image: img('photo-1626379953822-baec19c3accd') },

  // ── Gadgets (5) ───────────────────────────────────────────────────────
  { slug: 'apple-watch-se', title: 'Apple Watch SE (40mm) — Midnight', description: 'GPS model with sport band. Battery still excellent. Includes magnetic charger.',
    price: 165000, originalPrice: 220000, condition: 'good', categorySlug: 'electronics', campus: 'UI', image: img('photo-1546868871-7041f2a55e12') },
  { slug: 'samsung-galaxy-tab-a8', title: 'Samsung Galaxy Tab A8 — 64GB', description: 'Great for note-taking and streaming. Comes with charger and original box.',
    price: 145000, condition: 'good', categorySlug: 'electronics', campus: 'BUK', image: img('photo-1561154464-82e9adf32764') },
  { slug: 'gopro-hero-9', title: 'GoPro HERO 9 Black — 5K', description: 'Action camera with front display. Includes 64GB SD card and chest mount.',
    price: 215000, originalPrice: 290000, condition: 'good', categorySlug: 'electronics', campus: 'COVENANT', image: img('photo-1526317899612-fc036c5e8a6b') },
  { slug: 'jbl-flip-5-speaker', title: 'JBL Flip 5 Bluetooth Speaker', description: 'Waterproof portable speaker with 12-hour battery. Loud, punchy bass.',
    price: 48000, condition: 'like_new', categorySlug: 'electronics', campus: 'UNILORIN', image: img('photo-1608043152269-423dbba4e7e1') },
  { slug: 'kindle-paperwhite', title: 'Kindle Paperwhite (11th Gen)', description: 'Glare-free 6.8" display, weeks of battery. Loaded with 30+ free books.',
    price: 78000, condition: 'like_new', categorySlug: 'electronics', campus: 'UNIBEN', image: img('photo-1592434134753-a70baf7979d5') },

  // ── More Clothing (6) ─────────────────────────────────────────────────
  { slug: 'denim-jacket-blue', title: 'Classic Blue Denim Jacket', description: 'Timeless wash, fits true to size (M). Worn maybe twice — basically new.',
    price: 14500, condition: 'like_new', categorySlug: 'fashion', campus: 'UI', image: img('photo-1601333144130-8cbb312386b6') },
  { slug: 'nike-tracksuit-black', title: 'Nike Tracksuit (Black) — Size L', description: 'Full Nike tracksuit set, top + bottom. Great for gym or chill days.',
    price: 32000, condition: 'good', categorySlug: 'fashion', campus: 'UNILAG', image: img('photo-1556821840-3a63f95609a7') },
  { slug: 'sneakers-air-force-1', title: 'Nike Air Force 1 — All White (Size 42)', description: 'Iconic AF1s, freshly cleaned. Minor crease on left toe but still very fresh.',
    price: 52000, originalPrice: 78000, condition: 'good', categorySlug: 'fashion', campus: 'OAU', image: img('photo-1542291026-7eec264c27ff') },
  { slug: 'oversized-hoodie-grey', title: 'Oversized Heavy Hoodie — Heather Grey', description: 'Premium 400gsm cotton hoodie. Super warm for harmattan season. Size XL.',
    price: 18500, condition: 'new', categorySlug: 'fashion', campus: 'ABU', image: img('photo-1556821840-3a63f95609a7') },
  { slug: 'ankara-print-shirt', title: 'Custom Ankara Print Shirt (Men, L)', description: 'Hand-tailored Ankara button-down. Bright statement piece for owambe and outings.',
    price: 12000, condition: 'new', categorySlug: 'fashion', campus: 'UNILORIN', image: img('photo-1602810318383-e386cc2a3ccf') },
  { slug: 'leather-belt-brown', title: 'Genuine Leather Belt — Brown', description: 'Real leather, brushed-silver buckle. Adjustable, fits 30–36 waist.',
    price: 6500, condition: 'new', categorySlug: 'fashion', campus: 'FUTA', image: img('photo-1624222247344-550fb60583dc') },
]
