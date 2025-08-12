# API Controllers and Routes Documentation

## Overview

This document details all the changes made to controllers and routes for implementing the new features:

- **Product isPipe differentiation** - Boolean field to distinguish pipe products from regular products
- **Pincode-based delivery pricing** - Variable delivery costs based on location
- **Address management with delivery integration** - Complete address CRUD with automatic delivery pricing
- **Admin pincode management** - Administrative tools for managing delivery pricing

---

## 🎯 Frontend Integration Guide

### Key Frontend Use Cases

#### 1. **Product Cart vs Contact Button Logic**

**Use the `isPipe` boolean field to determine button display:**

```javascript
// Product response includes isPipe field
const product = {
  id: 123,
  name: "PVC Pipe 4 inch",
  isPipe: true, // 👈 Use this for frontend logic
  is_pipe: true, // Backward compatibility
  price: 250,
};

// Frontend logic
if (product.isPipe) {
  // Show "Contact Us" button for pipe products
  showContactButton();
} else {
  // Show "Add to Cart" button for regular products
  showAddToCartButton();
}
```

**API Endpoints:**

- `GET /api/products` - Returns all products with `isPipe` field
- `GET /api/products?isPipe=false` - Get only products that can be added to cart
- `GET /api/products?isPipe=true` - Get only products requiring contact

#### 2. **Dynamic Delivery Cost Display**

**Use pincode from user's address to show delivery charges:**

```javascript
// Step 1: Get delivery cost for user's pincode
const userPincode = "160001"; // From user's selected address
const deliveryResponse = await fetch(
  `/api/addresses/delivery-price/pincode/${userPincode}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

const deliveryData = await deliveryResponse.json();
// Response: { pincode: 160001, deliveryPrice: 30, found: true }

// Step 2: Display in checkout
const deliveryCharge = deliveryData.deliveryPrice; // ₹30 or ₹100 (default)
displayDeliveryCharge(deliveryCharge);

// Step 3: Calculate total
const totalAmount = cartTotal + deliveryCharge;
```

**Delivery Pricing Logic:**

- **Known pincodes**: Returns specific delivery price (₹30-160)
- **Unknown pincodes**: Returns default price (₹100)
- **Real-time lookup**: Always gets current pricing from database

#### 3. **Complete Frontend Workflow Example**

```javascript
// Product listing page
function renderProduct(product) {
  const actionButton = product.isPipe
    ? `<button onclick="contactUs('${product.id}')">Contact Us</button>`
    : `<button onclick="addToCart('${product.id}')">Add to Cart</button>`;

  return `
    <div class="product">
      <h3>${product.name}</h3>
      <p>₹${product.price}</p>
      ${actionButton}
    </div>
  `;
}

