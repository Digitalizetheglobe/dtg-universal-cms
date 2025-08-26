# Donation API Integration Guide

Complete guide for integrating donation forms and payment processing in your frontend.

## 🚀 Quick Start

### Base URL
```
http://localhost:5000/api/donations
```

### Required Setup
1. **Razorpay Account**: Get your API keys from Razorpay Dashboard
2. **Backend Server**: Ensure your Node.js server is running
3. **Frontend**: Include Razorpay checkout script

## 📋 API Endpoints Overview

### Public APIs (No Authentication Required)
- `POST /submit-form` - Submit donation form and create payment order
- `POST /verify-payment-form` - Verify payment after completion
- `GET /order/:orderId` - Get donation details by order ID

### Admin APIs (For CMS Dashboard)
- `GET /` - Get all donations with pagination
- `GET /stats` - Get donation statistics
- `GET /seva-stats` - Get seva type breakdown
- `GET /test-connection` - Test Razorpay connection
- `GET /:id` - Get donation by ID
- `PATCH /:id/notes` - Update donation notes
- `POST /sync-razorpay` - Sync donations from Razorpay

---

## 🎯 Frontend Integration APIs

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
  "campaign": "Gau Seva Campaign"
}
```

#### Required Fields
- `sevaName` (string): Name of the seva/service
- `sevaType` (string): Type of seva
- `sevaAmount` (number): Amount in INR (must be > 0)
- `donorName` (string): Full name of the donor
- `donorEmail` (string): Valid email address
- `donorPhone` (string): Phone number with country code
- `donorType` (string): "Indian Citizen" or "Foreign Citizen"

#### Optional Fields
- `description` (string): Additional description
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

### 3. Get Donation by Order ID
**GET** `/order/:orderId`

Retrieves donation details using Razorpay order ID.

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

---

## 🔧 Frontend Integration Examples

### 1. HTML Form with JavaScript

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Donation Form</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
    <form id="donationForm">
        <div>
            <label for="sevaName">Seva Name *</label>
            <input type="text" id="sevaName" name="sevaName" required>
        </div>
        
        <div>
            <label for="sevaType">Seva Type *</label>
            <select id="sevaType" name="sevaType" required>
                <option value="">Select Seva Type</option>
                <option value="Animal Welfare">Animal Welfare</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Temple Construction">Temple Construction</option>
            </select>
        </div>
        
        <div>
            <label for="sevaAmount">Amount (₹) *</label>
            <input type="number" id="sevaAmount" name="sevaAmount" min="1" required>
        </div>
        
        <div>
            <label for="donorName">Donor Name *</label>
            <input type="text" id="donorName" name="donorName" required>
        </div>
        
        <div>
            <label for="donorEmail">Email *</label>
            <input type="email" id="donorEmail" name="donorEmail" required>
        </div>
        
        <div>
            <label for="donorPhone">Phone *</label>
            <input type="tel" id="donorPhone" name="donorPhone" required>
        </div>
        
        <div>
            <label>Donor Type *</label>
            <input type="radio" name="donorType" value="Indian Citizen" required> Indian Citizen
            <input type="radio" name="donorType" value="Foreign Citizen"> Foreign Citizen
        </div>
        
        <div>
            <label for="description">Description</label>
            <textarea id="description" name="description"></textarea>
        </div>
        
        <button type="submit">Donate Now</button>
    </form>

    <script>
        // Replace with your actual Razorpay key
        const RAZORPAY_KEY_ID = 'rzp_test_your_razorpay_key_id_here';
        const API_BASE_URL = 'http://localhost:5000/api/donations';

        document.getElementById('donationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Get form data
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                data.sevaAmount = parseInt(data.sevaAmount);
                
                console.log('Submitting donation form:', data);
                
                // Submit form to backend
                const response = await fetch(`${API_BASE_URL}/submit-form`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (result.success) {
                    console.log('Form submitted successfully:', result);
                    
                    // Initialize Razorpay payment
                    const options = {
                        key: RAZORPAY_KEY_ID,
                        amount: result.order.amount,
                        currency: result.order.currency,
                        name: 'Your Organization Name',
                        description: result.donation.sevaName,
                        order_id: result.order.id,
                        handler: function (paymentResponse) {
                            console.log('Payment successful:', paymentResponse);
                            verifyPayment(paymentResponse, result.donation.id);
                        },
                        prefill: {
                            name: result.donation.donorName,
                            email: result.donation.donorEmail,
                            contact: data.donorPhone
                        },
                        theme: {
                            color: '#667eea'
                        }
                    };

                    const rzp = new Razorpay(options);
                    rzp.open();
                    
                } else {
                    throw new Error(result.message || 'Failed to submit form');
                }
                
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Error submitting donation form: ' + error.message);
            }
        });

        async function verifyPayment(paymentResponse, donationId) {
            try {
                console.log('Verifying payment...');
                
                const response = await fetch(`${API_BASE_URL}/verify-payment-form`, {
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

                const result = await response.json();
                
                if (result.success) {
                    console.log('Payment verified successfully:', result);
                    alert('🎉 Thank you for your donation! Your payment has been processed successfully.');
                    
                    // Reset form
                    document.getElementById('donationForm').reset();
                    
                    // Optionally redirect to success page
                    // window.location.href = '/donation-success';
                    
                } else {
                    throw new Error(result.message || 'Payment verification failed');
                }
                
            } catch (error) {
                console.error('Error verifying payment:', error);
                alert('❌ Payment verification failed. Please contact support if the amount was deducted.');
            }
        }
    </script>
</body>
</html>
```

