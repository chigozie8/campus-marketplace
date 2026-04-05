# VendorX Backend

Enterprise-grade Node.js/Express backend for the VendorX chat-commerce platform — WhatsApp + Supabase + Paystack.

---

## Tech Stack

- Node.js 20+ (ESM)
- Express.js (modular)
- Supabase (PostgreSQL + Auth)
- Paystack (payments)
- WhatsApp Cloud API (messaging)
- Winston (logging)
- Joi (validation)
- Helmet / CORS / express-rate-limit (security)

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Supabase database setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  role text not null default 'buyer' check (role in ('buyer', 'vendor', 'admin')),
  created_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  stock_quantity integer default 0,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id) not null,
  vendor_id uuid references profiles(id) not null,
  product_id uuid references products(id) not null,
  quantity integer not null default 1,
  total_amount numeric(10,2) not null,
  delivery_address text not null,
  status text not null default 'pending'
    check (status in ('pending','paid','shipped','delivered','completed','cancelled')),
  payment_reference text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
```

### 4. Run the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/profile` | Yes | Get current user profile |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | No | List products (paginated, filterable) |
| GET | `/api/products/:id` | No | Get product by ID |
| POST | `/api/products` | Vendor | Create product |
| PATCH | `/api/products/:id` | Vendor | Update product |
| DELETE | `/api/products/:id` | Vendor | Delete product |

**Query params for GET /products:**
`page`, `limit`, `search`, `category`, `min_price`, `max_price`, `sort` (newest|price_asc|price_desc)

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Buyer | Create order |
| GET | `/api/orders/me` | Buyer | My order history |
| GET | `/api/orders/:id` | Owner | Get order by ID |
| GET | `/api/orders/vendor/dashboard` | Vendor | Vendor order dashboard |
| PATCH | `/api/orders/:id/status` | Vendor | Update order status |
| POST | `/api/orders/:id/pay` | Buyer | Initialize Paystack payment |
| GET | `/api/orders/verify/:reference` | Buyer | Verify payment |

---

## Webhook Setup

### Paystack

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add URL: `https://your-domain.com/api/webhooks/paystack`
3. Copy the webhook secret and add to `.env` as `PAYSTACK_WEBHOOK_SECRET`

### WhatsApp Cloud API

1. Go to Meta Developer Portal → WhatsApp → Configuration
2. Set Webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
3. Set Verify Token (must match `WHATSAPP_VERIFY_TOKEN` in `.env`)
4. Subscribe to the `messages` webhook field

---

## WhatsApp Bot Commands

| User sends | Bot action |
|-----------|------------|
| `hi` / `hello` | Welcome message |
| `shoes`, `phone`, `food`, etc. | Search products |
| `price of iPhone` | Product price lookup |
| `BUY <product-id>` | Product detail + buy link |
| `order status` | Redirect to app |
| anything else | Help message |

---

## Deployment

### Render / Railway

1. Set all environment variables in the platform dashboard
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Ensure `NODE_ENV=production`

### VPS (Ubuntu)

```bash
git clone your-repo
cd backend
npm install
# Set up .env
npm install -g pm2
pm2 start src/server.js --name vendorx-api
pm2 save
pm2 startup
```

Use Nginx as a reverse proxy in front of port 5000.

---

## Health Check

```
GET /health
```

Returns `{ "status": "ok", "service": "VendorX API", "timestamp": "..." }`
