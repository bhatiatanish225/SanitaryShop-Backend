# 🚀 Frontend API Documentation

## Overview

This document provides complete API documentation for the e-commerce backend. All routes are RESTful and return JSON responses. The backend supports 67,000+ products with pagination and full CRUD operations.

**Base URL:** `http://localhost:3000/api`

---

## 🔐 Authentication

Most routes require JWT authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### User Roles:

- **user** - Regular customers
- **admin** - Full access to admin routes

---

## 📋 Authentication Routes

### 1. Register User

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "city": "Chandigarh"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 2. Login User

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 3. Get Current User

```http
GET /api/auth/me
Authorization: Bearer TOKEN
```

**Response (200):**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "phone": "9876543210",
  "city": "Chandigarh"
}
```

### 4. Logout User

```http
POST /api/auth/logout
Authorization: Bearer TOKEN
```

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

---

## 🔑 Password Reset Routes

### 1. Request Password Reset

```http
POST /api/auth/forgot-password
```

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "message": "Password reset code sent to your email"
}
```

### 2. Verify Reset Code

```http
POST /api/auth/verify-forgot-password-code
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200):**

```json
{
  "message": "Code verified successfully",
  "resetToken": "a1b2c3d4e5f6...",
  "email": "john@example.com"
}
```

### 3. Reset Password

```http
POST /api/auth/reset-password
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "newPassword": "newPassword123",
  "resetToken": "a1b2c3d4e5f6..."
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

---

## 📁 Category Routes

### 1. Get All Categories

```http
GET /api/categories
```

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic items",
    "imageUrl": "https://example.com/electronics.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### 2. Get Category by ID

```http
GET /api/categories/:id
```

**Response (200):**

```json
{
  "id": 1,
  "name": "Electronics",
  "description": "Electronic items",
  "imageUrl": "https://example.com/electronics.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "products": [
    {
      "id": 1,
      "name": "Smartphone",
      "price": 25000,
      "imageUrl": "https://example.com/phone.jpg"
    }
  ]
}
```

### 3. Create Category (Admin Only)

```http
POST /api/categories
Authorization: Bearer ADMIN_TOKEN
```

**Request Body:**

```json
{
  "name": "New Category",
  "description": "Category description",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response (201):**

```json
{
  "message": "Category created successfully",
  "category": {
    "id": 2,
    "name": "New Category",
    "description": "Category description",
    "imageUrl": "https://example.com/image.jpg"
  }
}
```

### 4. Update Category (Admin Only)

```http
PUT /api/categories/:id
Authorization: Bearer ADMIN_TOKEN
```

**Request Body:**

```json
{
  "name": "Updated Category",
  "description": "Updated description"
}
```

### 5. Delete Category (Admin Only)

```http
DELETE /api/categories/:id
Authorization: Bearer ADMIN_TOKEN
```

---

## 🛍️ Product Routes

  ### 1. Get Products (with Pagination)

  ```http
  GET /api/products?page=1&limit=20&categoryId=1&search=phone&isFeatured=true
  Authorization: Bearer TOKEN
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `categoryId` - Filter by category ID
- `search` - Search in name, description, itemCode
- `isFeatured` - Filter featured products (true/false)
- `isBestseller` - Filter bestseller products (true/false)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order: asc/desc (default: desc)

**Response (200):**

```json
{
  "products": [
    {
      "id": 1,
      "itemCode": "PHONE-001",
      "name": "Smartphone XYZ",
      "description": "Latest smartphone",
      "imageUrl": "https://example.com/phone.jpg",
      "price": 25000,
      "originalPrice": 30000,
      "isFeatured": true,
      "isBestseller": false,
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "Electronics"
      },
      "brandGroup": "TechBrand",
      "availableStock": 50,
      "rating": 4.5,
      "reviewsCount": 128,
      "taxPercent": 18.0,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "sdp": 22000,
      "nrp": 24000,
      "mrp": 25000,
      "hsn": "8517",
      "sgst": 9.0,
      "cgst": 9.0,
      "igst": 18.0,
      "cess": 0.0,
      "image_url": "https://example.com/phone.jpg",
      "stock_quantity": 50,
      "original_price": 30000,
      "reviews_count": 128
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3354,
    "totalProducts": 67047,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "limit": 20
  }
}
```

### 2. Get Product by ID

```http
GET /api/products/:id
Authorization: Bearer TOKEN
```

**Response (200):**

