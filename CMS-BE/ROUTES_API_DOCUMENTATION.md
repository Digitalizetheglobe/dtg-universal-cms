# 🚀 Universal CMS Backend API Documentation

Welcome to the Universal CMS Backend API! This documentation provides comprehensive information about all available endpoints, request/response formats, and usage examples.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Blogs API](#blogs-api)
- [Team Management API](#team-management-api)
- [Events API](#events-api)
- [Forms API](#forms-api)
- [Testimonials API](#testimonials-api)
- [Announcements API](#announcements-api)
- [Email Templates API](#email-templates-api)
- [File Upload API](#file-upload-api)
- [Error Responses](#error-responses)

---

## 🌐 Base URL

```
http://localhost:5000/api
```

---

## 🔐 Authentication

Most endpoints require authentication. Include the following header in your requests:

```http
Authorization: Bearer <your-jwt-token>
```

---

## 📝 Blogs API

### Get All Blogs
```http
GET /blogs
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Getting Started with React",
      "slug": "getting-started-with-react",
      "content": "React is a JavaScript library for building user interfaces...",
      "excerpt": "Learn the basics of React development...",
      "coverImage": "https://example.com/images/react-cover.jpg",
      "tags": ["react", "javascript", "frontend"],
      "categories": ["programming", "tutorial"],
      "isPublished": true,
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "views": 1250,
      "likes": 45,
      "readTime": 8,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### Get Blog by Slug
```http
GET /blogs/slug/{slug}
```

### Get Blog by ID
```http
GET /blogs/{id}
```

### Create New Blog
```http
POST /blogs
```

**Request Body:**
```json
{
  "title": "Advanced React Patterns",
  "slug": "advanced-react-patterns",
  "content": "In this article, we'll explore advanced React patterns...",
  "excerpt": "Discover powerful React patterns for building scalable applications...",
  "coverImage": "https://example.com/images/advanced-react.jpg",
  "tags": ["react", "patterns", "advanced"],
  "categories": ["programming", "advanced"],
  "isPublished": false,
  "metaTitle": "Advanced React Patterns - Complete Guide",
  "metaDescription": "Learn advanced React patterns for building scalable applications",
  "ogTitle": "Advanced React Patterns",
  "ogDescription": "Complete guide to advanced React patterns",
  "ogImage": "https://example.com/images/og-react-patterns.jpg",
  "readTime": 12
}
```

### Update Blog
```http
PUT /blogs/{id}
```

### Delete Blog
```http
DELETE /blogs/{id}
```

### Increment Blog Views
```http
PATCH /blogs/{id}/views
```

### Toggle Blog Like
```http
PATCH /blogs/{id}/like
```

---

## 👥 Team Management API

### Get All Team Members
```http
GET /team
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fullName": "John Doe",
      "designation": "Senior Software Engineer",
      "photo": "https://example.com/uploads/team/john-doe-1234567890.jpg",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Active Team Members
```http
GET /team/active
```

### Get Team Member by ID
```http
GET /team/{id}
```

### Create Team Member
```http
POST /team
```

**Request Body (multipart/form-data):**
```json
{
  "fullName": "Jane Smith",
  "designation": "Product Manager",
  "linkedinUrl": "https://linkedin.com/in/janesmith",
  "photo": "[file upload]"
}
```

### Update Team Member
```http
PUT /team/{id}
```

### Delete Team Member
```http
DELETE /team/{id}
```

### Toggle Active Status
```http
PATCH /team/{id}/toggle-status
```

---

## 📅 Events API

### Get All Events
```http
GET /events
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Tech Conference 2024",
      "description": "Join us for the biggest tech conference...",
      "date": "2024-03-15T09:00:00.000Z",
      "location": "San Francisco, CA",
      "country": "USA",
      "month": "March",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Events by Country
```http
GET /events/country/{country}
```

### Get Events by Month
```http
GET /events/month/{month}
```

### Get Event by ID
```http
GET /events/{id}
```

### Create New Event
```http
POST /events
```

**Request Body:**
```json
{
  "title": "Web Development Workshop",
  "description": "Learn modern web development techniques...",
  "date": "2024-04-20T14:00:00.000Z",
  "location": "New York, NY",
  "country": "USA",
  "isActive": true
}
```

### Update Event
```http
PUT /events/{id}
```

### Delete Event
```http
DELETE /events/{id}
```

---

## 📋 Forms API

### Get All Forms
```http
GET /forms/forms
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Contact Form",
      "description": "Get in touch with us",
      "fields": [
        {
          "name": "fullName",
          "label": "Full Name",
          "type": "text",
          "required": true
        },
        {
          "name": "email",
          "label": "Email Address",
          "type": "email",
          "required": true
        }
      ],
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Form by Page
```http
GET /forms/forms/page/{page}
```

### Get Form by ID
```http
GET /forms/forms/{id}
```

### Create Form
```http
POST /forms/forms
```

**Request Body:**
```json
{
  "title": "Job Application Form",
  "description": "Apply for open positions",
  "fields": [
    {
      "name": "firstName",
      "label": "First Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your first name"
    },
    {
      "name": "lastName",
      "label": "Last Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your last name"
    },
    {
      "name": "email",
      "label": "Email",
      "type": "email",
      "required": true,
      "placeholder": "Enter your email"
    },
    {
      "name": "experience",
      "label": "Years of Experience",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 50
    },
    {
      "name": "resume",
      "label": "Resume",
      "type": "file",
      "required": true,
      "accept": ".pdf,.doc,.docx"
    }
  ],
  "isActive": true
}
```

### Update Form
```http
PUT /forms/forms/{id}
```

### Delete Form
```http
DELETE /forms/forms/{id}
```

### Submit Form
```http
POST /forms/forms/{formId}/submit
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "experience": 5,
  "resume": "[file upload]"
}
```

### Get Form Submissions
```http
GET /forms/forms/{formId}/submissions
```

### Get Submission by ID
```http
GET /forms/submissions/{id}
```

### Delete Submission
```http
DELETE /forms/submissions/{id}
```

---

## 💬 Testimonials API

### Get All Testimonials
```http
GET /testimonials
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Sarah Johnson",
      "position": "CEO, TechCorp",
      "content": "Amazing service and support team!",
      "rating": 5,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Add Testimonial
```http
POST /testimonials
```

**Request Body:**
```json
{
  "name": "Michael Brown",
  "position": "CTO, Innovation Labs",
  "content": "Outstanding quality and professional service!",
  "rating": 5,
  "isActive": true
}
```

### Update Testimonial
```http
PUT /testimonials/{id}
```

### Delete Testimonial
```http
DELETE /testimonials/{id}
```

---

## 📢 Announcements API

### Get All Announcements
```http
GET /announcements
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "System Maintenance Notice",
      "content": "Scheduled maintenance on Sunday...",
      "priority": "high",
      "isActive": true,
      "expiresAt": "2024-01-20T23:59:59.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Announcement by ID
```http
GET /announcements/{id}
```

### Create Announcement
```http
POST /announcements
```

**Request Body:**
```json
{
  "title": "New Feature Release",
  "content": "We're excited to announce our new dashboard feature!",
  "priority": "medium",
  "isActive": true,
  "expiresAt": "2024-02-15T23:59:59.000Z"
}
```

### Update Announcement
```http
PUT /announcements/{id}
```

### Delete Announcement
```http
DELETE /announcements/{id}
```

---

## 📧 Email Templates API

### Get All Email Templates
```http
GET /email-templates
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Welcome Email",
      "subject": "Welcome to Our Platform!",
      "content": "<h1>Welcome {{name}}!</h1><p>Thank you for joining us...</p>",
      "variables": ["name", "email"],
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Email Template by ID
```http
GET /email-templates/{id}
```

### Create Email Template
```http
POST /email-templates
```

**Request Body:**
```json
{
  "name": "Password Reset",
  "subject": "Reset Your Password",
  "content": "<h2>Hello {{name}},</h2><p>Click the link below to reset your password:</p><a href='{{resetLink}}'>Reset Password</a>",
  "variables": ["name", "resetLink"],
  "isActive": true
}
```

### Update Email Template
```http
PUT /email-templates/{id}
```

### Delete Email Template
```http
DELETE /email-templates/{id}
```

---

## 📁 File Upload API

### Upload Single Image
```http
POST /upload/single
```

**Request Body (multipart/form-data):**
```
image: [file upload]
```

**Response:**
```json
{
  "url": "http://localhost:5000/blogimages/image-1234567890.jpg",
  "filename": "image-1234567890.jpg"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Something went wrong!",
  "error": "Database connection failed"
}
```

---

## 🔧 Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file with:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Start Production Server:**
   ```bash
   npm start
   ```

---

## 📊 API Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

*Last updated: January 2024*