### 2. React Component Example

```jsx
import React, { useState } from 'react';

const DonationForm = () => {
  const [formData, setFormData] = useState({
    sevaName: '',
    sevaType: '',
    sevaAmount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    donorType: '',
    description: '',
    campaign: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit form to backend
      const response = await fetch('http://localhost:5000/api/donations/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sevaAmount: parseInt(formData.sevaAmount)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Initialize Razorpay payment
        const options = {
          key: 'rzp_test_your_razorpay_key_id_here',
          amount: result.order.amount,
          currency: result.order.currency,
          name: 'Your Organization Name',
          description: result.donation.sevaName,
          order_id: result.order.id,
          handler: function (paymentResponse) {
            verifyPayment(paymentResponse, result.donation.id);
          },
          prefill: {
            name: result.donation.donorName,
            email: result.donation.donorEmail,
            contact: formData.donorPhone
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        
      } else {
        throw new Error(result.message || 'Failed to submit form');
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting donation form: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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

      const result = await response.json();
      
      if (result.success) {
        alert('🎉 Thank you for your donation!');
        setFormData({
          sevaName: '',
          sevaType: '',
          sevaAmount: '',
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          donorType: '',
          description: '',
          campaign: ''
        });
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
      
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('❌ Payment verification failed. Please contact support.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Seva Name *</label>
        <input
          type="text"
          name="sevaName"
          value={formData.sevaName}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div>
        <label>Seva Type *</label>
        <select
          name="sevaType"
          value={formData.sevaType}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Seva Type</option>
          <option value="Animal Welfare">Animal Welfare</option>
          <option value="Education">Education</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Temple Construction">Temple Construction</option>
        </select>
      </div>
      
      <div>
        <label>Amount (₹) *</label>
        <input
          type="number"
          name="sevaAmount"
          value={formData.sevaAmount}
          onChange={handleInputChange}
          min="1"
          required
        />
      </div>
      
      <div>
        <label>Donor Name *</label>
        <input
          type="text"
          name="donorName"
          value={formData.donorName}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div>
        <label>Email *</label>
        <input
          type="email"
          name="donorEmail"
          value={formData.donorEmail}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div>
        <label>Phone *</label>
        <input
          type="tel"
          name="donorPhone"
          value={formData.donorPhone}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div>
        <label>Donor Type *</label>
        <input
          type="radio"
          name="donorType"
          value="Indian Citizen"
          checked={formData.donorType === 'Indian Citizen'}
          onChange={handleInputChange}
          required
        /> Indian Citizen
        <input
          type="radio"
          name="donorType"
          value="Foreign Citizen"
          checked={formData.donorType === 'Foreign Citizen'}
          onChange={handleInputChange}
        /> Foreign Citizen
      </div>
      
      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Donate Now'}
      </button>
    </form>
  );
};

export default DonationForm;
```

