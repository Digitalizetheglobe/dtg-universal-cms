# Donation Form API Documentation

This document describes the APIs for handling donation form submissions and payment processing for your website.

## Base URL
```
http://localhost:5000/api/donations
```

## API Endpoints

### 1. Submit Donation Form
**POST** `/submit-form`

Creates a donation record and Razorpay order for payment processing.

#### Request Body
```json
{
  "sevaName": "Gau Seva",
  "sevaType": "Animal Welfare",
  "sevaAmount": 1000,
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "donorPhone": "+919876543210",
  "donorType": "Indian Citizen",
  "description": "Donation for cow protection",
  "isAnonymous": false,
  "campaign": "Gau Seva Campaign"
}
```

#### Required Fields
- `sevaName` (string): Name of the seva/service
- `sevaType` (string): Type of seva (e.g., "Animal Welfare", "Education", "Healthcare")
- `sevaAmount` (number): Amount in INR (must be > 0)
- `donorName` (string): Full name of the donor
- `donorEmail` (string): Valid email address
- `donorPhone` (string): Phone number with country code
- `donorType` (string): Either "Indian Citizen" or "Foreign Citizen"

#### Optional Fields
- `description` (string): Additional description
- `isAnonymous` (boolean): Whether to keep donor anonymous (default: false)
- `campaign` (string): Campaign name

#### Response (Success - 201)
```json
{
  "success": true,
  "message": "Donation form submitted successfully",
  "donation": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "sevaName": "Gau Seva",
    "sevaType": "Animal Welfare",
    "amount": 1000,
    "donorName": "John Doe",
    "donorEmail": "john@example.com",
    "paymentStatus": "pending"
  },
  "order": {
    "id": "order_1234567890",
    "amount": 100000,
    "currency": "INR",
    "receipt": "donation_64f8a1b2c3d4e5f6a7b8c9d0"
  }
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "message": "All required fields must be provided"
}
```

### 2. Verify Payment
**POST** `/verify-payment-form`

Verifies the payment signature and updates donation status.

#### Request Body
```json
{
  "razorpay_order_id": "order_1234567890",
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_signature": "abc123def456...",
  "donationId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

#### Required Fields
- `razorpay_order_id` (string): Order ID from Razorpay
- `razorpay_payment_id` (string): Payment ID from Razorpay
- `razorpay_signature` (string): Payment signature from Razorpay
- `donationId` (string): Donation ID from your database

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "donation": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "sevaName": "Gau Seva",
    "sevaType": "Animal Welfare",
    "amount": 1000,
    "donorName": "John Doe",
    "donorEmail": "john@example.com",
    "paymentStatus": "completed",
    "paymentId": "pay_1234567890"
  }
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```

### 3. Get Donation by Order ID
**GET** `/order/:orderId`

Retrieves donation details using Razorpay order ID.

#### URL Parameters
- `orderId` (string): Razorpay order ID

#### Response (Success - 200)
```json
{
  "success": true,
  "donation": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "sevaName": "Gau Seva",
    "sevaType": "Animal Welfare",
    "amount": 1000,
    "donorName": "John Doe",
    "donorEmail": "john@example.com",
    "donorPhone": "+919876543210",
    "donorType": "Indian Citizen",
    "paymentStatus": "completed",
    "orderId": "order_1234567890",
    "description": "Donation for cow protection",
    "campaign": "Gau Seva Campaign"
  }
}
```

#### Response (Error - 404)
```json
{
  "success": false,
  "message": "Donation not found"
}
```

### 4. Get Seva Statistics
**GET** `/seva-stats`

Retrieves statistics broken down by seva type and donor type.

#### Query Parameters
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)

#### Response (Success - 200)
```json
{
  "success": true,
  "stats": {
    "totalDonations": 150,
    "totalAmount": 150000,
    "completedDonations": 120,
    "completedAmount": 120000,
    "sevaTypeBreakdown": [
      {
        "_id": "Animal Welfare",
        "count": 50,
        "amount": 50000,
        "completedCount": 40,
        "completedAmount": 40000
      },
      {
        "_id": "Education",
        "count": 30,
        "amount": 30000,
        "completedCount": 25,
        "completedAmount": 25000
      }
    ],
    "donorTypeBreakdown": [
      {
        "_id": "Indian Citizen",
        "count": 120,
        "amount": 120000
      },
      {
        "_id": "Foreign Citizen",
        "count": 30,
        "amount": 30000
      }
    ]
  }
}
```

## Frontend Integration Example