```json
{
  "id": 1,
  "itemCode": "PHONE-001",
  "name": "Smartphone XYZ",
  "description": "Latest smartphone",
  "imageUrl": "https://example.com/phone.jpg",
  "price": 25000,
  "originalPrice": 30000,
  "isFeatured": true,
  "isBestseller": false,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Electronics"
  },
  "availableStock": 50,
  "rating": 4.5,
  "reviewsCount": 128,
  "taxPercent": 18.0,
  "sdp": 22000,
  "nrp": 24000,
  "mrp": 25000,
  "hsn": "8517",
  "sgst": 9.0,
  "cgst": 9.0,
  "igst": 18.0,
  "cess": 0.0,
  "image_url": "https://example.com/phone.jpg",
  "stock_quantity": 50,
  "original_price": 30000,
  "reviews_count": 128
}
```

### 3. Create Product (Admin Only)

```http
POST /api/products
Authorization: Bearer ADMIN_TOKEN
```

**Request Body:**

```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 1500,
  "originalPrice": 2000,
  "categoryId": 1,
  "availableStock": 100,
  "isFeatured": true,
  "isBestseller": false,
  "rating": 4.0,
  "reviewsCount": 0,
  "taxPercent": 18.0,
  "imageUrl": "https://example.com/product.jpg",
  "itemCode": "PROD-001",
  "brandGroup": "Brand Name",
  "sdp": 1400,
  "nrp": 1500,
  "mrp": 2000,
  "hsn": "1234",
  "sgst": 9.0,
  "cgst": 9.0,
  "igst": 18.0,
  "cess": 0.0
}
```

**Response (201):**

```json
{
  "id": 67108,
  "itemCode": "PROD-001",
  "name": "New Product",
  "price": 1500,
  "image_url": "https://example.com/product.jpg",
  "stock_quantity": 100,
  "original_price": 2000,
  "reviews_count": 0
}
```

### 4. Update Product (Admin Only)

```http
PUT /api/products/:id
Authorization: Bearer ADMIN_TOKEN
```

**Request Body:** (Same as create, all fields optional)

### 5. Delete Product (Admin Only)

```http
DELETE /api/products/:id
Authorization: Bearer ADMIN_TOKEN
```

---

## 🛒 Cart Routes

### 1. Add to Cart

```http
POST /api/cart
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (201):**

```json
{
  "id": 1,
  "userId": 1,
  "productId": 1,
  "quantity": 2,
  "product": {
    "id": 1,
    "name": "Smartphone XYZ",
    "price": 25000,
    "imageUrl": "https://example.com/phone.jpg"
  }
}
```

### 2. Get Cart Items

```http
GET /api/cart
Authorization: Bearer TOKEN
```

**Response (200):**

```json
[
  {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "product": {
      "id": 1,
      "name": "Smartphone XYZ",
      "price": 25000,
      "imageUrl": "https://example.com/phone.jpg"
    }
  }
]
```

### 3. Update Cart Item

```http
PUT /api/cart/:id
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "quantity": 3
}
```

### 4. Remove from Cart

```http
DELETE /api/cart/:id
Authorization: Bearer TOKEN
```

---

## 🏠 Address Routes

### 1. Add Address

```http
POST /api/addresses
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "label": "Home",
  "house": "123, Block A",
  "street": "Main Street",
  "city": "Chandigarh",
  "landmark": "Near Park",
  "address1": "Additional address info"
}
```

**Response (201):**

```json
{
  "message": "Address added",
  "address": {
    "id": 1,
    "userId": 1,
    "label": "Home",
    "house": "123, Block A",
    "street": "Main Street",
    "city": "Chandigarh",
    "landmark": "Near Park",
    "address1": "Additional address info"
  }
}
```

### 2. Get User Addresses

```http
GET /api/addresses
Authorization: Bearer TOKEN
```

**Response (200):**

```json
{
  "addresses": [
    {
      "id": 1,
      "userId": 1,
      "label": "Home",
      "house": "123, Block A",
      "street": "Main Street",
      "city": "Chandigarh",
      "landmark": "Near Park",
      "address1": "Additional address info"
    }
  ]
}
```

### 3. Get Address by ID

```http
GET /api/addresses/:id
Authorization: Bearer TOKEN
```

### 4. Update Address

```http
PUT /api/addresses/:id
Authorization: Bearer TOKEN
```

### 5. Delete Address

```http
DELETE /api/addresses/:id
Authorization: Bearer TOKEN
```

---

## 📋 Order Routes

### 1. Create Order

```http
POST /api/orders
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 25000
    }
  ],
  "totalAmount": 50000,
  "paymentMethod": "cod",
  "addressId": 1
}
```

**Response (201):**

```json
{
  "id": 1,
  "userId": 1,
  "totalAmount": 50000,
  "paymentMethod": "cod",
  "status": "pending",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": 25000
    }
  ]
}
```

### 2. Get User Orders

```http
GET /api/orders
Authorization: Bearer TOKEN
```

**Response (200):**

```json
[
  {
    "id": 1,
    "userId": 1,
    "totalAmount": 50000,
    "paymentMethod": "cod",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "price": 25000,
        "product": {
          "id": 1,
          "name": "Smartphone XYZ"
        }
      }
    ]
  }
]
```

### 3. Get Order by ID

```http
GET /api/orders/:id
Authorization: Bearer TOKEN
```

---

## 👨‍💼 Admin Routes

### 1. Dashboard Stats

```http
GET /api/admin/dashboard/stats
Authorization: Bearer ADMIN_TOKEN
```

**Response (200):**

```json
{
  "totalUsers": 156,
  "totalOrders": 45,
  "totalProducts": 67047,
  "totalRevenue": 125000
}
```

### 2. Get All Orders (Admin)

```http
GET /api/admin/orders?page=1&limit=20
Authorization: Bearer ADMIN_TOKEN
```

**Response (200):**

```json
{
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "totalAmount": 50000,
      "status": "pending",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "items": [
        {
          "id": 1,
          "productId": 1,
          "quantity": 2,
          "price": 25000,
          "product": {
            "id": 1,
            "name": "Smartphone XYZ"
          }
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalOrders": 45,
    "limit": 20
  }
}
```

### 3. Get All Users (Admin)

```http
GET /api/admin/users?page=1&limit=50
Authorization: Bearer ADMIN_TOKEN
```

**Response (200):**

```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isBlocked": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 4,
    "totalUsers": 156,
    "limit": 50
  }
}
```

### 4. Update Order Status (Admin)

```http
PUT /api/orders/:id/status
Authorization: Bearer ADMIN_TOKEN
```

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Status Options:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

---

## 💳 Payment Routes

### 1. Create Payment

```http
POST /api/payments/create
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "orderId": 1,
  "amount": 50000
}
```

### 2. Verify Payment

```http
POST /api/payments/verify
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "orderId": 1,
  "paymentId": "pay_123456",
  "signature": "signature_string"
}
```

---

## 🔍 Search & Filter Examples

### Product Search Examples:

```javascript
// Get featured products
fetch("/api/products?isFeatured=true&limit=10");

