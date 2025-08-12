# Frontend Integration Guide

## 🎯 Key Features for Frontend Implementation

### 1. **Product Button Logic: Add to Cart vs Contact Us**

#### The Problem:

- Pipe products require custom quotes and consultation
- Regular products can be added to cart directly
- Need to show different buttons based on product type

#### The Solution:

Use the `isPipe` boolean field from product API responses.

#### Implementation:

```javascript
// 1. Fetch products with isPipe field
const fetchProducts = async () => {
  const response = await fetch("/api/products");
  const data = await response.json();
  return data.products; // Each product has isPipe field
};

// 2. Render products with appropriate buttons
const renderProduct = (product) => {
  const buttonHtml = product.isPipe
    ? `<button class="contact-btn" onclick="openContactForm('${product.id}')">
         Contact Us for Quote
       </button>`
    : `<button class="cart-btn" onclick="addToCart('${product.id}')">
         Add to Cart - ₹${product.price}
       </button>`;

  return `
    <div class="product-card">
      <h3>${product.name}</h3>
      <p class="price">₹${product.price}</p>
      <span class="product-type">${
        product.isPipe ? "Pipe Product" : "Regular Product"
      }</span>
      ${buttonHtml}
    </div>
  `;
};

// 3. Handle different actions
const addToCart = (productId) => {
  // Regular cart functionality
  cart.addItem(productId);
  showNotification("Added to cart!");
};

const openContactForm = (productId) => {
  // Open contact form for pipe products
  showContactModal(productId);
};
```

#### API Response Structure:

```json
{
  "products": [
    {
      "id": 123,
      "name": "PVC Pipe 4 inch",
      "price": 250,
      "isPipe": true, // 👈 Use this for button logic
      "is_pipe": true // Backward compatibility
    },
    {
      "id": 124,
      "name": "Bathroom Tap",
      "price": 150,
      "isPipe": false, // 👈 Regular product
      "is_pipe": false
    }
  ]
}
```

---

### 2. **Dynamic Delivery Cost Display**

#### The Problem:

- Delivery charges vary by pincode/location
- Need to show accurate delivery cost during checkout
- Should handle unknown pincodes gracefully

#### The Solution:

Use pincode-based delivery pricing API to get real-time delivery costs.

#### Implementation:

```javascript
// 1. Get delivery cost for user's address
const getDeliveryCharge = async (pincode) => {
  try {
    const response = await fetch(
      `/api/addresses/delivery-price/pincode/${pincode}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    return {
      price: data.deliveryPrice,
      isKnownArea: data.found,
      pincode: data.pincode,
    };
  } catch (error) {
    console.error("Failed to fetch delivery price:", error);
    // Fallback to default
    return {
      price: 100,
      isKnownArea: false,
      pincode: pincode,
    };
  }
};

// 2. Update checkout display
const updateCheckoutDelivery = async (selectedAddressId) => {
  // Option A: If you have address ID
  const addressResponse = await fetch(
    `/api/addresses/delivery-price/address/${selectedAddressId}`,
    {
      headers: { Authorization: `Bearer ${userToken}` },
    }
  );
  const addressData = await addressResponse.json();

  displayDeliveryInfo({
    price: addressData.deliveryPrice,
    pincode: addressData.pincode,
    addressId: addressData.addressId,
  });

  // Option B: If you have pincode directly
  // const deliveryInfo = await getDeliveryCharge(userPincode);
  // displayDeliveryInfo(deliveryInfo);
};

// 3. Display delivery information
const displayDeliveryInfo = (deliveryInfo) => {
  const deliveryElement = document.getElementById("delivery-info");

  deliveryElement.innerHTML = `
    <div class="delivery-section">
      <h4>Delivery Information</h4>
      <p>Pincode: ${deliveryInfo.pincode}</p>
      <p class="delivery-price">
        Delivery Charge: ₹${deliveryInfo.price}
        ${!deliveryInfo.isKnownArea ? " (Standard Rate)" : ""}
      </p>
    </div>
  `;

  // Update total
  updateOrderTotal();
};

