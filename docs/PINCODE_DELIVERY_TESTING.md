# Pincode-Based Delivery Pricing - Test Cases & API Guide

## 🎯 **Overview**

The system now supports variable delivery costs based on pincode. If a pincode is not in the database, it returns a default delivery price of ₹100.

## 🌱 **Seeding Test Data**

To populate the database with test pincode data:

```bash
# Run the seed script
node seedPincodeData.js
```

### Test Data Breakdown:

- **Chandigarh (160001-160047)**: ₹30-95 (Premium zones)
- **Mohali (140301-140507)**: ₹60-110 (Standard zones)
- **Panchkula (134101-134203)**: ₹70-160 (Extended zones)
- **Edge Cases**: ₹0-1000 (Special test scenarios)

## 🧪 **Test Cases**

### 1. **Create Address with Known Pincode**

```bash
POST /addresses
{
  "label": "Home",
  "house": "123",
  "street": "Main Street",
  "city": "chandigarh",
  "pincode": "160001"  // Premium zone - ₹30
}

Expected Response:
{
  "message": "Address added",
  "address": { ... },
  "deliveryPrice": 30.0
}
```

### 2. **Create Address with Unknown Pincode**

```bash
POST /addresses
{
  "label": "Office",
  "house": "456",
  "street": "New Area",
  "city": "mohali",
  "pincode": "999888"  // Unknown pincode
}

Expected Response:
{
  "message": "Address added",
  "address": { ... },
  "deliveryPrice": 100.0  // Default price
}
```

### 3. **Get Delivery Price for Known Pincode**

```bash
GET /addresses/delivery-price/pincode/160001

Expected Response:
{
  "pincode": 160001,
  "deliveryPrice": 30.0
}
```

### 4. **Get Delivery Price for Unknown Pincode**

```bash
GET /addresses/delivery-price/pincode/999777

Expected Response:
{
  "pincode": 999777,
  "deliveryPrice": 100.0
}
```

### 5. **Get User's Address with Delivery Price**

```bash
GET /addresses

Expected Response:
{
  "addresses": [
    {
      "id": 1,
      "label": "Home",
      "house": "123",
      "street": "Main Street",
      "city": "chandigarh",
      "pincodeId": 1,
      "pincode": { "code": 160001, "deliveryPrice": 30.0 },
      "deliveryPrice": 30.0,
      "pincodeValue": 160001
    }
  ]
}
```

### 6. **Product Filtering by isPipe**

```bash
GET /products?isPipe=true

Returns all pipe products with is_pipe: true
```

### 7. **Admin: Set Custom Delivery Price**

```bash
POST /addresses/admin/pincode
{
  "pincode": "160050",
  "deliveryPrice": 45.0
}

Expected Response:
{
  "message": "Pincode delivery price updated successfully",
  "pincode": 160050,
  "deliveryPrice": 45.0
}
```

## 🔧 **Edge Cases to Test**

### 1. **Free Delivery Zone**

- Pincode: `111111` → ₹0 delivery

### 2. **Premium High-Cost Zone**

- Pincode: `999999` → ₹500 delivery

### 3. **Ultra High-Cost Zone**

- Pincode: `1` → ₹1000 delivery

### 4. **Budget Zone**

- Pincode: `123456` → ₹25 delivery

### 5. **Missing Pincode Field**

```bash
POST /addresses
{
  "label": "Home",
  "house": "123",
  "street": "Main Street",
  "city": "chandigarh"
  // Missing pincode field
}

Expected Response: 400 Bad Request
{
  "message": "House, street, city, label, and pincode are required"
}
```

## 📊 **Realistic Test Scenarios**

### Scenario 1: **E-commerce Checkout Flow**

1. User selects address with pincode `160001`
2. System calculates delivery cost: ₹30
3. Total order = Product price + ₹30 delivery

### Scenario 2: **New Area Expansion**

1. User enters new pincode `198765`
2. System creates pincode with default ₹100 delivery
3. Admin later updates to actual delivery cost

### Scenario 3: **Product Type Based Logic**

1. User orders pipe products (`isPipe: true`)
2. System can apply different logic for heavy/bulky items
3. Delivery cost varies by pincode + product type

## 🛠 **Admin Functions**

### View All Pincodes

```bash
GET /addresses/admin/pincodes?page=1&limit=50
```

### Update Delivery Price

```bash
POST /addresses/admin/pincode
{
  "pincode": "160001",
  "deliveryPrice": 35.0
}
```

## ⚠️ **Important Notes**

1. **Default Behavior**: Unknown pincodes automatically get ₹100 delivery price
2. **Backward Compatibility**: All existing functionality continues to work
3. **Required Field**: `pincode` is now mandatory for address creation
4. **Auto-Creation**: New pincodes are automatically created when needed
5. **Product Filtering**: `isPipe` field enables pipe-specific product filtering

## 🎮 **Quick Test Commands**

```bash
# Seed data
node seedPincodeData.js

# Test API calls (with auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"label":"Test","house":"123","street":"Test St","city":"chandigarh","pincode":"160001"}' \
     http://localhost:3000/addresses

# Check delivery price
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/addresses/delivery-price/pincode/160001

# Filter pipe products
curl http://localhost:3000/products?isPipe=true
```
