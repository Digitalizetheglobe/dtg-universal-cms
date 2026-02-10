# Donor Wall Implementation

Complete implementation of the Donor Wall management system for the CMS with fully responsive design.

## Files Created

### Backend (CMS-BE)

1. **DonorWall.js** (`/models/DonorWall.js`)
   - MongoDB schema for donor wall
   - Fields: fullName, email, phone, amount, donationDate, campaign, tier, isVisible, isAnonymous, showAmount, message, avatarColor, avatarInitials, status, address, panNumber, notes
   - Auto-tier assignment based on donation amount
   - Avatar initials generation
   - Indexed for performance

2. **donorWallController.js** (`/controllers/donorWallController.js`)
   - Complete CRUD operations
   - Functions:
     - `createDonor` - Add new donor with auto-tier assignment
     - `getAllDonors` - Get all donors with filtering, search, and pagination
     - `getDonorById` - Get single donor
     - `updateDonor` - Update donor details
     - `deleteDonor` - Remove donor
     - `getDonorStats` - Get statistics (total donors, visible, hidden, total raised, tier counts)
     - `getDonorsByTier` - Get donors by tier
     - `getDonorsByCampaign` - Get donors by campaign
     - `toggleVisibility` - Toggle donor visibility on wall

3. **donorWallRoutes.js** (`/routes/donorWallRoutes.js`)
   - RESTful API routes
   - Endpoints:
     - `POST /api/donor-wall` - Create donor
     - `GET /api/donor-wall` - Get all donors
     - `GET /api/donor-wall/stats` - Get statistics
     - `GET /api/donor-wall/tier/:tier` - Get by tier
     - `GET /api/donor-wall/campaign/:campaign` - Get by campaign
     - `GET /api/donor-wall/:id` - Get single donor
     - `PUT /api/donor-wall/:id` - Update donor
     - `PUT /api/donor-wall/:id/toggle-visibility` - Toggle visibility
     - `DELETE /api/donor-wall/:id` - Delete donor

4. **server.js** (Updated)
   - Added donor wall routes: `/api/donor-wall`

### Frontend (CMS-FE)

1. **DonorWallForm.jsx** (`/src/DonorWall/DonorWallForm.jsx`)
   - **Fully responsive** form for adding and editing donors
   - Features:
     - Dual-mode (Create/Edit) based on URL route
     - Pre-filling data in Edit mode
     - Donor information (name, email, phone, address)
     - Donation details (amount, date, campaign, tier, PAN)
     - Auto-tier assignment (Platinum ₹1L+, Gold ₹50K+, Silver ₹25K+, Bronze ₹10K+)
     - Visibility settings (visible, anonymous, show amount)
     - Donor message (max 500 chars)
     - Avatar color picker (10 colors)
     - Internal notes (admin only)
     - Real-time card preview
     - Form validation
     - Mobile-optimized layout

2. **DonorWallList.jsx** (`/src/DonorWall/DonorWallList.jsx`)
   - **Fully responsive** donor wall list
   - Features:
     - Statistics dashboard (total donors, visible, hidden, total raised)
     - Search functionality (name, email, campaign)
     - Filter by tier (Platinum, Gold, Silver, Bronze, Supporter)
     - Filter by visibility (All, Visible, Hidden)
     - **Desktop view**: Table layout with all details
     - **Mobile view**: Card layout optimized for small screens
     - Quick visibility toggle
     - Edit and Delete actions
     - Tier-based color coding
     - Avatar with initials
     - Empty state handling

3. **App.jsx** (Updated)
   - Added Donor Wall routes:
     - `/donor-wall` - List view
     - `/donor-wall/create` - Create form
     - `/donor-wall/edit/:id` - Edit form

4. **DonationKitManagement.jsx** (Already configured)
   - Donor Wall card with Manage and Add buttons
   - Navigation to `/donor-wall` and `/donor-wall/create`

## Features

### Donor Management
- ✅ Add new donors with complete information
- ✅ Edit existing donor details
- ✅ Delete donors
- ✅ Auto-tier assignment based on donation amount
- ✅ Manual tier override option
- ✅ Visibility toggle (show/hide on public wall)
- ✅ Anonymous donation support
- ✅ Show/hide donation amount
- ✅ Donor messages (up to 500 characters)
- ✅ Avatar color customization
- ✅ Campaign tracking
- ✅ PAN number storage
- ✅ Internal notes for admins

### Tier System
- **Platinum**: ₹1,00,000 and above
- **Gold**: ₹50,000 - ₹99,999
- **Silver**: ₹25,000 - ₹49,999
- **Bronze**: ₹10,000 - ₹24,999
- **Supporter**: Below ₹10,000

### User Interface
- ✅ **Fully responsive design** (mobile, tablet, desktop)
- ✅ Statistics dashboard
- ✅ Real-time card preview in form
- ✅ Desktop table view with sortable columns
- ✅ Mobile card view with touch-friendly buttons
- ✅ Search and filter capabilities
- ✅ Tier-based color coding
- ✅ Avatar with auto-generated initials
- ✅ Smooth animations and transitions
- ✅ Empty state handling

### API Features
- ✅ RESTful API design
- ✅ Pagination support
- ✅ Filtering by tier, visibility, campaign
- ✅ Search by name, email
- ✅ Statistics endpoint
- ✅ Quick visibility toggle
- ✅ Comprehensive error handling

