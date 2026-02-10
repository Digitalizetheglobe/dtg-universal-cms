# Donor Wall API Documentation

Complete API documentation for the Donor Wall management system.

## Base URL

```
http://localhost:5000/api/donor-wall
```

## Data Model

### DonorWall Schema

```javascript
{
  _id: ObjectId,
  
  // Donor Information
  fullName: String (required, trimmed),
  email: String (required, trimmed, lowercase),
  phone: String (trimmed),
  address: String (trimmed),
  
  // Donation Details
  amount: Number (required, min: 0),
  donationDate: Date (default: now),
  campaign: String (default: 'General Donation'),
  panNumber: String (trimmed),
  
  // Tier/Category
  tier: String (enum: 'Platinum', 'Gold', 'Silver', 'Bronze', 'Supporter', default: 'Supporter'),
  
  // Visibility Settings
  isVisible: Boolean (default: true),
  isAnonymous: Boolean (default: false),
  showAmount: Boolean (default: true),
  
  // Donor Message
  message: String (max: 500 characters),
  
  // Avatar/Profile
  avatarColor: String (default: '#FF6B6B'),
  avatarInitials: String (auto-generated),
  
  // Status
  status: String (enum: 'active', 'inactive', 'pending', default: 'active'),
  
  // Metadata
  notes: String (internal, not public),
  
  createdAt: Date,
  updatedAt: Date
}
```

### Tier Thresholds
- **Platinum**: ₹1,00,000 and above
- **Gold**: ₹50,000 - ₹99,999
- **Silver**: ₹25,000 - ₹49,999
- **Bronze**: ₹10,000 - ₹24,999
- **Supporter**: Below ₹10,000

## API Endpoints

### 1. Create Donor

**Endpoint:** `POST /api/donor-wall`

**Description:** Add a new donor to the wall

**Request Body:**
```json
{
  "fullName": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+91 98765 43210",
  "amount": 50000,
  "donationDate": "2024-02-06",
  "campaign": "Build a School",
  "tier": "",
  "isVisible": true,
  "isAnonymous": false,
  "showAmount": true,
  "message": "Happy to support this noble cause",
  "avatarColor": "#FF6B6B",
  "address": "123 Main Street, Mumbai, Maharashtra",
  "panNumber": "ABCDE1234F",
  "notes": "VIP donor, send personalized thank you"
}
```

**Required Fields:**
- `fullName` (String)
- `email` (String, valid email format)
- `amount` (Number, greater than 0)

**Optional Fields:**
- `phone` (String)
- `donationDate` (Date, ISO format, defaults to current date)
- `campaign` (String, defaults to 'General Donation')
- `tier` (String, auto-assigned if not provided)
- `isVisible` (Boolean, defaults to true)
- `isAnonymous` (Boolean, defaults to false)
- `showAmount` (Boolean, defaults to true)
- `message` (String, max 500 characters)
- `avatarColor` (String, hex color code)
- `address` (String)
- `panNumber` (String)
- `notes` (String, internal use only)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Donor added successfully",
  "data": {
    "_id": "65c1234567890abcdef12345",
    "fullName": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "+91 98765 43210",
    "amount": 50000,
    "donationDate": "2024-02-06T00:00:00.000Z",
    "campaign": "Build a School",
    "tier": "Gold",
    "isVisible": true,
    "isAnonymous": false,
    "showAmount": true,
    "message": "Happy to support this noble cause",
    "avatarColor": "#FF6B6B",
    "avatarInitials": "RK",
    "address": "123 Main Street, Mumbai, Maharashtra",
    "panNumber": "ABCDE1234F",
    "notes": "VIP donor, send personalized thank you",
    "status": "active",
    "createdAt": "2024-02-06T10:30:00.000Z",
    "updatedAt": "2024-02-06T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Full name, email, and amount are required"
}
```

---

### 2. Get All Donors

**Endpoint:** `GET /api/donor-wall`

**Description:** Retrieve all donors with optional filtering, search, and pagination

**Query Parameters:**
- `tier` (String, optional) - Filter by tier (Platinum, Gold, Silver, Bronze, Supporter)
- `campaign` (String, optional) - Filter by campaign name
- `isVisible` (Boolean, optional) - Filter by visibility (true/false)
- `status` (String, optional) - Filter by status (active/inactive/pending)
- `search` (String, optional) - Search by name or email
- `page` (Number, optional, default: 1) - Page number
- `limit` (Number, optional, default: 20) - Items per page
- `sortBy` (String, optional, default: 'donationDate') - Sort field
- `sortOrder` (String, optional, default: 'desc') - Sort order (asc/desc)

**Example Request:**
```
GET /api/donor-wall?tier=Gold&isVisible=true&search=rajesh&page=1&limit=20&sortBy=amount&sortOrder=desc
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65c1234567890abcdef12345",
      "fullName": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "phone": "+91 98765 43210",
      "amount": 50000,
      "donationDate": "2024-02-06T00:00:00.000Z",
      "campaign": "Build a School",
      "tier": "Gold",
      "isVisible": true,
      "isAnonymous": false,
      "showAmount": true,
      "message": "Happy to support this noble cause",
      "avatarColor": "#FF6B6B",
      "avatarInitials": "RK",
      "status": "active",
      "createdAt": "2024-02-06T10:30:00.000Z",
      "updatedAt": "2024-02-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20
  }
}
```

---

### 3. Get Donor Statistics

**Endpoint:** `GET /api/donor-wall/stats`

**Description:** Get overall statistics for the donor wall

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalDonors": 150,
    "visibleDonors": 135,
    "hiddenDonors": 15,
    "totalRaised": 5750000,
    "tierCounts": {
      "Platinum": 5,
      "Gold": 15,
      "Silver": 30,
      "Bronze": 45,
      "Supporter": 55
    },
    "totalCampaigns": 8
  }
}
```

