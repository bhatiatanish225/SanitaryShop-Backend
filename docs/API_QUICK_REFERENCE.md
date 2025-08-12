# Frontend Integration API Reference

## 🎯 Key Frontend Use Cases

### 1. Product Button Logic (Add to Cart vs Contact Us)

**API Call:**

```http
GET /api/products
```

**Response with isPipe field:**

```json
{
  "products": [
    {
      "id": 123,
      "name": "PVC Pipe 4 inch",
      "isPipe": true, // 👈 USE THIS for frontend logic
      "is_pipe": true, // Backward compatibility
      "price": 250,
      "category": { "name": "Pipes" }
    },
    {
      "id": 124,
      "name": "Water Tap",
      "isPipe": false, // 👈 Regular product - show "Add to Cart"
      "is_pipe": false,
      "price": 150
    }
  ]
}
```

**Frontend Implementation:**

```javascript
// Use isPipe to determine button type
products.forEach((product) => {
  if (product.isPipe) {
    showContactUsButton(product.id); // For pipe products
  } else {
    showAddToCartButton(product.id); // For regular products
  }
});
```

### 2. Dynamic Delivery Cost Calculation

**API Call for Pincode-based Delivery:**

```http
GET /api/addresses/delivery-price/pincode/160001
Authorization: Bearer <token>
```

**Response:**

```json
{
  "pincode": 160001,
  "deliveryPrice": 30, // 👈 USE THIS for delivery cost
  "found": true // true = specific price, false = default ₹100
}
```

**Frontend Implementation:**

```javascript
async function getDeliveryCharge(pincode) {
  const response = await fetch(
    `/api/addresses/delivery-price/pincode/${pincode}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json();

  // Always returns a delivery price (specific or default ₹100)
  return data.deliveryPrice;
}

// Usage in checkout
const deliveryCharge = await getDeliveryCharge(userPincode);
const totalAmount = cartSubtotal + deliveryCharge;
updateCheckoutTotal(totalAmount, deliveryCharge);
```

---

## 🛍️ Product APIs

### Get All Products with isPipe Field

```http
GET /api/products
GET /api/products?isPipe=true    # Only pipe products (Contact Us)
GET /api/products?isPipe=false   # Only regular products (Add to Cart)
```

## 📍 Delivery Pricing APIs

### Get Delivery Price by Pincode

```http
GET /api/addresses/delivery-price/pincode/160001
Authorization: Bearer <token>
```

**Response:**

```json
{
  "pincode": 160001,
  "deliveryPrice": 30,
  "found": true
}
```

### Get Delivery Price by Address

```http
GET /api/addresses/delivery-price/address/123
Authorization: Bearer <token>
```

**Response:**

```json
{
  "addressId": 123,
  "pincode": 160001,
  "deliveryPrice": 30
}
```

---

## 🏠 Address APIs

### Create Address with Delivery Pricing

```http
POST /api/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Home",
  "house": "123",
  "street": "Main Street",
  "city": "chandigarh",
  "pincode": "160001"
}
```

**Response:**

```json
{
  "message": "Address added",
  "address": {
    "id": 456,
    "label": "Home",
    "deliveryPrice": 30,
    "pincodeValue": 160001
  },
  "deliveryPrice": 30
}
```

---

## 👨‍💼 Admin APIs

### Get All Pincodes (Admin Only)

```http
GET /api/admin/pincodes?page=1&limit=20
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "pincodes": [
    {
      "id": 1,
      "code": 160001,
      "deliveryPrice": 30
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPincodes": 68,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Create/Update Pincode Pricing (Admin Only)

```http
POST /api/admin/pincode
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "pincode": "110001",
  "deliveryPrice": 75
}
```

**Response:**

```json
{
  "message": "Pincode delivery price updated successfully",
  "pincode": 110001,
  "deliveryPrice": 75
}
```

---

## 🔒 Authentication

### User Authentication Required:

- All address operations
- Delivery price lookups

### Admin Authentication Required:

- Pincode management
- User/order management

### Public Access:

- Product viewing and filtering
- Product search

---

## 💰 Delivery Pricing Logic

### Current Pricing Structure:

- **Chandigarh (160xxx)**: ₹30-95 (Premium zones)
- **Mohali (140xxx)**: ₹60-110 (Standard zones)
- **Panchkula (134xxx)**: ₹70-160 (Extended zones)
- **Unknown pincodes**: ₹100 (Default)

### Automatic Pincode Creation:

- New pincodes automatically created with ₹100 default
- Admin can update pricing for any pincode
- Pricing applies to all addresses in that pincode

---

## 🎯 Key Features

### Product Differentiation:

- `isPipe` field distinguishes pipe vs non-pipe products
- Backward compatible with `is_pipe` field
- Advanced filtering by product type

### Dynamic Delivery Pricing:

- Variable costs based on pincode
- Automatic calculation during address creation
- Admin control over pricing

### Enhanced Security:

- Multi-level authentication
- Role-based access control
- Protected admin functions

This reference covers all the new API endpoints and features implemented.
