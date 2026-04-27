# Ticketing Site Template

A complete, production-ready ticketing website. Sell tickets, accept Stripe payments, manage events from a private dashboard. Mobile-friendly, fast, and yours to customize.

## What you get

- Public event listing page
- Event detail page with 3-step checkout
- Stripe payments (test + live)
- QR code ticket confirmation
- Private seller dashboard with login
- Real-time stats per event
- Edit, create, and delete events on the fly
- Photo uploads
- Fully mobile responsive

---

## Setup — about 30 minutes

You need **3 free accounts**: Supabase (database), Stripe (payments), and Vercel (hosting). All free to start.

### Step 1 — Supabase (database)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project. Wait a couple minutes for it to spin up.
3. Go to **SQL Editor** and run this whole block to create your tables:

```sql
-- Events table
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  date text,
  time text,
  venue text,
  category text default 'Nightlife',
  capacity int default 200,
  photo_url text,
  status text default 'upcoming',
  created_at timestamptz default now()
);

-- Ticket tiers
create table ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null,
  capacity int default 100,
  sold int default 0,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  tier_id uuid references ticket_tiers(id) on delete set null,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  quantity int default 1,
  total numeric,
  stripe_payment_id text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table events enable row level security;
alter table ticket_tiers enable row level security;
alter table orders enable row level security;

-- Public read/write policies (so the site can read & write data)
create policy "Public read events" on events for select using (true);
create policy "Public read tiers" on ticket_tiers for select using (true);
create policy "Public read orders" on orders for select using (true);
create policy "Public insert events" on events for insert with check (true);
create policy "Public insert tiers" on ticket_tiers for insert with check (true);
create policy "Public insert orders" on orders for insert with check (true);
create policy "Public update events" on events for update using (true);
create policy "Public update tiers" on ticket_tiers for update using (true);
create policy "Public delete tiers" on ticket_tiers for delete using (true);
```

4. Create a storage bucket for event photos:
   - Go to **Storage** → **New bucket**
   - Name it `event-photos`
   - Make it **public**

5. Create your seller login:
   - Go to **Authentication** → **Users** → **Add user** (invite by email or create with password)
   - This is the email + password you'll use to log into your dashboard

6. Get your API keys:
   - Go to **Project Settings** → **API**
   - Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy the **anon / public key** (long string starting with `eyJ...`)

### Step 2 — Stripe (payments)

1. Sign up at [stripe.com](https://stripe.com)
2. Once logged in, go to **Developers** → **API Keys**
3. You'll be in test mode by default — that's fine for setup
4. Copy:
   - The **Publishable key** (starts with `pk_test_...`)
   - The **Secret key** (starts with `sk_test_...`) — keep this secret, we'll only use it on the server

To go live with real payments, you'll need to verify your business identity in Stripe later, then swap the test keys for live keys.

### Step 3 — Configure your site

Open `config.js` and fill in your values:

```javascript
window.BRAND = {
  name: 'YourSite',                    // Your site name
  tagline: 'Your tagline here.',
  legalName: 'Your Company, LLC',
  location: 'Your City, State',
  accentColor: '#FF6B6B',              // Any hex color
  organizerName: 'Your Events',
  organizerInitials: 'YE',
  supabaseUrl: 'https://xxxxx.supabase.co',
  supabaseAnonKey: 'eyJ...',
  stripePublishableKey: 'pk_test_...',
};
```

### Step 4 — Vercel (hosting)

1. Push this folder to a new GitHub repository
2. Sign up at [vercel.com](https://vercel.com)
3. Click **Add New Project** → import your GitHub repo
4. Before deploying, click **Environment Variables** and add:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** your `sk_test_...` from Stripe
5. Click **Deploy**

Done. You'll get a free `xxx.vercel.app` URL.

---

## How to use the site

- **Public site:** `your-site.vercel.app/`
- **Seller login:** `your-site.vercel.app/login.html`
- **Dashboard (after login):** `your-site.vercel.app/dashboard.html`

From the dashboard you can create events, add ticket tiers, upload photos, and see real-time sales for each event.

## Custom domain

In Vercel → your project → **Settings** → **Domains** → add your domain. Update DNS records as Vercel instructs. Free.

## Going live with real payments

When ready:
1. Verify your business in Stripe (Dashboard → "Activate payments")
2. Get your **live** keys (`pk_live_...` and `sk_live_...`)
3. Update `config.js` with the new `pk_live_...` value
4. In Vercel → Environment Variables, replace `STRIPE_SECRET_KEY` with the new `sk_live_...`
5. Redeploy

---

## File structure

```
.
├── config.js                  ← Your branding & API keys
├── index.html                 ← Public landing page
├── event.html                 ← Event detail + checkout
├── dashboard.html             ← Seller dashboard
├── login.html                 ← Seller login
├── package.json               ← Server dependencies
├── vercel.json                ← Vercel config
└── api/
    ├── create-payment-intent.js  ← Server-side Stripe handler
    └── package.json
```

## Customizing the design

Most things are CSS variables at the top of each HTML file:

```css
:root {
  --bg: #0A0A0A;          /* Background */
  --text: #F5F2EE;        /* Main text */
  --accent: #FF6B6B;      /* Set automatically from config.js */
  /* ... */
}
```

To go deeper, the entire design is in plain HTML/CSS/JS. Edit anything you want.

## Support

This is a self-hosted template — you own and operate it. There's no hosted service behind it. If you break something, just check the browser console (right click → Inspect → Console) for errors. Most issues are missing or wrong API keys in `config.js` or the Vercel env variable.
