# Video Gallery API Documentation

Complete API documentation for the Video Gallery management system.

## Base URL

```
http://localhost:5000/api/video-gallery
```

## Data Model

### VideoGallery Schema

```javascript
{
  _id: ObjectId,
  videoTitle: String (required),
  description: String,
  category: String (required, enum),
  videoUrl: String (required),
  thumbnailUrl: String,
  duration: String,
  publishDate: Date (default: now),
  featured: Boolean (default: false),
  viewCount: Number (default: 0),
  status: String (enum: 'active', 'inactive', default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

### Category Options
- Events
- Campaigns
- Festivals
- Community Service
- Temple Activities
- Other

## API Endpoints

### 1. Create Video

**Endpoint:** `POST /api/video-gallery`

**Description:** Add a new video to the gallery

**Request Body:**
```json
{
  "videoTitle": "Annual Day Celebration 2024",
  "description": "Highlights from our Annual Day celebration",
  "category": "Events",
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "duration": "12:45",
  "publishDate": "2024-02-06",
  "featured": true
}
```

**Required Fields:**
- `videoTitle` (String)
- `category` (String, must be one of the enum values)
- `videoUrl` (String, valid URL)

**Optional Fields:**
- `description` (String)
- `thumbnailUrl` (String, valid URL)
- `duration` (String, format: MM:SS or HH:MM:SS)
- `publishDate` (Date, ISO format)
- `featured` (Boolean)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Video added successfully",
  "data": {
    "_id": "65c1234567890abcdef12345",
    "videoTitle": "Annual Day Celebration 2024",
    "description": "Highlights from our Annual Day celebration",
    "category": "Events",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "duration": "12:45",
    "publishDate": "2024-02-06T00:00:00.000Z",
    "featured": true,
    "viewCount": 0,
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
  "message": "Video title, category, and video URL are required"
}
```

---

### 2. Get All Videos

**Endpoint:** `GET /api/video-gallery`

**Description:** Retrieve all videos with optional filtering and pagination

**Query Parameters:**
- `category` (String, optional) - Filter by category
- `featured` (Boolean, optional) - Filter by featured status (true/false)
- `status` (String, optional) - Filter by status (active/inactive)
- `page` (Number, optional, default: 1) - Page number
- `limit` (Number, optional, default: 12) - Items per page

**Example Request:**
```
GET /api/video-gallery?category=Events&featured=true&page=1&limit=12
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65c1234567890abcdef12345",
      "videoTitle": "Annual Day Celebration 2024",
      "description": "Highlights from our Annual Day celebration",
      "category": "Events",
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "duration": "12:45",
      "publishDate": "2024-02-06T00:00:00.000Z",
      "featured": true,
      "viewCount": 150,
      "status": "active",
      "createdAt": "2024-02-06T10:30:00.000Z",
      "updatedAt": "2024-02-06T10:30:00.000Z"
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

### 3. Get Video Statistics

**Endpoint:** `GET /api/video-gallery/stats`

**Description:** Get overall statistics for the video gallery

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalVideos": 45,
    "featuredVideos": 8,
    "totalViews": 12450,
    "totalCategories": 5
  }
}
```

---

### 4. Get Featured Videos

**Endpoint:** `GET /api/video-gallery/featured`

**Description:** Get all featured videos (limited to 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65c1234567890abcdef12345",
      "videoTitle": "Annual Day Celebration 2024",
      "category": "Events",
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "featured": true,
      "viewCount": 150
    }
  ]
}
```

---

### 5. Get Videos by Category

**Endpoint:** `GET /api/video-gallery/category/:category`

**Description:** Get all videos in a specific category

**URL Parameters:**
- `category` (String, required) - Category name

**Query Parameters:**
- `page` (Number, optional, default: 1)
- `limit` (Number, optional, default: 12)

**Example Request:**
```
GET /api/video-gallery/category/Events?page=1&limit=12
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65c1234567890abcdef12345",
      "videoTitle": "Annual Day Celebration 2024",
      "category": "Events",
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "viewCount": 150
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 18,
    "itemsPerPage": 12
  }
}
```

---

### 6. Get Single Video

**Endpoint:** `GET /api/video-gallery/:id`

**Description:** Get a single video by ID (increments view count)

**URL Parameters:**
- `id` (String, required) - Video ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65c1234567890abcdef12345",
    "videoTitle": "Annual Day Celebration 2024",
    "description": "Highlights from our Annual Day celebration",
    "category": "Events",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "duration": "12:45",
    "publishDate": "2024-02-06T00:00:00.000Z",
    "featured": true,
    "viewCount": 151,
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
  "message": "Video not found"
}
```