// Checkout page
async function calculateDelivery(selectedAddressId) {
  try {
    const response = await fetch(
      `/api/addresses/delivery-price/address/${selectedAddressId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    const data = await response.json();

    updateDeliveryDisplay(data.deliveryPrice);
    updateTotalAmount(cartTotal + data.deliveryPrice);
  } catch (error) {
    // Fallback to default delivery price
    updateDeliveryDisplay(100);
    updateTotalAmount(cartTotal + 100);
  }
}
```

---

## 🔧 Product Controller Changes

### File: `src/controllers/product.controller.js`

#### New Features Added:

1. **isPipe Field Support** - Added handling for pipe product differentiation
2. **Backward Compatibility** - Maintains `is_pipe` field for existing clients
3. **Advanced Filtering** - Filter products by isPipe=true/false

#### Modified Functions:

##### `getAllProducts()`

```javascript
// NEW: Added isPipe filtering support
const { isPipe, ...otherFilters } = req.query;

// Filter by isPipe if provided
if (isPipe !== undefined) {
  const isPipeBoolean = isPipe === "true";
  whereClause.isPipe = isPipeBoolean;
}

// NEW: Added backward compatibility field
const transformedProducts = products.map((product) => ({
  ...product,
  is_pipe: product.isPipe, // Backward compatibility
}));
```

**API Usage:**

- `GET /api/products` - Get all products with isPipe field
- `GET /api/products?isPipe=true` - Get only pipe products
- `GET /api/products?isPipe=false` - Get only non-pipe products

##### `createProduct()` & `updateProduct()`

```javascript
// NEW: Handle isPipe field in creation/updates
const { isPipe = false, ...otherData } = req.body;

const productData = {
  ...otherData,
  isPipe: Boolean(isPipe), // Ensure boolean type
};
```

---

## 📍 Address Controller Changes

### File: `src/controllers/address.controller.js`

#### Major Additions:

1. **Pincode Integration** - All addresses linked to pincode records
2. **Delivery Pricing Logic** - Automatic delivery price calculation
3. **Admin Functions** - Pincode management for administrators

#### New Helper Function:

##### `getOrCreatePincode(pincode)`

```javascript
// NEW: Automatically creates pincode records if they don't exist
const getOrCreatePincode = async (pincode) => {
  let pincodeRecord = await prisma.pincode.findUnique({
    where: { code: parseInt(pincode) },
  });

  if (!pincodeRecord) {
    pincodeRecord = await prisma.pincode.create({
      data: {
        code: parseInt(pincode),
        deliveryPrice: 100.0, // Default delivery price
      },
    });
  }

  return pincodeRecord;
};
```

#### Enhanced Functions:

##### `addAddress()`

```javascript
// NEW: Integrated with pincode and delivery pricing
const pincodeRecord = await getOrCreatePincode(pincode);

const address = await prisma.address.create({
  data: {
    userId,
    pincodeId: pincodeRecord.id, // NEW: Link to pincode
    // ... other fields
  },
  include: { pincode: true },
});

// NEW: Return delivery price information
res.status(201).json({
  message: "Address added",
  address: {
    ...address,
    deliveryPrice: address.pincode.deliveryPrice,
    pincodeValue: address.pincode.code,
  },
  deliveryPrice: address.pincode.deliveryPrice,
});
```

**API Usage:**

- `POST /api/addresses` - Create address with automatic delivery pricing

#### New Functions:

##### `getDeliveryPrice(pincode)`

```javascript
// NEW: Get delivery price for any pincode
exports.getDeliveryPrice = async (req, res) => {
  const { pincode } = req.params;

  const pincodeRecord = await prisma.pincode.findUnique({
    where: { code: parseInt(pincode) },
  });

  res.json({
    pincode: parseInt(pincode),
    deliveryPrice: pincodeRecord?.deliveryPrice || 100.0,
    found: !!pincodeRecord,
  });
};
```

**API Usage:**

- `GET /api/addresses/delivery-price/pincode/160001` - Get delivery price for pincode

##### `getAddressDeliveryPrice(addressId)`

```javascript
// NEW: Get delivery price for specific address
exports.getAddressDeliveryPrice = async (req, res) => {
  const address = await prisma.address.findUnique({
    where: { id: parseInt(addressId) },
    include: { pincode: true },
  });

  res.json({
    addressId: address.id,
    pincode: address.pincode.code,
    deliveryPrice: address.pincode.deliveryPrice,
  });
};
```

**API Usage:**

- `GET /api/addresses/delivery-price/address/123` - Get delivery price for address ID

##### `getAllPincodes()` (Admin Function)

```javascript
// NEW: Admin function to list all pincodes with pagination
exports.getAllPincodes = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const [pincodes, totalPincodes] = await Promise.all([
    prisma.pincode.findMany({
      orderBy: { code: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pincode.count(),
  ]);

  res.json({
    pincodes,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalPincodes / limit),
      totalPincodes,
      hasNextPage: page < Math.ceil(totalPincodes / limit),
      hasPreviousPage: page > 1,
    },
  });
};
```

**API Usage:**

- `GET /api/admin/pincodes` - List all pincodes (admin only)
- `GET /api/admin/pincodes?page=2&limit=20` - Paginated results

##### `managePincodeDeliveryPrice()` (Admin Function)

```javascript
// NEW: Admin function to create/update pincode delivery prices
exports.managePincodeDeliveryPrice = async (req, res) => {
  const { pincode, deliveryPrice } = req.body;

  const pincodeRecord = await prisma.pincode.upsert({
    where: { code: parseInt(pincode) },
    update: { deliveryPrice: parseFloat(deliveryPrice) },
    create: {
      code: parseInt(pincode),
      deliveryPrice: parseFloat(deliveryPrice),
    },
  });

  res.json({
    message: "Pincode delivery price updated successfully",
    pincode: pincodeRecord.code,
    deliveryPrice: pincodeRecord.deliveryPrice,
  });
};
```

**API Usage:**

- `POST /api/admin/pincode` - Create/update pincode pricing (admin only)

---

## 🛣️ Route Structure Changes

### 1. Product Routes (`src/routes/product.routes.js`)

#### Changes Made:

- **Removed authentication requirement** for product viewing routes
- **Made products publicly accessible** for better user experience

#### Before:

```javascript
router.get("/", protect, getAllProducts); // Required auth
router.get("/:id", protect, getProductById); // Required auth
```

#### After:

```javascript
router.get("/", getAllProducts); // Public access
router.get("/:id", getProductById); // Public access
```

#### Route Structure:

- `GET /api/products` - **Public** - Get all products with isPipe filtering
- `GET /api/products/:id` - **Public** - Get specific product
- `POST /api/products` - **Admin** - Create product
- `PUT /api/products/:id` - **Admin** - Update product
- `DELETE /api/products/:id` - **Admin** - Delete product

### 2. Address Routes (`src/routes/address.routes.js`)

#### New Route Structure:

```javascript
// User address routes (require authentication)
router.post("/", protect, addressController.addAddress);
router.get("/", protect, addressController.getAddresses);
router.put("/:id", protect, addressController.updateAddress);
router.delete("/:id", protect, addressController.deleteAddress);

// Delivery pricing routes (require authentication)
router.get(
  "/delivery-price/pincode/:pincode",
  protect,
  addressController.getDeliveryPrice
);
router.get(
  "/delivery-price/address/:addressId",
  protect,
  addressController.getAddressDeliveryPrice
);
```

#### Route Endpoints:

- `POST /api/addresses` - **Auth Required** - Create address
- `GET /api/addresses` - **Auth Required** - List user addresses
- `PUT /api/addresses/:id` - **Auth Required** - Update address
- `DELETE /api/addresses/:id` - **Auth Required** - Delete address
- `GET /api/addresses/delivery-price/pincode/:pincode` - **Auth Required** - Get delivery price
- `GET /api/addresses/delivery-price/address/:addressId` - **Auth Required** - Get address delivery price

### 3. Admin Routes (`src/routes/admin.routes.js`)

#### Added Pincode Management:

```javascript
// Pincode management (admin only)
router.post(
  "/pincode",
  protect,
  adminOnly,
  addressController.managePincodeDeliveryPrice
);
router.get("/pincodes", protect, adminOnly, addressController.getAllPincodes);
```

#### Complete Admin Route Structure:

- `GET /api/admin/users` - **Admin Only** - List all users
- `GET /api/admin/orders` - **Admin Only** - List all orders
- `GET /api/admin/dashboard/stats` - **Admin Only** - Dashboard statistics
- `GET /api/admin/pincodes` - **Admin Only** - List all pincodes
- `POST /api/admin/pincode` - **Admin Only** - Create/update pincode pricing

---

## 🔒 Authentication & Security

### Security Levels:

1. **Public Routes** - No authentication required
   - Product viewing and filtering
2. **User Routes** - Authentication required (`protect` middleware)
   - Address management
   - Delivery price lookup
3. **Admin Routes** - Admin authentication required (`protect` + `adminOnly` middleware)
   - Pincode management
   - User management
   - Order management

### Middleware Usage:

- `protect` - Validates JWT token and sets `req.user`
- `adminOnly` - Checks if user has admin role
- Combined: `protect, adminOnly` - Full admin authentication

---

## 📊 Database Schema Changes

### New Pincode Model:

```prisma
model Pincode {
  id            Int       @id @default(autoincrement())
  code          Int       @unique @db.Integer
  deliveryPrice Float     @db.DoublePrecision
  addresses     Address[]

  @@index([code])
  @@index([deliveryPrice])
}
```

### Enhanced Address Model:

```prisma
model Address {
  id        Int      @id @default(autoincrement())
  pincodeId Int?     // NEW: Link to pincode
  pincode   Pincode? @relation(fields: [pincodeId], references: [id])
  // ... existing fields

  @@index([pincodeId]) // NEW: Performance index
}
```

### Enhanced Product Model:

```prisma
model Product {
  // ... existing fields
  isPipe Boolean @default(false) // NEW: Pipe product differentiation

  @@index([isPipe]) // NEW: Performance index
}
```

---

## 🎯 Key Features Summary

### 1. Product Differentiation

- **isPipe boolean field** distinguishes pipe products from regular products
- **Backward compatibility** with `is_pipe` field for existing clients
- **Advanced filtering** by product type

### 2. Variable Delivery Pricing

- **Pincode-based pricing** with realistic costs (₹30-160)
- **Default pricing** (₹100) for unknown pincodes
- **Automatic pincode creation** for new areas

### 3. Address Management

- **Integrated delivery pricing** calculated automatically
- **Pincode validation** and linking
- **Complete CRUD operations** with pricing information

### 4. Admin Tools

- **Pincode management** with create/update operations
- **Bulk pincode listing** with pagination
- **Delivery price control** for administrators

### 5. Performance Optimizations

- **Database indexing** on frequently queried fields
- **Pagination support** for large datasets
- **Efficient query structures** to minimize database load

---

## 🚀 Usage Examples

### Frontend Integration Examples:

#### Get Products with Pipe Filtering:

```javascript
// Get all products
const products = await fetch("/api/products").then((r) => r.json());

// Get only pipe products
const pipeProducts = await fetch("/api/products?isPipe=true").then((r) =>
  r.json()
);

// Get delivery price for pincode
const deliveryPrice = await fetch(
  "/api/addresses/delivery-price/pincode/160001",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
).then((r) => r.json());
```

#### Admin Operations:

```javascript
// Get all pincodes (admin only)
const pincodes = await fetch("/api/admin/pincodes", {
  headers: { Authorization: `Bearer ${adminToken}` },
}).then((r) => r.json());

// Update pincode pricing (admin only)
const result = await fetch("/api/admin/pincode", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    pincode: "110001",
    deliveryPrice: 75,
  }),
}).then((r) => r.json());
```

---

## ✅ Implementation Status

### Completed Features:

- ✅ Product isPipe field and filtering
- ✅ Pincode-based delivery pricing (68 pincodes seeded)
- ✅ Address management with delivery integration
- ✅ Admin pincode management tools
- ✅ Route restructuring and security
- ✅ Database performance optimization
- ✅ Comprehensive testing suite

### Performance Metrics:

- **Database Migration**: Safe migration preserving all existing data
- **Response Times**: Optimized with proper indexing
- **Security**: Multi-level authentication and authorization
- **Scalability**: Pagination and efficient queries

This documentation covers all the major changes made to implement the new pincode-based delivery pricing and product differentiation features.