### 3. Vue.js Component Example

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>Seva Name *</label>
      <input v-model="formData.sevaName" type="text" required>
    </div>
    
    <div>
      <label>Seva Type *</label>
      <select v-model="formData.sevaType" required>
        <option value="">Select Seva Type</option>
        <option value="Animal Welfare">Animal Welfare</option>
        <option value="Education">Education</option>
        <option value="Healthcare">Healthcare</option>
        <option value="Temple Construction">Temple Construction</option>
      </select>
    </div>
    
    <div>
      <label>Amount (₹) *</label>
      <input v-model.number="formData.sevaAmount" type="number" min="1" required>
    </div>
    
    <div>
      <label>Donor Name *</label>
      <input v-model="formData.donorName" type="text" required>
    </div>
    
    <div>
      <label>Email *</label>
      <input v-model="formData.donorEmail" type="email" required>
    </div>
    
    <div>
      <label>Phone *</label>
      <input v-model="formData.donorPhone" type="tel" required>
    </div>
    
    <div>
      <label>Donor Type *</label>
      <input v-model="formData.donorType" type="radio" value="Indian Citizen" required> Indian Citizen
      <input v-model="formData.donorType" type="radio" value="Foreign Citizen"> Foreign Citizen
    </div>
    
    <div>
      <label>Description</label>
      <textarea v-model="formData.description"></textarea>
    </div>
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Processing...' : 'Donate Now' }}
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        sevaName: '',
        sevaType: '',
        sevaAmount: '',
        donorName: '',
        donorEmail: '',
        donorPhone: '',
        donorType: '',
        description: '',
        campaign: ''
      },
      loading: false
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      
      try {
        const response = await fetch('http://localhost:5000/api/donations/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...this.formData,
            sevaAmount: parseInt(this.formData.sevaAmount)
          })
        });

        const result = await response.json();
        
        if (result.success) {
          const options = {
            key: 'rzp_test_your_razorpay_key_id_here',
            amount: result.order.amount,
            currency: result.order.currency,
            name: 'Your Organization Name',
            description: result.donation.sevaName,
            order_id: result.order.id,
            handler: (paymentResponse) => {
              this.verifyPayment(paymentResponse, result.donation.id);
            },
            prefill: {
              name: result.donation.donorName,
              email: result.donation.donorEmail,
              contact: this.formData.donorPhone
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          
        } else {
          throw new Error(result.message || 'Failed to submit form');
        }
        
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error submitting donation form: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    async verifyPayment(paymentResponse, donationId) {
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

        const result = await response.json();
        
        if (result.success) {
          alert('🎉 Thank you for your donation!');
          this.resetForm();
        } else {
          throw new Error(result.message || 'Payment verification failed');
        }
        
      } catch (error) {
        console.error('Error verifying payment:', error);
        alert('❌ Payment verification failed. Please contact support.');
      }
    },
    
    resetForm() {
      this.formData = {
        sevaName: '',
        sevaType: '',
        sevaAmount: '',
        donorName: '',
        donorEmail: '',
        donorPhone: '',
        donorType: '',
        description: '',
        campaign: ''
      };
    }
  }
}
</script>
```

---

## 🔒 Security Considerations

1. **Payment Signature Verification**: Always verify Razorpay payment signatures on the server side
2. **Input Validation**: Validate all form inputs before processing
3. **HTTPS**: Use HTTPS in production for secure data transmission
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **CORS**: Configure CORS properly for your domain

---

## 🧪 Testing

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

---

## 📊 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "All required fields must be provided"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Donation not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error submitting donation form",
  "error": "Detailed error message"
}
```

---

## 🚀 Production Checklist

- [ ] Replace `rzp_test_` with `rzp_live_` for production
- [ ] Update API base URL to production server
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain
- [ ] Set up email notifications
- [ ] Implement proper error logging
- [ ] Add rate limiting
- [ ] Test payment flow thoroughly

This API structure provides a complete solution for handling donation forms and payment processing on your website!
