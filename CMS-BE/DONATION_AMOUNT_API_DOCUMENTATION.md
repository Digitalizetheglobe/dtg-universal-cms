# Donation Amount Cards API Documentation

## Base URL
```
/api/donation-amounts
```

---

## 1. Create a New Card
**POST** `/api/donation-amounts`  
**Authentication:** Required (Bearer Token)

### Request Body for Gift Future / Gift Learning
```json
{
  "category": "giftFuture",
  "text": "Donate for Future Generation",
  "yearText": "2024-2025",
  "amount": 5000
}
```

### Request Body for Food:
```json
{
  "category": "food",
  "text": "Feed the Needy",
  "amount": 2000
}
```

### Response (Success - 201):
```json
{
  "success": true,
  "message": "Donation card created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "category": "giftFuture",
    "text": "Donate for Future Generation",
    "yearText": "2024-2025",
    "amount": 5000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 2. Get All Cards (Grouped by Category)
**GET** `/api/donation-amounts/grouped/by-category`  
**Authentication:** Not Required

### Response (Success - 200):
```json
{
  "success": true,
  "data": {
    "giftFuture": [
      {
        "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
        "category": "giftFuture",
        "text": "Donate for Future Generation",
        "yearText": "2024-2025",
        "amount": 5000,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "giftLearning": [
      {
        "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
        "category": "giftLearning",
        "text": "Support Education",
        "yearText": "2024",
        "amount": 3000,
        "createdAt": "2024-01-15T11:00:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "food": [
      {
        "_id": "65a1b2c3d4e5f6a7b8c9d0e3",
        "category": "food",
        "text": "Feed the Needy",
        "amount": 2000,
        "createdAt": "2024-01-15T11:30:00.000Z",
        "updatedAt": "2024-01-15T11:30:00.000Z"
      }
    ]
  }
}
```

---

## 3. Get Cards by Category
**GET** `/api/donation-amounts/category/:category`  
**Authentication:** Not Required  
**Categories:** `giftFuture`, `giftLearning`, `food`

### Example:
```
GET /api/donation-amounts/category/giftFuture
```

### Response (Success - 200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "category": "giftFuture",
      "text": "Donate for Future Generation",
      "yearText": "2024-2025",
      "amount": 5000,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e4",
      "category": "giftFuture",
      "text": "Building Tomorrow",
      "yearText": "2025",
      "amount": 10000,
      "createdAt": "2024-01-16T09:00:00.000Z",
      "updatedAt": "2024-01-16T09:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

## 4. Get All Cards (Optional Query Filter)
**GET** `/api/donation-amounts?category=giftFuture`  
**Authentication:** Not Required

### Query Parameters:
- `category` (optional): Filter by category (`giftFuture`, `giftLearning`, `food`)

### Example:
```
GET /api/donation-amounts?category=food
```

### Response (Success - 200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e3",
      "category": "food",
      "text": "Feed the Needy",
      "amount": 2000,
      "createdAt": "2024-01-15T11:30:00.000Z",
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 5. Get Single Card by ID
**GET** `/api/donation-amounts/:id`  
**Authentication:** Not Required

### Example:
```
GET /api/donation-amounts/65a1b2c3d4e5f6a7b8c9d0e1
```

### Response (Success - 200):
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "category": "giftFuture",
    "text": "Donate for Future Generation",
    "yearText": "2024-2025",
    "amount": 5000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 6. Update a Card
**PUT** `/api/donation-amounts/:id`  
**Authentication:** Required (Bearer Token)

### Request Body for Gift Future / Gift Learning:
```json
{
  "text": "Updated Text",
  "yearText": "2025-2026",
  "amount": 7500
}
```

### Request Body for Food:
```json
{
  "text": "Updated Food Text",
  "amount": 3000
}
```

### Response (Success - 200):
```json
{
  "success": true,
  "message": "Card updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "category": "giftFuture",
    "text": "Updated Text",
    "yearText": "2025-2026",
    "amount": 7500,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## 7. Delete a Card
**DELETE** `/api/donation-amounts/:id`  
**Authentication:** Required (Bearer Token)

### Example:
```
DELETE /api/donation-amounts/65a1b2c3d4e5f6a7b8c9d0e1
```

### Response (Success - 200):
```json
{
  "success": true,
  "message": "Card deleted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "category": "giftFuture",
    "text": "Donate for Future Generation",
    "yearText": "2024-2025",
    "amount": 5000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Error Responses

### 400 Bad Request:
```json
{
  "success": false,
  "message": "Invalid category. Must be giftFuture, giftLearning, or food"
}
```

### 401 Unauthorized:
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 404 Not Found:
```json
{
  "success": false,
  "message": "Card not found"
}
```

### 500 Server Error:
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details here"
}
```

---

## Authentication Header

For protected endpoints, include the Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Field Requirements

### Gift Future / Gift Learning:
- `category`: Required (must be "giftFuture" or "giftLearning")
- `text`: Required (string)
- `yearText`: Required (string)
- `amount`: Required (number, min: 0)

### Food:
- `category`: Required (must be "food")
- `text`: Required (string)
- `amount`: Required (number, min: 0)
- `yearText`: Not applicable

