# Inventory & Order API

Backend Developer Technical Task submission for Artistonk Media Solutions.

## Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- bcryptjs password hashing
- Zod validation
- Helmet, CORS and rate limiting

## Features

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- JWT Bearer authentication
- Passwords hashed with bcrypt

### Products

All product endpoints require `Authorization: Bearer <token>`.

- `POST /api/products`
- `GET /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

GET `/api/products` supports:

- `search` - case-insensitive name search
- `category`
- `inStock=true|false`
- `page`
- `limit`

Example:

`GET /api/products?category=electronics&inStock=true&page=1&limit=10`

### Orders

All order endpoints require authentication.

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

When an order is created:

1. Product IDs are validated.
2. Requested quantities are merged if the same product appears more than once.
3. Stock is atomically decremented only when `stockQuantity >= requested quantity`.
4. Product name/price are snapshotted into the order.
5. Total amount is calculated server-side.
6. If order creation fails after stock reservation, the reserved stock is restored.

## Concurrency / last-item problem

The important race condition is avoided with MongoDB's atomic `findOneAndUpdate`:

```js
await Product.findOneAndUpdate(
  { _id: productId, stockQuantity: { $gte: quantity } },
  { $inc: { stockQuantity: -quantity } },
  { new: true }
);
```

The stock check and decrement happen as one database operation. If stock is `1` and two users request quantity `1` concurrently, only one operation can match the condition. The other gets no product and the order is rejected with `409 Conflict`.

For a larger production system, I would use a MongoDB transaction so reservations and order creation are committed atomically across multiple documents.

## Setup

### 1. Requirements

- Node.js 18+
- MongoDB 6+ (local MongoDB or MongoDB Atlas)

### 2. Install

```bash
npm install
```

### 3. Environment

Copy `.env.example` to `.env` and set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_order_api
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### 4. Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

`GET http://localhost:5000/health`

## Quick test flow

1. Register a user.
2. Login and copy the JWT.
3. In Postman, set Bearer Token for protected requests.
4. Create products.
5. List/filter products.
6. Create an order.
7. Check the product stock.
8. Get the logged-in user's orders.

A ready-to-import Postman collection is in `postman/Inventory-Order-API.postman_collection.json`.

## HTTP status codes

- `200` successful reads/updates/deletes
- `201` registration/product/order creation
- `400` validation or malformed IDs
- `401` missing/invalid authentication
- `404` resource not found
- `409` duplicate email or insufficient stock
- `500` unexpected server error

## AI usage

AI tools used: ChatGPT.

Used for:
- Initial project structure
- Boilerplate generation
- Reviewing validation and API design
- Reviewing the concurrent stock-update approach
- README/Postman documentation

The submitted code should be understood and tested before the interview because the task states that the next round may include explaining, debugging, or modifying the implementation.
