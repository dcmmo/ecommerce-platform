# ShopStack — Full-Stack E-Commerce Platform

A production-deployed e-commerce application built with React, Express, PostgreSQL, and Stripe. Supports customer shopping flows, Stripe payment processing, order history, and a full admin dashboard.

**Live demo:** [ecommerce-platform-g9xr.onrender.com](https://ecommerce-platform-g9xr.onrender.com)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 6 |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL 16, Prisma ORM 6 |
| Auth | JWT (7-day expiry), bcrypt |
| Payments | Stripe Payment Intents |
| File Uploads | Multer |
| Deployment | Render (backend + DB), Render Static Site (frontend) |
| Local Dev | Docker Compose |

## Features

**Customer**
- Register and log in with JWT-based auth
- Browse products with real-time search and category filtering
- Add to cart, update quantities, remove items
- Checkout with Stripe (card payments)
- View full order history

**Admin**
- Create, update, and delete products
- Upload product images
- View all orders and update order status

## Architecture

```
Browser (React/Vite)
       │
       │  HTTPS  
       ▼
  Express API (Node.js)
       │
       ├── PostgreSQL (via Prisma)
       └── Stripe API
```

The checkout flow uses Stripe Payment Intents: the server creates an intent with the amount computed from the database (never trusted from the client), the client confirms payment with the card element, then the server verifies the payment status before creating the order atomically with `prisma.$transaction`.

## Project Structure

```
ecommerce-platform/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # Navbar, ProtectedRoute, etc.
│       ├── context/         # AuthContext, CartContext
│       ├── pages/           # One component per route
│       └── services/        # Axios instance + interceptors
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # DB schema
│   │   └── seed.js          # Demo data + admin account
│   └── src/
│       ├── middleware/       # auth.js (requireAuth, requireAdmin)
│       ├── routes/           # auth, products, cart, orders, payments, uploads, webhooks
│       └── utils/            # prisma client, validators
├── docker-compose.yml
└── render.yaml
```

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or use Docker below)

### 1. Backend

Create `server/.env`:

```env
PORT=5001
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-secret-here"
STRIPE_SECRET_KEY="sk_test_replace_me"
STRIPE_WEBHOOK_SECRET="whsec_replace_me"
CLIENT_URL="http://localhost:5173"
UPLOADS_DIR="uploads"
SERVER_PUBLIC_URL="http://localhost:5001"
```

```bash
cd server
npm install
npx prisma db push
npm run seed
npm run dev
```

### 2. Frontend

Create `client/.env`:

```env
VITE_API_URL="http://localhost:5001/api"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_replace_me"
```

```bash
cd client
npm install
npm run dev
```

### Docker (all-in-one)

```bash
docker compose up --build
```

Starts PostgreSQL on `5433`, the API on `5001`, and the frontend on `5173`.

## Demo Credentials

```
Email:    admin@shopstack.dev
Password: Admin123!
```

The seed script also loads a set of sample products.

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Get JWT |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/products` | — | List products (search, category filter) |
| GET | `/api/products/categories` | — | List categories |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/cart` | User | Get cart |
| POST | `/api/cart` | User | Add to cart |
| PUT | `/api/cart/:id` | User | Update quantity |
| DELETE | `/api/cart/:id` | User | Remove item |
| POST | `/api/payments/create-intent` | User | Create Stripe Payment Intent |
| POST | `/api/orders` | User | Confirm order after payment |
| GET | `/api/orders` | User | Order history |
| GET | `/api/orders/all` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/uploads/image` | Admin | Upload product image |
| POST | `/api/webhooks/stripe` | — | Stripe webhook handler |
