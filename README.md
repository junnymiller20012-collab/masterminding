# MasterMinding

The platform that turns a mentor's knowledge into a consistently selling course business — with built-in marketing tools, payments, and a storefront that converts.

## Project Structure

```
masterminding/
├── web/          # Next.js web app (mentor dashboard + public storefronts)
├── mobile/       # Expo React Native app (learner mobile experience)
├── convex/       # Convex backend (database, functions, file storage)
└── shared/       # Shared TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd masterminding
npm install
cd web && npm install
cd ../mobile && npm install
```

### 2. Set up environment variables

Copy the example env files and fill in your credentials:

```bash
cp web/.env.example web/.env.local
cp mobile/.env.example mobile/.env
```

You'll need accounts for:
- [Clerk](https://clerk.com) — authentication
- [Convex](https://convex.dev) — backend & database
- [Stripe](https://stripe.com) — payments

### 3. Initialize Convex

```bash
npx convex dev
```

This will prompt you to log in and create a project. It sets `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` automatically.

### 4. Run the web app

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run the mobile app

```bash
cd mobile
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Tech Stack

| Layer | Choice |
|---|---|
| Web Frontend | Next.js 15 (App Router) |
| Mobile | Expo / React Native |
| Backend | Convex |
| Database | Convex Database |
| Auth | Clerk |
| Payments | Stripe + Stripe Connect |