// 4. Calculate final total
const updateOrderTotal = () => {
  const cartSubtotal = calculateCartSubtotal();
  const deliveryCharge = getCurrentDeliveryCharge();
  const total = cartSubtotal + deliveryCharge;

  document.getElementById("order-summary").innerHTML = `
    <div class="order-total">
      <p>Items Subtotal: ₹${cartSubtotal}</p>
      <p>Delivery Charge: ₹${deliveryCharge}</p>
      <h3>Total: ₹${total}</h3>
    </div>
  `;
};
```

#### Delivery Pricing Structure:

```javascript
// Current delivery rates
const deliveryRates = {
  "Chandigarh (160xxx)": "₹30-95 (Premium zones)",
  "Mohali (140xxx)": "₹60-110 (Standard zones)",
  "Panchkula (134xxx)": "₹70-160 (Extended zones)",
  "Unknown areas": "₹100 (Default rate)",
};
```

---

### 3. **Complete Checkout Flow Example**

```javascript
class CheckoutManager {
  constructor() {
    this.cart = [];
    this.selectedAddress = null;
    this.deliveryCharge = 100; // Default
  }

  async initialize() {
    await this.loadUserAddresses();
    await this.loadCartItems();
    this.setupEventListeners();
  }

  async loadCartItems() {
    // Load cart items and check for pipe products
    const cartItems = await this.getCartItems();

    const hasPipeProducts = cartItems.some((item) => item.product.isPipe);

    if (hasPipeProducts) {
      this.showPipeProductWarning();
    }

    this.cart = cartItems;
    this.renderCart();
  }

  async onAddressChange(addressId) {
    this.selectedAddress = addressId;

    // Get delivery charge for this address
    const deliveryResponse = await fetch(
      `/api/addresses/delivery-price/address/${addressId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const deliveryData = await deliveryResponse.json();
    this.deliveryCharge = deliveryData.deliveryPrice;

    this.updateDeliveryDisplay();
    this.updateTotal();
  }

  updateDeliveryDisplay() {
    document.getElementById(
      "delivery-cost"
    ).textContent = `₹${this.deliveryCharge}`;
  }

  updateTotal() {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal + this.deliveryCharge;

    document.getElementById("subtotal").textContent = `₹${subtotal}`;
    document.getElementById("total").textContent = `₹${total}`;
  }

  showPipeProductWarning() {
    const warning = `
      <div class="pipe-product-notice">
        ⚠️ Your cart contains pipe products that may require custom quotes.
        Our team will contact you for final pricing confirmation.
      </div>
    `;
    document.getElementById("checkout-notices").innerHTML = warning;
  }
}

// Initialize checkout
const checkout = new CheckoutManager();
checkout.initialize();
```

---

### 4. **Error Handling & Fallbacks**

```javascript
// Robust delivery price fetching with fallbacks
const getDeliveryPriceWithFallback = async (pincode, addressId = null) => {
  const fallbackPrice = 100;

  try {
    // Try address-specific lookup first (if available)
    if (addressId) {
      const response = await fetch(
        `/api/addresses/delivery-price/address/${addressId}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          price: data.deliveryPrice,
          source: "address",
          reliable: true,
        };
      }
    }

    // Fallback to pincode lookup
    if (pincode) {
      const response = await fetch(
        `/api/addresses/delivery-price/pincode/${pincode}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          price: data.deliveryPrice,
          source: "pincode",
          reliable: data.found,
        };
      }
    }
  } catch (error) {
    console.error("Delivery price fetch failed:", error);
  }

  // Ultimate fallback
  return {
    price: fallbackPrice,
    source: "default",
    reliable: false,
  };
};
```

---

### 5. **Product Filtering for Different Pages**

```javascript
// Product listing page - show all products with appropriate buttons
const loadAllProducts = async () => {
  const products = await fetch("/api/products").then((r) => r.json());
  renderProductGrid(products.products);
};

// Regular products page - only products that can be added to cart
const loadShoppableProducts = async () => {
  const products = await fetch("/api/products?isPipe=false").then((r) =>
    r.json()
  );
  renderProductGrid(products.products, { showCartButton: true });
};

// Pipe products page - products requiring consultation
const loadPipeProducts = async () => {
  const products = await fetch("/api/products?isPipe=true").then((r) =>
    r.json()
  );
  renderProductGrid(products.products, { showContactButton: true });
};
```

---

## 🔑 Key API Endpoints for Frontend

### Essential Product Endpoints:

- `GET /api/products` - All products with `isPipe` field
- `GET /api/products?isPipe=false` - Only regular products (cart-able)
- `GET /api/products?isPipe=true` - Only pipe products (contact-only)

### Essential Delivery Endpoints:

- `GET /api/addresses/delivery-price/pincode/{pincode}` - Get delivery cost by pincode
- `GET /api/addresses/delivery-price/address/{addressId}` - Get delivery cost by address

### Authentication Required:

- All delivery pricing endpoints require user authentication
- Product endpoints are public (no auth needed)

This guide provides everything needed for seamless frontend integration of the new isPipe and delivery pricing features!