## Responsive Design

### Desktop (lg and above)
- Table layout with all columns visible
- Sidebar preview in form
- Multi-column statistics dashboard
- Horizontal filters

### Tablet (md to lg)
- Responsive table/card hybrid
- Stacked form sections
- 2-column statistics
- Compact filters

### Mobile (sm and below)
- Card-based list view
- Single-column form layout
- Stacked statistics (2x2 grid)
- Full-width buttons
- Touch-optimized controls
- Collapsible sections

## How to Use

### For Administrators:

1. **Access Donor Wall:**
   - Navigate to Donation Kit Management
   - Click "Manage Donors" on the Donor Wall card

2. **Add a New Donor:**
   - Click the "+ Add Donor" button
   - Fill in donor information (name, email required)
   - Enter donation amount (required)
   - Select or let system auto-assign tier
   - Optionally add phone, address, PAN number
   - Choose visibility settings
   - Add a donor message (optional)
   - Select avatar color
   - Add internal notes (optional)
   - Preview the card in real-time
   - Click "Save"

3. **Manage Donors:**
   - View statistics at the top
   - Use search to find specific donors
   - Filter by tier or visibility status
   - Click visibility icon to show/hide donor on public wall
   - Click "Edit" to modify donor details
   - Click "Delete" to remove a donor

4. **Edit a Donor:**
   - Click the "Edit" button on any donor
   - Modify any field as needed
   - Click "Save" to update

### For Developers:

1. **Start the Backend:**
   ```bash
   cd CMS-BE
   node server.js
   ```

2. **Start the Frontend:**
   ```bash
   cd CMS-FE
   npm start
   ```

3. **Access the Application:**
   - Open browser to `http://localhost:3000`
   - Navigate to `/donor-wall`

## API Endpoints

### Base URL
```
http://localhost:5000/api/donor-wall
```

### Endpoints

#### Create Donor
```
POST /api/donor-wall
Content-Type: application/json

{
  "fullName": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+91 98765 43210",
  "amount": 50000,
  "donationDate": "2024-02-06",
  "campaign": "Build a School",
  "isVisible": true,
  "isAnonymous": false,
  "showAmount": true,
  "message": "Happy to support this noble cause",
  "avatarColor": "#FF6B6B"
}
```

#### Get All Donors
```
GET /api/donor-wall?tier=Gold&isVisible=true&search=rajesh&page=1&limit=20
```

#### Get Donor Statistics
```
GET /api/donor-wall/stats
```

#### Get Single Donor
```
GET /api/donor-wall/:id
```

#### Update Donor
```
PUT /api/donor-wall/:id
Content-Type: application/json

{
  "amount": 75000,
  "tier": "Gold"
}
```

#### Toggle Visibility
```
PUT /api/donor-wall/:id/toggle-visibility
```

#### Delete Donor
```
DELETE /api/donor-wall/:id
```

## Design Highlights

- **Responsive Layout:** Seamlessly adapts from mobile to desktop
- **Desktop Table View:** Professional table with all donor information
- **Mobile Card View:** Touch-friendly cards optimized for small screens
- **Statistics Dashboard:** Quick overview of donor metrics
- **Tier-Based Colors:** Visual distinction for different donor tiers
- **Avatar System:** Auto-generated initials with customizable colors
- **Real-time Preview:** See how the donor card will appear while editing
- **Search & Filter:** Quickly find specific donors
- **Visibility Toggle:** One-click show/hide on public wall

## Color Coding

### Tier Colors
- **Platinum**: Purple (`bg-purple-100 text-purple-700`)
- **Gold**: Yellow (`bg-yellow-100 text-yellow-700`)
- **Silver**: Gray (`bg-gray-200 text-gray-700`)
- **Bronze**: Orange (`bg-orange-100 text-orange-700`)
- **Supporter**: Blue (`bg-blue-100 text-blue-700`)

### Avatar Colors
10 vibrant colors available:
- `#FF6B6B` (Red)
- `#4ECDC4` (Teal)
- `#45B7D1` (Blue)
- `#FFA07A` (Light Salmon)
- `#98D8C8` (Mint)
- `#F7DC6F` (Yellow)
- `#BB8FCE` (Purple)
- `#85C1E2` (Sky Blue)
- `#F8B739` (Orange)
- `#52B788` (Green)

## Next Steps (Optional Enhancements)

1. **Public Donor Wall Page:** Create a public-facing page to display donors
2. **Certificate Generation:** Auto-generate donation certificates
3. **Email Notifications:** Send thank-you emails to donors
4. **Bulk Import:** Import donors from CSV/Excel
5. **Export Functionality:** Export donor list to PDF/Excel
6. **Advanced Analytics:** Detailed donation trends and insights
7. **Recurring Donations:** Track recurring donors
8. **Tax Receipts:** Generate 80G tax receipts
9. **Donor Portal:** Allow donors to update their own information
10. **Social Sharing:** Share donor wall on social media

## Notes

- All donor data is stored securely in MongoDB
- Tier assignment is automatic based on donation amount
- Visibility can be toggled without deleting the donor
- Anonymous donations hide the donor name but keep records
- Internal notes are never visible to the public
- The system is fully integrated with existing CMS authentication
- **Fully responsive** - works perfectly on all device sizes

---

**Implementation Date:** February 6, 2026
**Status:** ✅ Complete and Fully Responsive
