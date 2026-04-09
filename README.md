# Full-Stack E-Commerce Platform

A stronger portfolio version of the original starter. This build includes:

- React frontend built with Vite
- Express backend
- PostgreSQL with Prisma ORM
- JWT authentication
- Cart, checkout, orders, and admin workflows
- Stripe payment intent flow
- Role-based access control
- Product editing
- Local image upload support for admin users
- Input validation on key routes
- Docker and Render deployment files
- Seed script with demo admin account

## Tech Stack

### Frontend
- React
- React Router
- Axios
- Stripe.js

### Backend
- Node.js
- Express
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Multer
- Stripe

## Features

### Customer
- Register and log in
- Browse products with search and category filter
- View product details
- Add items to cart
- Update quantities
- Checkout with Stripe
- View order history

### Admin
- Create, update, and delete products
- Upload local images for products
- View all orders
- Update order status

## Project Structure

```text
ecommerce-platform/
  client/
  server/
  docker-compose.yml
  render.yaml
```

## Local Setup

## 1. Backend

Create a PostgreSQL database, then in `server/.env` add:

```env
PORT=5001
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="replace-me"
STRIPE_SECRET_KEY="sk_test_replace_me"
STRIPE_WEBHOOK_SECRET="whsec_replace_me"
CLIENT_URL="http://localhost:5173"
UPLOADS_DIR="uploads"
SERVER_PUBLIC_URL="http://localhost:5001"
```

Install dependencies and run migrations:

```bash
cd server
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

## 2. Frontend

In `client/.env` add:

```env
VITE_API_URL="http://localhost:5001/api"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_replace_me"
```

Install and run:

```bash
cd client
npm install
npm run dev
```

## Demo Admin Account

The seed script creates this admin account:

```text
Email: admin@shopstack.dev
Password: Admin123!
```

## Docker Setup

From the project root:

```bash
docker compose up --build
```

This starts:
- PostgreSQL on port `5432`
- API on port `5001`
- Frontend on port `5173`