---

### 7. Update Video

**Endpoint:** `PUT /api/video-gallery/:id`

**Description:** Update an existing video

**URL Parameters:**
- `id` (String, required) - Video ID

**Request Body:** (All fields optional)
```json
{
  "videoTitle": "Updated Title",
  "description": "Updated description",
  "category": "Campaigns",
  "videoUrl": "https://www.youtube.com/watch?v=newVideoId",
  "thumbnailUrl": "https://example.com/new-thumbnail.jpg",
  "duration": "15:30",
  "publishDate": "2024-02-07",
  "featured": false,
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": {
    "_id": "65c1234567890abcdef12345",
    "videoTitle": "Updated Title",
    "description": "Updated description",
    "category": "Campaigns",
    "videoUrl": "https://www.youtube.com/watch?v=newVideoId",
    "thumbnailUrl": "https://example.com/new-thumbnail.jpg",
    "duration": "15:30",
    "publishDate": "2024-02-07T00:00:00.000Z",
    "featured": false,
    "viewCount": 151,
    "status": "active",
    "createdAt": "2024-02-06T10:30:00.000Z",
    "updatedAt": "2024-02-06T11:45:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video not found"
}
```

---

### 8. Delete Video

**Endpoint:** `DELETE /api/video-gallery/:id`

**Description:** Delete a video from the gallery

**URL Parameters:**
- `id` (String, required) - Video ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video not found"
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

## Video URL Formats

### Supported Platforms

#### YouTube
- Standard: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short: `https://youtu.be/VIDEO_ID`
- Embed: `https://www.youtube.com/embed/VIDEO_ID`

#### Vimeo
- Standard: `https://vimeo.com/VIDEO_ID`
- Player: `https://player.vimeo.com/video/VIDEO_ID`

---

## Thumbnail Handling

### Automatic Thumbnail Extraction

For YouTube videos, if no `thumbnailUrl` is provided, the system can automatically extract the thumbnail using:

```
https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg
```

Quality options:
- `default.jpg` - 120x90
- `mqdefault.jpg` - 320x180 (medium quality)
- `hqdefault.jpg` - 480x360 (high quality)
- `sddefault.jpg` - 640x480 (standard definition)
- `maxresdefault.jpg` - 1280x720 (maximum resolution)

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Create a new video
const createVideo = async () => {
  const response = await fetch('http://localhost:5000/api/video-gallery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      videoTitle: 'My Video',
      category: 'Events',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      featured: true
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Get all videos
const getVideos = async () => {
  const response = await fetch('http://localhost:5000/api/video-gallery?category=Events&page=1');
  const data = await response.json();
  console.log(data);
};

// Update a video
const updateVideo = async (id) => {
  const response = await fetch(`http://localhost:5000/api/video-gallery/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      featured: false
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Delete a video
const deleteVideo = async (id) => {
  const response = await fetch(`http://localhost:5000/api/video-gallery/${id}`, {
    method: 'DELETE'
  });
  
  const data = await response.json();
  console.log(data);
};
```

---

## Best Practices

1. **Always validate video URLs** before submitting
2. **Use appropriate categories** for better organization
3. **Provide custom thumbnails** for better visual appeal
4. **Set featured status** for important videos
5. **Include duration** for better user experience
6. **Use descriptive titles** for SEO and accessibility
7. **Monitor view counts** to understand engagement
8. **Regularly update** outdated videos

---

## Rate Limiting

Currently, there are no rate limits implemented. For production use, consider implementing:
- Request throttling
- IP-based rate limiting
- Authentication-based quotas

---

## Security Considerations

1. **Input Validation:** All inputs are validated before processing
2. **URL Validation:** Video URLs are checked for valid format
3. **XSS Protection:** User inputs are sanitized
4. **CORS:** Configured for specific origins in production
5. **Error Messages:** Sensitive information is not exposed in error messages

---

**Last Updated:** February 6, 2026
**API Version:** 1.0.0
