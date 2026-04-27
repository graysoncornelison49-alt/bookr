# Ticketing Site Setup — Read This First

Hey! You're about to set up your own ticketing website. The whole thing takes about 30-45 minutes. You'll have your own live site at the end where you can sell tickets, accept Stripe payments, and manage events from a private dashboard.

---

## How to use this guide

1. Open a new conversation with **Claude** (claude.ai)
2. **Upload the entire `template` folder** (or the zip file) so Claude can see all the code
3. **Paste this entire message into Claude as your first message:**

> "I'm setting up a ticketing website using this template. I've uploaded all the files. Please walk me through the setup step by step. I need to set up Supabase, Stripe, and Vercel, then customize my config.js file. Use the README.md inside the template as the source of truth. Go one step at a time and wait for me to confirm before moving on."

Claude will then guide you through everything below — but here's the overview so you know what you're getting into:

---

## What you need before starting

A computer, an email address, and about 30 minutes. That's it.

You'll create **three free accounts** during this process:
- **Supabase** — your database (where events, tickets, and orders are stored)
- **Stripe** — handles payments
- **Vercel** — hosts your website

These are the same exact tools the original site uses. Don't substitute anything — they all work together.

---

## The 4-step setup (Claude will walk you through each one)

### Step 1 — Supabase (database)
- Sign up at supabase.com
- Create a new project (takes 2 minutes to spin up)
- Run a block of SQL to create the events/tickets/orders tables (Claude will give you the exact SQL)
- Create a storage bucket called `event-photos` and make it public
- Create your seller login under Authentication → Users
- Copy your **Project URL** and **anon key** from Settings → API

### Step 2 — Stripe (payments)
- Sign up at stripe.com
- Stay in **test mode** for now (you can switch to real payments later)
- Go to Developers → API Keys
- Copy your **Publishable key** (starts with `pk_test_`)
- Copy your **Secret key** (starts with `sk_test_`) — keep this private

### Step 3 — Edit `config.js`
You'll fill in 9 fields:
- `name` — your site's name (e.g. "Pulse")
- `tagline` — short descriptive line for the footer
- `legalName` — your LLC or business name
- `location` — your city/state
- `accentColor` — any hex color you want (e.g. `#FF6B6B` for coral)
- `organizerName` — the name shown as the host on event pages
- `organizerInitials` — 2 letters for the host avatar
- `supabaseUrl` — paste from Supabase
- `supabaseAnonKey` — paste from Supabase
- `stripePublishableKey` — paste from Stripe (the `pk_test_...` one)

### Step 4 — Vercel (hosting)
- Push the template files to a new GitHub repo (Claude will help if you've never used Git)
- Sign up at vercel.com
- Import your GitHub repo
- **Important:** before deploying, add an environment variable named `STRIPE_SECRET_KEY` with your `sk_test_...` value
- Click Deploy — you'll get a free `.vercel.app` URL

---

## After it's deployed

You'll be able to visit:
- `your-site.vercel.app` — public homepage
- `your-site.vercel.app/login.html` — your private seller login
- `your-site.vercel.app/dashboard.html` — your dashboard (after login)

From the dashboard you can create events, set up ticket tiers, upload photos, and see real-time sales.

---

## Going live with real payments

When you're ready to take real money (not just test cards), Claude will walk you through:
1. Verifying your business identity in Stripe
2. Getting your **live** keys (`pk_live_` and `sk_live_`)
3. Updating `config.js` with the new publishable key
4. Updating the `STRIPE_SECRET_KEY` env variable in Vercel with the new secret key
5. Redeploying

---

## Things to know

- **You own everything.** Your Supabase, your Stripe, your domain, your customers' data. The template author has zero access.
- **It's free to start.** Supabase free tier handles thousands of orders. Vercel free hosting works for low-medium traffic. Stripe charges 2.9% + 30¢ per transaction (only when you make a sale).
- **You can customize the design however you want.** All the code is plain HTML/CSS/JS — no frameworks. Tell Claude what you want to change and it can edit the files directly.
- **Don't share your secret keys.** The Stripe `sk_` key and Supabase service keys should stay private. Only the `pk_` and anon keys are safe to expose in code.

---

## If you get stuck

Just paste the error message into Claude and ask. 90% of issues are typos in `config.js` or a missing environment variable in Vercel. Common ones:
- "Couldn't load events" → wrong Supabase URL or anon key in `config.js`
- "Could not load payment form" → wrong Stripe key, or `STRIPE_SECRET_KEY` not set in Vercel
- Dashboard won't log in → you didn't create a user in Supabase Authentication

You got this. Good luck.
