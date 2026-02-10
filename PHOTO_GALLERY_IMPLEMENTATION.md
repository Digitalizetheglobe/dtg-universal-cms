# Photo Gallery Implementation Summary

## Overview
A complete photo gallery management system has been implemented for the DTG Universal CMS. This allows administrators to upload, manage, and display photos organized by categories.

## Files Created

### Frontend (CMS-FE)

1. **PhotoGalleryForm.jsx** (`/src/PhotoGallery/PhotoGalleryForm.jsx`)
   - Complete form for uploading and editing photos
   - Features:
     - dual-mode (Create/Edit) based on URL route
     - Pre-filling data in Edit mode
     - Image title and description fields
     - Category selection (Events, Campaigns, Festivals, etc.)
     - Publish date picker
     - Image file upload with preview
     - Featured photo toggle
     - Real-time preview sidebar
     - Form validation
     - File size validation (max 5MB)
     - File type validation (images only)

2. **PhotoGalleryList.jsx** (`/src/PhotoGallery/PhotoGalleryList.jsx`)
   - Grid view of all photos
   - Features:
     - Filter by category
     - Filter by featured status
     - Photo cards with image, title, category, and metadata
     - View and delete actions
     - Responsive grid layout
     - Empty state handling
     - Loading states

### Backend (CMS-BE)

3. **PhotoGallery.js** (`/models/PhotoGallery.js`)
   - MongoDB schema for photo gallery
   - Fields:
     - imageTitle (required)
     - description
     - category (required, enum)
     - imageUrl (required)
     - publishDate
     - featured (boolean)
     - viewCount (auto-incremented)
     - status (active/inactive)
     - timestamps (auto-generated)

4. **photoGalleryController.js** (`/controllers/photoGalleryController.js`)
   - Complete CRUD operations
   - Functions:
     - createPhoto: Upload new photo with image file
     - getAllPhotos: Get all photos with filtering and pagination
     - getPhotoById: Get single photo (increments view count)
     - updatePhoto: Update photo details and/or image
     - deletePhoto: Delete photo and associated file
     - getFeaturedPhotos: Get featured photos only
     - getPhotosByCategory: Get photos by category with pagination

5. **photoGalleryRoutes.js** (`/routes/photoGalleryRoutes.js`)
   - Express routes with multer middleware
   - Features:
     - Image upload handling
     - File validation (type and size)
     - Automatic directory creation
     - RESTful API endpoints

6. **PHOTO_GALLERY_API_DOCUMENTATION.md** (`/PHOTO_GALLERY_API_DOCUMENTATION.md`)
   - Complete API documentation
   - Includes all endpoints, request/response examples, and data models

### Configuration Updates

7. **server.js** (Updated)
   - Added photo gallery routes: `/api/photo-gallery`

8. **App.jsx** (Updated)
   - Added PhotoGalleryForm and PhotoGalleryList imports
   - Added routes:
     - `/photo-gallery` - List view
     - `/photo-gallery/create` - Create form

## API Endpoints

```
POST   /api/photo-gallery                    - Create new photo
GET    /api/photo-gallery                    - Get all photos (with filters)
GET    /api/photo-gallery/featured           - Get featured photos
GET    /api/photo-gallery/category/:category - Get photos by category
GET    /api/photo-gallery/:id                - Get single photo
PUT    /api/photo-gallery/:id                - Update photo
DELETE /api/photo-gallery/:id                - Delete photo
```

## How to Use

### For Administrators:

1. **Access Photo Gallery:**
   - Navigate to `/photo-gallery` to view all photos
   - Click the "Add New Photo" button or the "+" button in the DonationKitManagement dashboard

2. **Upload a Photo:**
   - Fill in the image title (required)
   - Add a description (optional)
   - Select a category (required)
   - Choose a publish date
   - Upload an image file (max 5MB)
   - Toggle "Featured" if you want it highlighted
   - Click "Save"

3. **Manage Photos:**
   - Filter by category or featured status
   - View photos in a grid layout
   - Click "View" to open the full image
   - Click "Edit" to modify details or replace the image
   - Click "Delete" to remove a photo

4. **Edit a Photo:**
   - Click the "Edit" button on any photo card
   - Modify the title, description, category, or publish date
   - Toggle the "Featured" status
   - Optionally upload a new image to replace the current one
   - Click "Save" to update

### For Developers:

1. **Start the Backend:**
   ```bash
   cd CMS-BE
   npm start
   ```

2. **Start the Frontend:**
   ```bash
   cd CMS-FE
   npm start
   ```

3. **Access the Photo Gallery:**
   - Navigate to `http://localhost:3000/photo-gallery`

## Features

### Frontend Features:
- ✅ Beautiful, modern UI with responsive design
- ✅ Real-time image preview
- ✅ Form validation
- ✅ File size and type validation
- ✅ Category filtering
- ✅ Featured photo filtering
- ✅ Grid layout for photos
- ✅ Loading and error states
- ✅ Empty state handling

### Backend Features:
- ✅ Image upload with multer
- ✅ File validation (type and size)
- ✅ Automatic directory creation
- ✅ CRUD operations
- ✅ Pagination support
- ✅ Category filtering
- ✅ Featured photo filtering
- ✅ View count tracking
- ✅ Automatic file cleanup on delete/update
- ✅ Error handling

## Database Schema

```javascript
{
  imageTitle: String,        // Required
  description: String,       // Optional
  category: String,          // Required (enum)
  imageUrl: String,          // Auto-generated
  publishDate: Date,         // Default: now
  featured: Boolean,         // Default: false
  viewCount: Number,         // Default: 0, auto-incremented
  status: String,            // 'active' or 'inactive'
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

## Categories Available:
- Events
- Campaigns
- Festivals
- Community Service
- Temple Activities
- Other

## File Upload Configuration:
- **Max Size:** 5MB
- **Allowed Types:** JPG, JPEG, PNG, GIF, WebP
- **Storage Location:** `/public/uploads/photos/`
- **Naming Convention:** `photo-{timestamp}-{random}.{extension}`

## Integration with DonationKitManagement

The "+" button on the Photo Gallery card in the DonationKitManagement dashboard now navigates to `/photo-gallery/create`, allowing quick access to upload new photos.

## Next Steps (Optional Enhancements):

1. **Bulk Upload:** Allow uploading multiple photos at once
2. **Image Editing:** Add basic image editing capabilities (crop, resize, filters)
3. **Albums/Collections:** Group photos into albums
4. **Tags:** Add tagging system for better organization
5. **Search:** Add search functionality by title/description
6. **Lightbox:** Add lightbox view for full-screen image viewing
7. **Drag & Drop:** Add drag-and-drop upload functionality
8. **Image Optimization:** Automatically optimize images on upload
9. **CDN Integration:** Integrate with CDN for faster image delivery
10. **Social Sharing:** Add social media sharing buttons

## Testing

To test the implementation:

1. Start both backend and frontend servers
2. Navigate to `/photo-gallery`
3. Click "Add New Photo"
4. Fill in the form and upload an image
5. Verify the photo appears in the gallery list
6. Test filtering by category and featured status
7. Test view and delete actions

## Notes

- All uploaded images are stored in the `/public/uploads/photos/` directory
- Image URLs are relative paths starting with `/uploads/photos/`
- When deleting a photo, the associated image file is automatically deleted
- When updating a photo with a new image, the old image file is automatically deleted
- View count is automatically incremented when viewing a single photo
- Photos are sorted by featured status (featured first) and then by publish date (newest first)