// Search by keyword
fetch("/api/products?search=smartphone&limit=20");

// Filter by category
fetch("/api/products?categoryId=1&page=2&limit=15");

// Combined filters
fetch(
  "/api/products?categoryId=1&isFeatured=true&search=phone&sortBy=price&sortOrder=asc"
);
```

### Pagination Examples:

```javascript
// First page
fetch("/api/products?page=1&limit=20");

// Navigate pages
fetch("/api/products?page=5&limit=20");

// Large page size (max 100)
fetch("/api/products?limit=100");
```

---

## 🚨 Error Handling

### Common Error Response Format:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Examples:

```javascript
// Handle errors
fetch("/api/products")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const products = data.products || data; // Handle both formats
    console.log("Products:", products);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

---

## 💡 Frontend Integration Tips

### 1. Authentication Setup:

```javascript
// Store token
localStorage.setItem("token", response.data.token);

// Add to all requests
const token = localStorage.getItem("token");
fetch("/api/products", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### 2. Pagination Component:

```javascript
const [products, setProducts] = useState([]);
const [pagination, setPagination] = useState({});

const fetchProducts = async (page = 1) => {
  const response = await fetch(`/api/products?page=${page}&limit=20`);
  const data = await response.json();

  setProducts(data.products);
  setPagination(data.pagination);
};
```

### 3. Search & Filter:

```javascript
const [filters, setFilters] = useState({
  search: "",
  categoryId: "",
  isFeatured: false,
});

const buildQuery = () => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.isFeatured) params.append("isFeatured", "true");
  params.append("limit", "20");

  return params.toString();
};

const fetchFilteredProducts = async () => {
  const query = buildQuery();
  const response = await fetch(`/api/products?${query}`);
  const data = await response.json();
  setProducts(data.products);
};
```

---

## 📊 Database Information

- **Total Products:** 67,047+ with full CSV data
- **Categories:** 14 active categories
- **Pagination:** Recommended 20-50 items per page
- **CSV Fields Available:** itemCode, sdp, nrp, mrp, hsn, sgst, cgst, igst, cess
- **Performance:** Optimized for large datasets

---

**Last Updated:** August 4, 2025
**API Version:** 1.0
**Environment:** Development (localhost:3000)
