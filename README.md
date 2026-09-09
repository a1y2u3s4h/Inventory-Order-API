# Inventory & Order API

Backend Developer Technical Task for Artistonk Media Solutions.

A REST API built using **Node.js + Express.js + MongoDB** where users can manage products and create orders.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Zod
- Helmet
- CORS
- express-rate-limit
- Postman

## 1. User Authentication

The API provides:

- User registration
- User login
- JWT-based authentication
- Secure password storage using bcrypt

### Register

`POST /api/auth/register`

Example request:

```json
{
  "name": "Ayush",
  "email": "ayush@example.com",
  "password": "Password@123"
}
```

### Login

`POST /api/auth/login`

Example request:

```json
{
  "email": "ayush@example.com",
  "password": "Password@123"
}
```

The login response returns a JWT token which is used for protected APIs.

```text
Authorization: Bearer <JWT_TOKEN>
```

## 2. Product APIs

A product contains:

- Name
- Description
- Price
- Stock quantity
- Category
- Created date

### Endpoints

- `POST /api/products` - Add a product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get one product
- `PATCH /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Example Product

```json
{
  "name": "Wireless Headphones",
  "description": "Bluetooth wireless headphones",
  "price": 2499,
  "stockQuantity": 20,
  "category": "electronics"
}
```

## 3. Search, Filtering & Pagination

`GET /api/products` supports:

- Search by product name
- Filter by category
- Filter by availability
- Pagination

Example:

```text
GET /api/products?category=electronics&inStock=true&page=1&limit=10
```

Search by product name:

```text
GET /api/products?search=headphones
```

Category filter:

```text
GET /api/products?category=electronics
```

Availability filter:

```text
GET /api/products?inStock=true
```

Pagination:

```text
GET /api/products?page=1&limit=10
```

## 4. Order APIs

A logged-in user can create an order.

### Endpoints

- `POST /api/orders` - Create an order
- `GET /api/orders` - Get logged-in user's orders
- `GET /api/orders/:id` - Get one order

An order contains:

- Products
- Quantity
- Total amount
- Order status
- Created date

### Create Order

`POST /api/orders`

Example request:

```json
{
  "items": [
    {
      "productId": "PRODUCT_ID",
      "quantity": 2
    }
  ]
}
```

When creating an order, the API checks:

- Product exists
- Requested quantity is available
- Stock is reduced correctly
- Invalid orders are handled properly

The total amount is calculated on the server.

## 5. Concurrent Last-Item Handling

If two users try to buy the last available item at the same time, the application uses an atomic MongoDB update:

```javascript
await Product.findOneAndUpdate(
  {
    _id: productId,
    stockQuantity: { $gte: quantity }
  },
  {
    $inc: { stockQuantity: -quantity }
  },
  {
    new: true
  }
);
```

The stock is updated only when enough stock exists. This prevents stock from becoming negative and ensures that both users cannot successfully purchase the same last item.

For a production system, MongoDB transactions could be used for stronger atomicity across multiple database operations.

## 6. Validation & Error Handling

- Zod request validation
- Proper HTTP status codes
- Centralized error handling
- Invalid MongoDB ID handling
- Authentication error handling
- Duplicate user handling
- Insufficient stock handling
- Invalid order handling

## 7. Basic Security

- Password hashing using bcrypt
- JWT authentication
- Protected APIs
- Helmet security headers
- CORS
- Rate limiting
- Environment variables for secrets and configuration
- Server-side order total calculation
- `.env` excluded from Git

## 8. Project Structure

```text
inventory-order-api/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── order.controller.js
│   │   └── product.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── order.routes.js
│   │   └── product.routes.js
│   ├── schemas/
│   │   ├── auth.schema.js
│   │   ├── order.schema.js
│   │   └── product.schema.js
│   └── utils/
│       ├── asyncHandler.js
│       └── token.js
├── postman/
│   └── Inventory-Order-API.postman_collection.json
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## 9. Setup

### Requirements

- Node.js
- npm
- MongoDB

### Install Dependencies

```bash
npm install
```

Create a `.env` file using `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_order_api
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### Run

```bash
npm run dev
```

The API runs locally at:

```text
http://localhost:5000
```

If port `5000` is already in use, change the `PORT` value in `.env`.

## 10. Health Check

`GET /health`

Example response:

```json
{
  "status": "OK"
}
```

## 11. Postman Collection

The Postman collection is included at:

`postman/Inventory-Order-API.postman_collection.json`

It can be imported into Postman to test the APIs.

Recommended testing flow:

1. Register
2. Login
3. Use the JWT token
4. Create a product
5. Get products
6. Test search, filtering and pagination
7. Get product by ID
8. Update product
9. Create an order
10. Get user's orders
11. Get order by ID
12. Test invalid order
13. Test insufficient stock
14. Test concurrent last-item handling

## 12. AI Usage

**AI Tool Used: ChatGPT**

ChatGPT was used for:

- Planning the project structure and API architecture
- Code and boilerplate assistance
- Reviewing REST API design and validation
- Reviewing authentication and security practices
- Reviewing the atomic stock-decrement approach for the concurrent last-item scenario
- Debugging implementation issues
- Preparing README and Postman documentation

AI usage was permitted by the technical task.

The code was tested locally, and I understand the implementation and its design decisions. I am prepared to explain, debug, and modify the implementation during the technical round.

## 13. Scope & Trade-offs

The implementation focuses on the requirements of the assignment rather than adding unnecessary complexity.

For a larger production system, possible improvements could include:

- MongoDB transactions for stronger multi-document atomicity
- Automated unit and integration tests
- Swagger/OpenAPI documentation
- Logging and monitoring
- Docker deployment
- CI/CD
- Redis caching
- Role-based authorization

These features were not required for the assignment.

## 14. Submission

The submission includes:

- GitHub repository
- Postman collection
- README with setup instructions
- `.env.example`

GitHub Repository:

https://github.com/a1y2u3s4h/Inventory-Order-API
