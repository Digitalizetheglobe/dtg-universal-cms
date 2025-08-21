# Donation API Documentation

This document describes the Razorpay donation integration APIs for the Universal CMS.

## Base URL
```
http://localhost:5000/api/donations
```

## Authentication
- Public endpoints (donation processing) don't require authentication
- Admin endpoints should be protected with JWT authentication (implement as needed)

## Environment Variables Required

Add these to your `.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## API Endpoints

### 1. Create Donation Order
**POST** `/create-order`

Creates a new Razorpay order for donation processing.

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "INR",
  "receipt": "donation_123",
  "notes": "General donation"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_ABC123",
    "amount": 100000,
    "currency": "INR",
    "receipt": "donation_123"
  }
}
```

### 2. Verify Donation Payment
**POST** `/verify-payment`

Verifies the payment signature and saves the donation to the database.

**Request Body:**
```json
{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ789",
  "razorpay_signature": "generated_signature",
  "donorData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "description": "Monthly donation",
    "notes": "Thank you for your support",
    "isAnonymous": false,
    "campaign": "General Fund"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation verified and saved successfully",
  "donation": {
    "id": "donation_id",
    "amount": 1000,
    "status": "completed",
    "paymentId": "pay_XYZ789"
  }
}
```

### 3. Get All Donations
**GET** `/`

Retrieves all donations with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by payment status (pending, completed, failed, refunded)
- `startDate` (string): Filter from date (YYYY-MM-DD)
- `endDate` (string): Filter to date (YYYY-MM-DD)
- `search` (string): Search in donor name, email, or payment ID

**Example Request:**
```
GET /api/donations?page=1&limit=20&status=completed&search=john
```

**Response:**
```json
{
  "success": true,
  "donations": [
    {
      "_id": "donation_id",
      "razorpayPaymentId": "pay_XYZ789",
      "razorpayOrderId": "order_ABC123",
      "donorName": "John Doe",
      "donorEmail": "john@example.com",
      "donorPhone": "+919876543210",
      "amount": 1000,
      "currency": "INR",
      "paymentStatus": "completed",
      "paymentMethod": "card",
      "description": "Monthly donation",
      "receipt": "donation_123",
      "notes": "Thank you for your support",
      "isAnonymous": false,
      "campaign": "General Fund",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDonations": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 4. Get Donation Statistics
**GET** `/stats`

Retrieves comprehensive donation statistics.

**Query Parameters:**
- `startDate` (string): Filter from date (YYYY-MM-DD)
- `endDate` (string): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalDonations": 150,
    "totalAmount": 150000,
    "avgAmount": 1000,
    "completedDonations": 145,
    "completedAmount": 145000,
    "statusBreakdown": [
      {
        "_id": "completed",
        "count": 145,
        "amount": 145000
      },
      {
        "_id": "pending",
        "count": 3,
        "amount": 3000
      },
      {
        "_id": "failed",
        "count": 2,
        "amount": 2000
      }
    ],
    "monthlyBreakdown": [
      {
        "_id": {
          "year": 2024,
          "month": 1
        },
        "count": 25,
        "amount": 25000
      }
    ]
  }
}
```

### 5. Get Donation by ID
**GET** `/:id`

Retrieves a specific donation by its ID.

**Response:**
```json
{
  "success": true,
  "donation": {
    "_id": "donation_id",
    "razorpayPaymentId": "pay_XYZ789",
    "razorpayOrderId": "order_ABC123",
    "donorName": "John Doe",
    "donorEmail": "john@example.com",
    "donorPhone": "+919876543210",
    "amount": 1000,
    "currency": "INR",
    "paymentStatus": "completed",
    "paymentMethod": "card",
    "description": "Monthly donation",
    "receipt": "donation_123",
    "notes": "Thank you for your support",
    "isAnonymous": false,
    "campaign": "General Fund",
    "metadata": {
      "paymentMethod": "card",
      "bank": "HDFC Bank",
      "cardId": "card_123",
      "wallet": null,
      "vpa": null,
      "email": "john@example.com",
      "contact": "+919876543210"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 6. Update Donation Notes
**PATCH** `/:id/notes`

Updates the notes for a specific donation.

**Request Body:**
```json
{
  "notes": "Updated notes for this donation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation notes updated successfully",
  "donation": {
    "_id": "donation_id",
    "notes": "Updated notes for this donation",
    // ... other donation fields
  }
}
```

### 7. Sync Donations from Razorpay
**POST** `/sync-razorpay`

Syncs existing donations from Razorpay to the local database.

**Query Parameters:**
- `startDate` (string): Sync from date (YYYY-MM-DD)
- `endDate` (string): Sync to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Synced 25 new donations from Razorpay",
  "syncedCount": 25,
  "newDonations": [
    // Array of newly synced donations
  ]
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid input)
- `404`: Not Found (donation not found)
- `500`: Internal Server Error

## Frontend Integration Example

Here's how to integrate with the frontend:

```javascript
// Create donation order
const createOrder = async (amount) => {
  const response = await fetch('/api/donations/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, currency: 'INR' })
  });
  return response.json();
};

// Verify payment
const verifyPayment = async (paymentData, donorData) => {
  const response = await fetch('/api/donations/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      donorData
    })
  });
  return response.json();
};

// Get donations for admin dashboard
const getDonations = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/donations?${queryString}`);
  return response.json();
};
```

## Security Considerations

1. **Payment Verification**: Always verify the payment signature on the server side
2. **Environment Variables**: Keep Razorpay credentials secure in environment variables
3. **Authentication**: Implement proper authentication for admin endpoints
4. **Rate Limiting**: Consider implementing rate limiting for public endpoints
5. **Input Validation**: Validate all input data before processing

## Testing

For testing, use Razorpay's test mode:
- Test Key ID: `rzp_test_...`
- Test cards: Use Razorpay's test card numbers
- Test UPI: Use test UPI IDs provided by Razorpay