### 1. Submit Donation Form
```javascript
const submitDonationForm = async (formData) => {
  try {
    const response = await fetch('http://localhost:5000/api/donations/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sevaName: formData.sevaName,
        sevaType: formData.sevaType,
        sevaAmount: formData.sevaAmount,
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        donorType: formData.donorType,
        description: formData.description,
        campaign: formData.campaign
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Initialize Razorpay payment
      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Your Organization',
        description: data.donation.sevaName,
        order_id: data.order.id,
        handler: function (response) {
          // Handle successful payment
          verifyPayment(response, data.donation.id);
        },
        prefill: {
          name: data.donation.donorName,
          email: data.donation.donorEmail,
          contact: formData.donorPhone
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    }
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};
```

### 2. Verify Payment
```javascript
const verifyPayment = async (paymentResponse, donationId) => {
  try {
    const response = await fetch('http://localhost:5000/api/donations/verify-payment-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        donationId: donationId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Show success message
      alert('Payment successful! Thank you for your donation.');
      // Redirect to success page or show confirmation
    } else {
      // Show error message
      alert('Payment verification failed. Please contact support.');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
  }
};
```

### 3. HTML Form Example
```html
<form id="donationForm">
  <div>
    <label for="sevaName">Seva Name:</label>
    <input type="text" id="sevaName" name="sevaName" required>
  </div>
  
  <div>
    <label for="sevaType">Seva Type:</label>
    <select id="sevaType" name="sevaType" required>
      <option value="">Select Seva Type</option>
      <option value="Animal Welfare">Animal Welfare</option>
      <option value="Education">Education</option>
      <option value="Healthcare">Healthcare</option>
      <option value="Temple Construction">Temple Construction</option>
    </select>
  </div>
  
  <div>
    <label for="sevaAmount">Seva Amount (₹):</label>
    <input type="number" id="sevaAmount" name="sevaAmount" min="1" required>
  </div>
  
  <div>
    <label for="donorName">Donor Name:</label>
    <input type="text" id="donorName" name="donorName" required>
  </div>
  
  <div>
    <label for="donorEmail">Email:</label>
    <input type="email" id="donorEmail" name="donorEmail" required>
  </div>
  
  <div>
    <label for="donorPhone">Phone Number:</label>
    <input type="tel" id="donorPhone" name="donorPhone" required>
  </div>
  
  <div>
    <label>Donor Type:</label>
    <input type="radio" id="indian" name="donorType" value="Indian Citizen" required>
    <label for="indian">Indian Citizen</label>
    <input type="radio" id="foreign" name="donorType" value="Foreign Citizen">
    <label for="foreign">Foreign Citizen</label>
  </div>
  
  <div>
    <label for="description">Description (Optional):</label>
    <textarea id="description" name="description"></textarea>
  </div>
  
  <button type="submit">Donate Now</button>
</form>

<script>
document.getElementById('donationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  await submitDonationForm(data);
});
</script>
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
- Missing required fields
- Invalid amount (≤ 0)
- Invalid donor type
- Invalid payment signature

#### 404 Not Found
- Donation not found by ID or order ID

#### 500 Internal Server Error
- Database connection issues
- Razorpay API errors
- Server configuration problems

## Security Considerations

1. **Payment Signature Verification**: Always verify Razorpay payment signatures on the server side
2. **Input Validation**: Validate all form inputs before processing
3. **HTTPS**: Use HTTPS in production for secure data transmission
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **CORS**: Configure CORS properly for your domain

## Testing

### Test the APIs using curl:

```bash
# Submit donation form
curl -X POST http://localhost:5000/api/donations/submit-form \
  -H "Content-Type: application/json" \
  -d '{
    "sevaName": "Test Seva",
    "sevaType": "Education",
    "sevaAmount": 500,
    "donorName": "Test User",
    "donorEmail": "test@example.com",
    "donorPhone": "+919876543210",
    "donorType": "Indian Citizen"
  }'

# Get donation by order ID
curl http://localhost:5000/api/donations/order/order_1234567890

# Get seva statistics
curl http://localhost:5000/api/donations/seva-stats
```

## Database Schema

The donation records include the following fields:

- **Seva Details**: sevaName, sevaType, sevaAmount
- **Donor Information**: donorName, donorEmail, donorPhone, donorType
- **Payment Details**: razorpayPaymentId, razorpayOrderId, paymentStatus, paymentMethod, amount, currency
- **Metadata**: Additional payment information from Razorpay
- **Timestamps**: createdAt, updatedAt

This API structure provides a complete solution for handling donation forms and payment processing on your website.
