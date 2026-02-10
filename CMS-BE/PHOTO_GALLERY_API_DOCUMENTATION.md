# Photo Gallery API Documentation

## Overview
This API manages photo gallery functionality for the CMS, including uploading, retrieving, updating, and deleting photos.

## Base URL
```
http://localhost:5000/api/photo-gallery
```

## Endpoints

### 1. Create Photo
**POST** `/api/photo-gallery`

Upload a new photo to the gallery.

**Request Type:** `multipart/form-data`

**Body Parameters:**
- `imageTitle` (string, required): Title of the photo
- `description` (string, optional): Description of the photo
- `category` (string, required): Category of the photo
  - Options: 'Events', 'Campaigns', 'Festivals', 'Community Service', 'Temple Activities', 'Other'
- `publishDate` (date, optional): Publication date (defaults to current date)
- `featured` (boolean, optional): Whether the photo is featured (defaults to false)
- `image` (file, required): Image file (Max 5MB, formats: JPG, PNG, GIF, WebP)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "imageTitle": "Annual Day Celebration 2024",
    "description": "Community gathering for annual celebration",
    "category": "Events",
    "imageUrl": "/uploads/photos/photo-1234567890-123456789.jpg",
    "publishDate": "2024-02-06T00:00:00.000Z",
    "featured": false,
    "viewCount": 0,
    "status": "active",
    "createdAt": "2024-02-06T08:30:00.000Z",
    "updatedAt": "2024-02-06T08:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Image title and category are required"
}
```

---

### 2. Get All Photos
**GET** `/api/photo-gallery`

Retrieve all photos with optional filtering and pagination.

**Query Parameters:**
- `category` (string, optional): Filter by category
- `featured` (boolean, optional): Filter by featured status
- `status` (string, optional): Filter by status ('active' or 'inactive')
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 12)

**Example Request:**
```
GET /api/photo-gallery?category=Events&featured=true&page=1&limit=12
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "imageTitle": "Annual Day Celebration 2024",
      "description": "Community gathering for annual celebration",
      "category": "Events",
      "imageUrl": "/uploads/photos/photo-1234567890-123456789.jpg",
      "publishDate": "2024-02-06T00:00:00.000Z",
      "featured": true,
      "viewCount": 45,
      "status": "active",
      "createdAt": "2024-02-06T08:30:00.000Z",
      "updatedAt": "2024-02-06T08:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 60,
    "itemsPerPage": 12
  }
}
```

---

### 3. Get Photo by ID
**GET** `/api/photo-gallery/:id`

Retrieve a single photo by its ID. This also increments the view count.

**URL Parameters:**
- `id` (string, required): Photo ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "imageTitle": "Annual Day Celebration 2024",
    "description": "Community gathering for annual celebration",
    "category": "Events",
    "imageUrl": "/uploads/photos/photo-1234567890-123456789.jpg",
    "publishDate": "2024-02-06T00:00:00.000Z",
    "featured": true,
    "viewCount": 46,
    "status": "active",
    "createdAt": "2024-02-06T08:30:00.000Z",
    "updatedAt": "2024-02-06T08:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Photo not found"
}
```

---

### 4. Update Photo
**PUT** `/api/photo-gallery/:id`

Update an existing photo.

**Request Type:** `multipart/form-data`

**URL Parameters:**
- `id` (string, required): Photo ID

**Body Parameters:**
- `imageTitle` (string, optional): Updated title
- `description` (string, optional): Updated description
- `category` (string, optional): Updated category
- `publishDate` (date, optional): Updated publish date
- `featured` (boolean, optional): Updated featured status
- `status` (string, optional): Updated status ('active' or 'inactive')
- `image` (file, optional): New image file (replaces existing)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Photo updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "imageTitle": "Updated Title",
    "description": "Updated description",
    "category": "Campaigns",
    "imageUrl": "/uploads/photos/photo-1234567890-987654321.jpg",
    "publishDate": "2024-02-06T00:00:00.000Z",
    "featured": true,
    "viewCount": 46,
    "status": "active",
    "createdAt": "2024-02-06T08:30:00.000Z",
    "updatedAt": "2024-02-06T09:00:00.000Z"
  }
}
```

---

### 5. Delete Photo
**DELETE** `/api/photo-gallery/:id`

Delete a photo from the gallery. This also deletes the associated image file.

**URL Parameters:**
- `id` (string, required): Photo ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Photo not found"
}
```

---

### 6. Get Featured Photos
**GET** `/api/photo-gallery/featured`

Retrieve all featured photos (limited to 10).

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "imageTitle": "Annual Day Celebration 2024",
      "description": "Community gathering for annual celebration",
      "category": "Events",
      "imageUrl": "/uploads/photos/photo-1234567890-123456789.jpg",
      "publishDate": "2024-02-06T00:00:00.000Z",
      "featured": true,
      "viewCount": 45,
      "status": "active"
    }
  ]
}
```

---

### 7. Get Photos by Category
**GET** `/api/photo-gallery/category/:category`

Retrieve all photos in a specific category with pagination.

**URL Parameters:**
- `category` (string, required): Category name

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 12)

**Example Request:**
```
GET /api/photo-gallery/category/Events?page=1&limit=12
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "imageTitle": "Annual Day Celebration 2024",
      "category": "Events",
      "imageUrl": "/uploads/photos/photo-1234567890-123456789.jpg",
      "publishDate": "2024-02-06T00:00:00.000Z",
      "featured": true,
      "viewCount": 45,
      "status": "active"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 35,
    "itemsPerPage": 12
  }
}
```

---

## Data Model

### PhotoGallery Schema
```javascript
{
  imageTitle: String (required),
  description: String,
  category: String (required, enum),
  imageUrl: String (required),
  publishDate: Date (default: now),
  featured: Boolean (default: false),
  viewCount: Number (default: 0),
  status: String (enum: 'active', 'inactive', default: 'active'),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## File Upload Configuration

- **Allowed formats:** JPG, JPEG, PNG, GIF, WebP
- **Max file size:** 5MB
- **Upload directory:** `/public/uploads/photos/`
- **File naming:** `photo-{timestamp}-{random}.{extension}`

## Error Codes

- **200:** Success
- **201:** Created successfully
- **400:** Bad request (validation error)
- **404:** Resource not found
- **500:** Internal server error

## Notes

1. All image files are stored in `/public/uploads/photos/` directory
2. Image URLs are relative paths starting with `/uploads/photos/`
3. When deleting a photo, the associated image file is also deleted
4. When updating a photo with a new image, the old image file is deleted
5. View count is automatically incremented when fetching a single photo by ID
6. Photos are sorted by featured status (featured first) and then by publish date (newest first)