---

### 4. Get Donors by Tier

**Endpoint:** `GET /api/donor-wall/tier/:tier`

**Description:** Get all donors in a specific tier

**URL Parameters:**
- `tier` (String, required) - Tier name (Platinum, Gold, Silver, Bronze, Supporter)

**Query Parameters:**
- `page` (Number, optional, default: 1)
- `limit` (Number, optional, default: 20)

**Example Request:**
```
GET /api/donor-wall/tier/Gold?page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65c1234567890abcdef12345",
      "fullName": "Rajesh Kumar",
      "tier": "Gold",
      "amount": 50000,
      "isVisible": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 25,
    "itemsPerPage": 20
  }
}
```

---

### 5. Get Donors by Campaign

**Endpoint:** `GET /api/donor-wall/campaign/:campaign`

**Description:** Get all donors for a specific campaign

**URL Parameters:**
- `campaign` (String, required) - Campaign name

**Query Parameters:**
- `page` (Number, optional, default: 1)
- `limit` (Number, optional, default: 20)

**Example Request:**
```
GET /api/donor-wall/campaign/Build%20a%20School?page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65c1234567890abcdef12345",
      "fullName": "Rajesh Kumar",
      "campaign": "Build a School",
      "amount": 50000,
      "donationDate": "2024-02-06T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45,
    "itemsPerPage": 20
  }
}
```

---

### 6. Get Single Donor

**Endpoint:** `GET /api/donor-wall/:id`

**Description:** Get a single donor by ID

