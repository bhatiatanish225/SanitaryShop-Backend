# 🧼 SanitaryShop Backend

Backend for the SanitaryShop project, built with **Node.js**, **Express.js**, **Prisma ORM**, and **PostgreSQL**. This backend handles user and admin functionalities for a sanitary product e-commerce platform.

---

## ✅ Completed Features

### 🔐 Authentication
- Email OTP verification
- User Registration with verification code
- User Login with JWT
- Get current user profile (`/me`)

### 🧑‍💼 Admin
- Add Category
- Add Product
- Update/Delete Product
- List All Categories
- Admin Login

### 🛒 User Side
- View all Products
- Filter/Search Products
- Add to Cart
- Remove from Cart
- View Cart
- Place Order
- View My Orders

---

## 🔜 Pending Features

- 💳 **Razorpay Payment Integration**
- 📦 **Order status updates (success, failed, shipped, etc.)**
- 🧾 **Invoice generation**
- 🔔 **Email notifications (on order placed or status updated)**
- ⭐ **Add Ratings & Reviews to Products**
- 🧮 **Auto-calculate tax during checkout**
- 🔐 **Forgot Password / Reset Password Flow**

---

## 📦 API Endpoints

### 🛂 Auth Routes
| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| POST   | `/api/auth/send-code`   | Send email OTP            |
| POST   | `/api/auth/register`    | Register with code        |
| POST   | `/api/auth/login`       | Login                     |
| GET    | `/api/auth/me`          | Get current user info     |

---

### 🧑‍💼 Admin Routes
| Method | Endpoint                | Description                  |
|--------|-------------------------|------------------------------|
| POST   | `/api/categories`       | Add category (admin only)    |
| POST   | `/api/products`         | Add product (admin only)     |
| PUT    | `/api/products/:id`     | Update product (admin only)  |
| DELETE | `/api/products/:id`     | Delete product (admin only)  |

---

### 🛍️ Product Routes
| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/api/products`         | Get all products         |
| GET    | `/api/products/:id`     | Get single product       |

---

### 📦 Category Routes
| Method | Endpoint                | Description            |
|--------|-------------------------|------------------------|
| GET    | `/api/categories`       | List all categories    |

---

### 🛒 Cart Routes
| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| POST   | `/cart/add`             | Add product to cart       |
| GET    | `/cart`                 | Get user’s cart items     |
| DELETE | `/cart/remove/:id`      | Remove item from cart     |

---

### 📦 Order Routes
| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| POST   | `/api/orders`           | Place order from cart     |
| GET    | `/api/orders/me`        | View my orders            |

---

## ⚙️ Tech Stack

- **Node.js + Express.js**
- **Prisma ORM**
- **PostgreSQL**
- **JWT Authentication**
- **Nodemailer (for email OTP)**
- **Razorpay (Coming Soon)**

---

## 📁 Project Structure

```
src/
│
├── controllers/
│   ├── auth.controller.js
│   ├── category.controller.js
│   ├── product.controller.js
│   ├── order.controller.js
│   ├── cart.controller.js
│   └── payment.controller.js (pending)
│
├── middleware/
│   └── auth.js
│
├── routes/
│   ├── auth.routes.js
│   ├── category.routes.js
│   ├── product.routes.js
│   ├── order.routes.js
│   ├── cart.routes.js
│   └── admin.routes.js
│
├── prisma/
│   └── schema.prisma
│
├── utils/
│   └── generateToken.js
│
└── index.js
```

---

## 🏁 Start Backend Server

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

---

## 🔑 Environment Variables (`.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/sanitaryshop
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🧪 For Testing

- Use Postman to send token as `Authorization: Bearer <token>` header for protected routes.
- Categories must be created before adding products.

---
