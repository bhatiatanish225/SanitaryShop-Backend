# Product Images API Documentation

## Overview

This API allows you to manage multiple images for products. Each product can have an array of images with automatic ordering and cascade delete functionality.

## Authentication

**All product operations require authentication:**

- **Viewing products**: User authentication required
- **Creating/Updating/Deleting products**: Admin authentication required

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🆕 CREATE Product with Images

### Endpoint

```
POST /api/products
```

### Request Body

```javascript
{
  "itemCode": "SINK_001",
  "name": "Premium Bathroom Sink",
  "description": "High-quality ceramic sink",
  "price": 299.99,
  "categoryId": 15,
  "imageUrls": [
    "https://example.com/sink-front.jpg",
    "https://example.com/sink-side.jpg",
    "https://example.com/sink-top.jpg"
  ],
  "availableStock": 50
}
```

### Response

```javascript
{
  "id": 12345,
  "itemCode": "SINK_001",
  "name": "Premium Bathroom Sink",
  "description": "High-quality ceramic sink",
  "price": 299.99,
  "categoryId": 15,
  "availableStock": 50,
  "images": [
    {
      "id": 1,
      "imageUrl": "https://example.com/sink-front.jpg",
      "altText": "Product image 1",
      "sortOrder": 0
    },
    {
      "id": 2,
      "imageUrl": "https://example.com/sink-side.jpg",
      "altText": "Product image 2",
      "sortOrder": 1
    },
    {
      "id": 3,
      "imageUrl": "https://example.com/sink-top.jpg",
      "altText": "Product image 3",
      "sortOrder": 2
    }
  ],
  "createdAt": "2025-08-05T10:30:00Z"
}
```

### Frontend Code Example

```javascript
const createProductWithImages = async (productData) => {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...productData,
      imageUrls: [
        "https://cdn.example.com/product1.jpg",
        "https://cdn.example.com/product2.jpg",
        "https://cdn.example.com/product3.jpg",
      ],
    }),
  });

  const product = await response.json();
  console.log(`Created product with ${product.images.length} images`);
  return product;
};
```

---

## 📖 GET Product with Images

### Endpoint

```
GET /api/products/:id
```

### Response

```javascript
{
  "id": 12345,
  "itemCode": "SINK_001",
  "name": "Premium Bathroom Sink",
  "price": 299.99,
  "images": [
    {
      "id": 1,
      "imageUrl": "https://example.com/sink-front.jpg",
      "altText": "Product image 1",
      "sortOrder": 0
    },
    {
      "id": 2,
      "imageUrl": "https://example.com/sink-side.jpg",
      "altText": "Product image 2",
      "sortOrder": 1
    }
  ],
  "category": {
    "id": 15,
    "name": "Bathroom Fixtures"
  }
}
```

### Frontend Code Example