**URL Parameters:**
- `id` (String, required) - Donor ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65c1234567890abcdef12345",
    "fullName": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "+91 98765 43210",
    "amount": 50000,
    "donationDate": "2024-02-06T00:00:00.000Z",
    "campaign": "Build a School",
    "tier": "Gold",
    "isVisible": true,
    "isAnonymous": false,
    "showAmount": true,
    "message": "Happy to support this noble cause",
    "avatarColor": "#FF6B6B",
    "avatarInitials": "RK",
    "address": "123 Main Street, Mumbai, Maharashtra",
    "panNumber": "ABCDE1234F",
    "notes": "VIP donor, send personalized thank you",
    "status": "active",
    "createdAt": "2024-02-06T10:30:00.000Z",
    "updatedAt": "2024-02-06T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Donor not found"
}
```

---

### 7. Update Donor

**Endpoint:** `PUT /api/donor-wall/:id`

**Description:** Update an existing donor

**URL Parameters:**
- `id` (String, required) - Donor ID

**Request Body:** (All fields optional)
```json
{
  "fullName": "Rajesh Kumar Sharma",
  "email": "rajesh.new@example.com",
  "phone": "+91 98765 00000",
  "amount": 75000,
  "donationDate": "2024-02-07",
  "campaign": "Education Support",
  "tier": "Gold",
  "isVisible": false,
  "isAnonymous": true,
  "showAmount": false,
  "message": "Updated message",
  "avatarColor": "#4ECDC4",
  "address": "New address",
  "panNumber": "NEWPAN123",
  "notes": "Updated notes",
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Donor updated successfully",
  "data": {
    "_id": "65c1234567890abcdef12345",
    "fullName": "Rajesh Kumar Sharma",
    "amount": 75000,
    "tier": "Gold",
    "updatedAt": "2024-02-06T11:45:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Donor not found"
}
```

**Note:** If `amount` is updated, the tier will be automatically re-assigned unless a specific tier is provided in the request.

---

### 8. Toggle Donor Visibility

**Endpoint:** `PUT /api/donor-wall/:id/toggle-visibility`

**Description:** Toggle the visibility of a donor on the public wall

**URL Parameters:**
- `id` (String, required) - Donor ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Donor shown successfully",
  "data": {
    "_id": "65c1234567890abcdef12345",
    "fullName": "Rajesh Kumar",
    "isVisible": true,
    "updatedAt": "2024-02-06T12:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Donor not found"
}
```

---

### 9. Delete Donor

**Endpoint:** `DELETE /api/donor-wall/:id`

**Description:** Delete a donor from the wall

**URL Parameters:**
- `id` (String, required) - Donor ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Donor deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Donor not found"
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Auto-Tier Assignment Logic

When a donor is created or updated with a new amount, the tier is automatically assigned based on the following rules:

```javascript
if (amount >= 100000) {
    tier = 'Platinum';
} else if (amount >= 50000) {
    tier = 'Gold';
} else if (amount >= 25000) {
    tier = 'Silver';
} else if (amount >= 10000) {
    tier = 'Bronze';
} else {
    tier = 'Supporter';
}
```

This can be overridden by explicitly providing a `tier` value in the request.

---

## Avatar Initials Generation

Avatar initials are automatically generated from the donor's full name:

- **Two or more names**: First letter of first name + First letter of last name
  - Example: "Rajesh Kumar" → "RK"
- **Single name**: First two letters
  - Example: "Rajesh" → "RA"

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Create a new donor
const createDonor = async () => {
  const response = await fetch('http://localhost:5000/api/donor-wall', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fullName: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      amount: 50000,
      campaign: 'Build a School',
      isVisible: true
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Get all donors with filters
const getDonors = async () => {
  const response = await fetch('http://localhost:5000/api/donor-wall?tier=Gold&isVisible=true&page=1');
  const data = await response.json();
  console.log(data);
};

// Update a donor
const updateDonor = async (id) => {
  const response = await fetch(`http://localhost:5000/api/donor-wall/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 75000
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Toggle visibility
const toggleVisibility = async (id) => {
  const response = await fetch(`http://localhost:5000/api/donor-wall/${id}/toggle-visibility`, {
    method: 'PUT'
  });
  
  const data = await response.json();
  console.log(data);
};

// Delete a donor
const deleteDonor = async (id) => {
  const response = await fetch(`http://localhost:5000/api/donor-wall/${id}`, {
    method: 'DELETE'
  });
  
  const data = await response.json();
  console.log(data);
};

// Get statistics
const getStats = async () => {
  const response = await fetch('http://localhost:5000/api/donor-wall/stats');
  const data = await response.json();
  console.log(data);
};
```

---

## Best Practices

1. **Always validate email addresses** before submitting
2. **Use appropriate tier assignment** or let the system auto-assign
3. **Respect donor privacy** - use anonymous and visibility settings appropriately
4. **Keep messages concise** - max 500 characters
5. **Use internal notes** for admin-only information
6. **Regularly backup donor data** for compliance
7. **Monitor statistics** to understand donation patterns
8. **Handle PAN numbers securely** as per data protection regulations

---

## Security Considerations

1. **Input Validation:** All inputs are validated before processing
2. **Email Validation:** Email format is checked
3. **XSS Protection:** User inputs are sanitized
4. **CORS:** Configured for specific origins in production
5. **Error Messages:** Sensitive information is not exposed in error messages
6. **Data Privacy:** PAN numbers and personal information are handled securely

---

## Rate Limiting

Currently, there are no rate limits implemented. For production use, consider implementing:
- Request throttling
- IP-based rate limiting
- Authentication-based quotas

---

**Last Updated:** February 6, 2026
**API Version:** 1.0.0
