# Location API Test Guide

## Prerequisites

1. Make sure your server is running on `http://localhost:3000`
2. Have a test user account ready
3. Run `npx prisma generate` to ensure Prisma client is updated

## API Endpoints

### 1. Set isTricity Status (On Login)

**POST** `/api/location/istricity`

```bash
# Set to TRUE (user in tricity)
curl -X POST http://localhost:3000/api/location/istricity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"isTricity": true}'

# Set to FALSE (user NOT in tricity)
curl -X POST http://localhost:3000/api/location/istricity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"isTricity": false}'
```

### 2. Get isTricity Status (Before Payment)

**GET** `/api/location/istricity`

```bash
curl -X GET http://localhost:3000/api/location/istricity \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Response Examples

### When isTricity = true:

```json
{
  "success": true,
  "data": {
    "isTricity": true,
    "message": "Service available in your area",
    "whatsappNumber": null
  }
}
```

### When isTricity = false:

```json
{
  "success": true,
  "data": {
    "isTricity": false,
    "message": "Service not available in your area. Please contact us on WhatsApp for queries.",
    "whatsappNumber": "+919876543210"
  }
}
```

## Frontend Implementation Flow

### On Login:

```javascript
// Frontend determines user location and sets isTricity
const setUserLocation = async (isInTricity) => {
  await fetch("/api/location/istricity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isTricity: isInTricity }),
  });
};
```

### Before Payment:

```javascript
// Check if user can place order
const checkServiceAvailability = async () => {
  const response = await fetch("/api/location/istricity", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!data.data.isTricity) {
    // Show WhatsApp redirect
    showWhatsAppContact(data.data.whatsappNumber);
    return false;
  }

  return true; // Proceed with payment
};
```