```javascript
const getProductWithImages = async (productId) => {
  const response = await fetch(`/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const product = await response.json();

  // Display images in your UI
  product.images.forEach((image, index) => {
    console.log(`Image ${index + 1}: ${image.imageUrl}`);
  });

  return product;
};
```

---

## ✏️ UPDATE Product Images

### Endpoint

```
PUT /api/products/:id
```

### Request Body (Replace all images)

```javascript
{
  "name": "Updated Product Name",
  "imageUrls": [
    "https://example.com/new-image-1.jpg",
    "https://example.com/new-image-2.jpg"
  ]
}
```

### Response

```javascript
{
  "id": 12345,
  "name": "Updated Product Name",
  "images": [
    {
      "id": 4,
      "imageUrl": "https://example.com/new-image-1.jpg",
      "altText": "Product image 1",
      "sortOrder": 0
    },
    {
      "id": 5,
      "imageUrl": "https://example.com/new-image-2.jpg",
      "altText": "Product image 2",
      "sortOrder": 1
    }
  ]
}
```

### Frontend Code Example

```javascript
const updateProductImages = async (productId, newImageUrls) => {
  const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrls: newImageUrls,
    }),
  });

  const updatedProduct = await response.json();
  console.log(`Updated product now has ${updatedProduct.images.length} images`);
  return updatedProduct;
};
```

---

## 🗑️ DELETE Product (Cascade Delete Images)

### Endpoint

```
DELETE /api/products/:id
```

### Response

```javascript
{
  "message": "Product deleted successfully"
}
```

**Note**: When you delete a product, ALL associated images are automatically deleted from the database (CASCADE DELETE).

### Frontend Code Example

```javascript
const deleteProduct = async (productId) => {
  const response = await fetch(`/api/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  console.log("Product and all images deleted");
  return result;
};
```

---

## 📋 GET All Products with Images

### Endpoint

```
GET /api/products
```

### Query Parameters

```javascript
{
  "category": 15,           // Filter by category ID
  "categoryId": 15,         // Alternative format
  "search": "sink",         // Search in name, description, itemCode
  "isFeatured": "true",     // Filter featured products
  "isBestseller": "true",   // Filter bestseller products
  "page": 1,                // Page number (default: 1)
  "limit": 10,              // Items per page (default: 10, max: 50)
  "sortBy": "createdAt",    // Sort field (default: createdAt)
  "sortOrder": "desc"       // Sort direction (asc/desc, default: desc)
}
```

### Response (Paginated)

```javascript
{
  "products": [
    {
      "id": 12345,
      "name": "Product 1",
      "price": 299.99,
      "images": [
        {
          "id": 1,
          "imageUrl": "https://example.com/product1-1.jpg",
          "image_url": "https://example.com/product1-1.jpg", // Legacy format
          "altText": "Product image 1",
          "alt_text": "Product image 1", // Legacy format
          "sortOrder": 0,
          "sort_order": 0 // Legacy format
        },
        {
          "id": 2,
          "imageUrl": "https://example.com/product1-2.jpg",
          "image_url": "https://example.com/product1-2.jpg",
          "altText": "Product image 2",
          "alt_text": "Product image 2",
          "sortOrder": 1,
          "sort_order": 1
        }
      ],
      "category": {
        "id": 15,
        "name": "Bathroom Fixtures"
      },
      "image_url": "https://example.com/product1-main.jpg", // Legacy main image
      "stock_quantity": 25,
      "original_price": 399.99,
      "reviews_count": 12
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 150,
    "totalProducts": 1500,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "limit": 10
  }
}
```

### Frontend Code Example

```javascript
const getAllProductsWithImages = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);

  const response = await fetch(`/api/products?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  console.log(`Loaded ${data.products.length} products`);
  console.log(
    `Page ${data.pagination.currentPage} of ${data.pagination.totalPages}`
  );

  return data;
};

// Usage examples:
// Get first page of all products
const allProducts = await getAllProductsWithImages();

// Get featured products
const featuredProducts = await getAllProductsWithImages({
  isFeatured: "true",
  page: 1,
  limit: 20,
});

// Search products
const searchResults = await getAllProductsWithImages({
  search: "bathroom sink",
  category: 15,
  page: 1,
});
```

---

## 🎯 Key Points for Frontend Development

### ✅ What Works

- Send `imageUrls` array when creating products
- Send `imageUrls` array when updating products
- Receive `images` array in all responses
- Images are automatically ordered (sortOrder: 0, 1, 2...)
- Automatic alt text generation ("Product image 1", "Product image 2"...)
- Cascade delete - deleting product removes all images
- **Dual format support**: Both camelCase (`imageUrl`, `altText`) and snake_case (`image_url`, `alt_text`) in responses
- **Pagination**: GET all products returns paginated results with metadata
- **Search & Filter**: Support for category, search, featured, bestseller filters
- **Authentication**: User auth for viewing, admin auth for modifications

### 📝 Important Notes

1. **Parameter Name**: Always use `imageUrls` (not `images`) when sending data
2. **Response Name**: You'll receive `images` array in responses
3. **Dual Format**: Responses include both `imageUrl`/`altText`/`sortOrder` AND `image_url`/`alt_text`/`sort_order` for compatibility
4. **Order Matters**: First URL becomes sortOrder 0, second becomes 1, etc.
5. **Complete Replacement**: Sending `imageUrls` in update replaces ALL existing images
6. **Empty Array**: Send `imageUrls: []` to remove all images from a product
7. **Authentication**: User token required for viewing, admin token for create/update/delete
8. **Pagination**: GET all products is paginated (default: 10 per page, max: 50)
9. **File Upload**: Also supports file upload via `image` field for main product image

### 🚨 Error Handling

```javascript
try {
  const product = await createProductWithImages(productData);
  console.log("Success:", product);
} catch (error) {
  if (error.response?.status === 400) {
    console.error("Invalid data:", error.response.data.message);
  } else if (error.response?.status === 401) {
    console.error("Authentication required");
  }
}
```

### 💡 Best Practices

1. **Validate URLs**: Ensure image URLs are valid before sending
2. **Handle Loading**: Show loading states while uploading
3. **Optimize Images**: Use appropriate image sizes/formats
4. **Error Feedback**: Show clear error messages to users
5. **Preview**: Allow users to preview images before saving

---

## 🧪 Test the API

You can test with curl:

```bash
# Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# Create product with images (Admin only)
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemCode": "TEST_001",
    "name": "Test Product",
    "price": 99.99,
    "categoryId": 15,
    "imageUrls": [
      "https://example.com/test1.jpg",
      "https://example.com/test2.jpg"
    ],
    "availableStock": 10
  }'

# Get all products with pagination (User token sufficient)
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&search=test" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get single product with images (User token sufficient)
curl -X GET http://localhost:3000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update product images (Admin only)
curl -X PUT http://localhost:3000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": [
      "https://example.com/updated1.jpg",
      "https://example.com/updated2.jpg"
    ]
  }'

# Delete product and cascade delete images (Admin only)
curl -X DELETE http://localhost:3000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔧 Additional Endpoints

### Simple Products (Backward Compatibility)

```
GET /api/products/simple
```

Returns simplified product list without full pagination structure.

### File Upload Support

You can also upload images as files instead of URLs:

```bash
# Upload product with file
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Test Product" \
  -F "price=99.99" \
  -F "categoryId=15" \
  -F "image=@/path/to/image.jpg" \
  -F "imageUrls=[\"https://example.com/additional.jpg\"]"
```

## ✨ Ready to Use!

Your image array functionality is fully operational. The frontend can now:

- ✅ **Authentication**: User tokens for viewing, admin tokens for modifications
- ✅ **Image Arrays**: Send `imageUrls` arrays and receive properly formatted `images` responses
- ✅ **Dual Format**: Get both camelCase and snake_case formats for maximum compatibility
- ✅ **CRUD Operations**: Create, read, update, and delete products with multiple images
- ✅ **Pagination**: Handle large product catalogs with built-in pagination
- ✅ **Search & Filter**: Find products by category, keywords, featured status, etc.
- ✅ **Auto-ordering**: Images automatically sorted by `sortOrder` field
- ✅ **Cascade Delete**: Deleting products automatically removes all associated images
- ✅ **File Upload**: Support both URL arrays and file uploads
- ✅ **Transaction Safety**: All operations are database-transaction safe
- ✅ **Error Handling**: Comprehensive error messages and status codes

**Happy coding! 🚀**
