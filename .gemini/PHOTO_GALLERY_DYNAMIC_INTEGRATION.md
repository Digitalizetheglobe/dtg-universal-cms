# Photo Gallery Dynamic Integration

## Overview
Successfully converted the Next.js photo gallery page from static data to dynamic API-based data fetching.

## Changes Made

### 1. **Next.js Frontend (page.tsx)**

#### API Integration
- Added API base URL configuration: `http://localhost:5000/api`
- Updated `Photo` interface to match backend schema:
  - `_id` instead of `id`
  - `imageUrl` instead of `url`
  - `imageTitle` instead of `title`
  - `publishDate` instead of `date`
  - Added `viewCount` field
  - Added `featured` field

#### State Management
- Added `photos` state to store fetched data
- Added `loading` state for loading indicator
- Added `error` state for error handling

#### Data Fetching
- Created `fetchPhotos()` function to fetch from API
- Implemented auto-refresh every 30 seconds to show new photos without page reload
- Added `useEffect` hook for initial data fetch and interval setup

#### Category Mapping
- Added `categoryMap` to convert backend category names to frontend keys:
  - "Education" → "education"
  - "Events" → "event"
  - "Celebrations"/"Festivals" → "celebration"
  - "Volunteers"/"Community Service" → "volunteer"
  - "Campaigns" → "campaign"
  - "Temple Activities"/"Other" → "event"

#### UI Updates
- Added loading spinner overlay
- Added error message display with retry button
- Updated all photo displays to use dynamic data:
  - Hero section stats (photo count)
  - Photo mosaic preview in hero
  - Main photo grid (Masonry style preserved)
  - Filter button counts
  - Lightbox (modal) view with full-size images and details
- All static `photos` array references replaced with dynamic `photos` state
- Used `viewCount` from API instead of hardcoded location info in some spots

### 2. **CMS Frontend (Already Configured)**

#### PhotoGalleryForm.jsx
- Configured with API endpoints for image upload and data management:
  - POST: `http://localhost:5000/api/photo-gallery` (Upload with image file)
  - PUT: `http://localhost:5000/api/photo-gallery/:id` (Update)
  - GET: `http://localhost:5000/api/photo-gallery/:id` (Fetch single)

#### PhotoGalleryList.jsx
- Configured with API endpoints:
  - GET: `http://localhost:5000/api/photo-gallery` (List all with filters)
  - DELETE: `http://localhost:5000/api/photo-gallery/:id` (Delete)

## Features Implemented

### ✅ Real-time Updates
- Page auto-refreshes every 30 seconds
- New photos appear without manual page refresh

### ✅ Dynamic Data Flow
1. Upload photo in CMS Frontend → Saves to API and uploads to server
2. Photo appears in CMS list immediately
3. Next.js frontend fetches and displays using the absolute server URL

### ✅ Enhanced Lightbox
- Dynamic previous/next navigation within the filtered set
- Displays large scale images from the server
- Shows photo title, category, description, and view count

### ✅ Error Handling
- Network errors caught and displayed
- Retry functionality available
- Graceful fallbacks for missing data

## API Endpoints Used

### Photo Gallery API
- **Base URL**: `http://localhost:5000/api`
- **Endpoints**:
  - `GET /photo-gallery` - Fetch all photos
  - `GET /photo-gallery/:id` - Fetch single photo
  - `POST /photo-gallery` - Create new photo (multipart/form-data)
  - `PUT /photo-gallery/:id` - Update photo
  - `DELETE /photo-gallery/:id` - Delete photo

## Testing Checklist

- [ ] Upload a new photo in CMS Frontend
- [ ] Verify it appears in CMS Frontend list
- [ ] Wait 30 seconds or refresh Next.js page
- [ ] Verify photo appears on Next.js frontend in the grid
- [ ] Verify "All Photos" count increases
- [ ] Edit photo details (title/category) in CMS
- [ ] Verify changes reflect on Next.js frontend
- [ ] Delete photo in CMS
- [ ] Verify it disappears from Next.js frontend
- [ ] Test category filtering (Education, Events, etc.)
- [ ] Open lightbox and test navigation (Prev/Next)
- [ ] Test loading state by simulating slow network

## Notes

1. **Auto-refresh interval**: Set to 30 seconds.
2. **Category mapping**: Backend uses proper case (e.g., "Education"), frontend logic uses lowercase.
3. **Image URLs**: Photos are served from `http://localhost:5000${photo.imageUrl}`.
