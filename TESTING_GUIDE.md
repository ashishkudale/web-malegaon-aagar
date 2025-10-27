# Malegaon Aagar - Testing Guide

## 📋 Pre-Testing Setup

Before you begin testing, ensure you have completed the Firebase setup:

### 1. Firebase Authentication Setup
- Go to [Firebase Console](https://console.firebase.google.com/project/web-malegaon-aagar/authentication)
- Click "Get Started" (if not already done)
- Enable "Email/Password" sign-in method
- Add admin user:
  - Email: `admin@malegaonaagar.com`
  - Password: (choose a secure password and remember it)

### 2. Firestore Database Setup
- Go to [Firestore Database](https://console.firebase.google.com/project/web-malegaon-aagar/firestore)
- Click "Create Database"
- Choose "Production mode"
- Select region: **asia-south1** (Mumbai, India)

### 3. Firestore Security Rules
- In Firestore, go to "Rules" tab
- Copy and paste the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.email == 'admin@malegaonaagar.com';
    }

    match /stops/{stopId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /routes/{routeId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /routeStops/{routeStopId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```
- Click "Publish"

---

## 🧪 Testing Checklist

### Phase 1: Admin Authentication

#### Test 1.1: Admin Login
- [ ] Navigate to http://localhost:5173/admin/login
- [ ] Verify the login page displays correctly
- [ ] Try logging in with **incorrect** credentials
- [ ] Verify error message appears: "Invalid credentials"
- [ ] Log in with correct admin credentials
- [ ] Verify redirect to `/admin/dashboard`
- [ ] Verify you see the admin sidebar

**Expected Results:**
- Login page is bilingual (English + Marathi)
- Invalid login shows error message
- Successful login redirects to dashboard
- Dashboard shows statistics (0 stops, 0 routes initially)

#### Test 1.2: Protected Routes
- [ ] Without logging in, try to access http://localhost:5173/admin/dashboard
- [ ] Verify you are redirected to `/admin/login`
- [ ] Log in successfully
- [ ] Navigate to different admin pages using the sidebar
- [ ] Click "Logout" button
- [ ] Verify you are redirected to `/admin/login`
- [ ] Try accessing `/admin/dashboard` again
- [ ] Verify you are redirected to login

**Expected Results:**
- All admin routes are protected
- Logout works correctly
- Sidebar navigation works

---

### Phase 2: Stops Management

#### Test 2.1: Add a New Stop
- [ ] Log in to admin panel
- [ ] Click "Add Stop" in sidebar (or navigate to http://localhost:5173/admin/stops/add)
- [ ] Fill in the form with sample data:
  - Stop Name (English): `Gandhi Chowk`
  - Stop Name (Marathi): `गांधी चौक`
  - Stop Code: `MGN001` (optional)
  - Latitude: (leave empty - now optional)
  - Longitude: (leave empty - now optional)
  - Address: `Main Road, Malegaon`
  - Landmark: `Near City Hospital`
  - Active: ✓ Checked
- [ ] Click "Add Stop"
- [ ] Verify alert: "Stop added successfully!"
- [ ] Verify redirect to `/admin/stops`
- [ ] Verify the new stop appears in the list

**Expected Results:**
- Form validation works
- Stop is created without lat/long (shows "-" in location column)
- Redirect happens after successful creation

#### Test 2.2: Add More Stops
Add at least 3 more stops for testing routes:

**Stop 2:**
- Stop Name (English): `Bus Stand`
- Stop Name (Marathi): `बस स्टँड`
- Stop Code: `MGN002`
- Landmark: `Central Bus Station`

**Stop 3:**
- Stop Name (English): `Railway Station`
- Stop Name (Marathi): `रेल्वे स्टेशन`
- Stop Code: `MGN003`
- Landmark: `Malegaon Railway Station`

**Stop 4:**
- Stop Name (English): `Market Square`
- Stop Name (Marathi): `बाजार चौक`
- Stop Code: `MGN004`
- Landmark: `Main Market Area`

#### Test 2.3: View Stops List
- [ ] Navigate to `/admin/stops`
- [ ] Verify all 4 stops are displayed
- [ ] Verify table shows:
  - Stop Code
  - English Name
  - Marathi Name
  - Location (should show "-" if no coordinates)
  - Status (Active badge)
  - Delete button
- [ ] Verify total count is correct

**Expected Results:**
- All stops display correctly
- Marathi text renders properly
- Active badges are green

#### Test 2.4: Delete a Stop
- [ ] Click "Delete" button on any stop
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel" - verify stop is NOT deleted
- [ ] Click "Delete" again and confirm
- [ ] Verify stop is removed from the list
- [ ] Verify total count decreases

**Expected Results:**
- Confirmation works
- Delete operation completes
- List updates immediately

---

### Phase 3: Routes Management

#### Test 3.1: Create a New Route
- [ ] Navigate to `/admin/routes/create`
- [ ] Fill in route details:
  - Route Number: `101`
  - Route Type: `Local`
  - Route Name (English): `Gandhi Chowk to Railway Station`
  - Route Name (Marathi): `गांधी चौक ते रेल्वे स्टेशन`
  - Base Fare: `20`
- [ ] Add stops in sequence:
  1. Select "Gandhi Chowk" from dropdown
  2. Select "Bus Stand" from dropdown
     - Distance: `2.5` km
     - Time: `10` min
  3. Select "Market Square" from dropdown
     - Distance: `1.5` km
     - Time: `7` min
  4. Select "Railway Station" from dropdown
     - Distance: `3.0` km
     - Time: `12` min
- [ ] Click "Create Route"
- [ ] Verify alert: "Route created!"
- [ ] Verify redirect to `/admin/routes`
- [ ] Verify the new route appears in the list

**Expected Results:**
- Stop selector only shows stops not already added
- Stop sequence displays with numbers (1, 2, 3, 4)
- Distance/Time fields only appear for stops after the first one
- Remove button works for each stop
- Route is created successfully

#### Test 3.2: Create Another Route
Create a second route for search testing:

- Route Number: `102`
- Route Name: `Bus Stand to Market Square`
- Route Name (Marathi): `बस स्टँड ते बाजार चौक`
- Route Type: `Express`
- Base Fare: `15`
- Stops:
  1. Bus Stand
  2. Gandhi Chowk (Distance: 2.5 km, Time: 8 min)
  3. Market Square (Distance: 1.0 km, Time: 5 min)

#### Test 3.3: View Routes List
- [ ] Navigate to `/admin/routes`
- [ ] Verify both routes are displayed
- [ ] Verify table shows:
  - Route Number
  - English Name
  - Marathi Name
  - Type badge
  - Fare
  - Delete button
- [ ] Verify total count is correct (2 routes)

**Expected Results:**
- All routes display correctly
- Route types show as badges
- Fare displays with ₹ symbol

#### Test 3.4: Delete a Route
- [ ] Click "Delete" on a route
- [ ] Confirm deletion
- [ ] Verify route is removed
- [ ] Verify associated route-stops are also deleted from Firestore

**Expected Results:**
- Delete removes route and all its stops
- List updates immediately

---

### Phase 4: Main Site - Home Page

#### Test 4.1: Home Page Display
- [ ] Navigate to http://localhost:5173/
- [ ] Verify hero section displays with:
  - Title: "Welcome to Malegaon Aagar"
  - Marathi title: "मालेगाव आगार मध्ये आपले स्वागत आहे"
  - Subtitle: "Your Complete Bus Timetable & Route Finder"
  - Two buttons: "View All Routes" and "Search Routes"
- [ ] Verify features section displays three cards:
  - All Routes 🚌
  - Smart Search 🔍
  - Detailed Info 📍

**Expected Results:**
- Hero section has gradient background
- Marathi text displays correctly
- All icons show properly

#### Test 4.2: Navigation from Home
- [ ] Click "View All Routes" button
- [ ] Verify redirect to `/routes`
- [ ] Go back to home
- [ ] Click "Search Routes" button
- [ ] Verify redirect to `/search`

**Expected Results:**
- All navigation works
- Header navigation is visible and functional

---

### Phase 5: Main Site - All Routes Page

#### Test 5.1: View All Routes
- [ ] Navigate to `/routes`
- [ ] Verify page title displays
- [ ] Verify total route count is shown
- [ ] Verify all routes display as cards with:
  - Route number in colored badge
  - English name
  - Marathi name
  - Route type badge
  - Fare amount
  - Arrow icon

**Expected Results:**
- Routes display in a grid
- Cards are clickable
- Hover effect works (card lifts up)

#### Test 5.2: Navigate to Route Details
- [ ] Click on Route 101 card
- [ ] Verify redirect to `/routes/{routeId}`

**Expected Results:**
- Route detail page loads
- URL contains the route ID

---

### Phase 6: Main Site - Route Details Page

#### Test 6.1: View Route Details
- [ ] View Route 101 details
- [ ] Verify route header shows:
  - Route number badge
  - English name
  - Marathi name
  - Route type badge
  - Operator name
  - Base fare
- [ ] Verify all stops display in sequence:
  - Stop sequence number (1, 2, 3, 4)
  - English name
  - Marathi name
  - Landmark (if available)
  - Distance from previous (for stops 2+)
  - Time from previous (for stops 2+)
- [ ] Verify connector lines between stops

**Expected Results:**
- All stop information displays
- Sequence is correct
- First stop doesn't show distance/time
- Back link works

#### Test 6.2: Navigation
- [ ] Click "← Back to All Routes"
- [ ] Verify redirect to `/routes`

**Expected Results:**
- Navigation works correctly

---

### Phase 7: Main Site - Search Routes

#### Test 7.1: Search Route - Valid Journey
- [ ] Navigate to `/search`
- [ ] Select "From" stop: `Gandhi Chowk`
- [ ] Select "To" stop: `Railway Station`
- [ ] Click "Search Routes 🔍"
- [ ] Verify search results show:
  - Result count message
  - Route 101 card with:
    - Route number badge
    - Route name (bilingual)
    - Fare
    - "Your Journey" section showing only relevant stops
    - Stop count
    - "View Full Route Details" link

**Expected Results:**
- Search finds Route 101
- Journey shows: Gandhi Chowk → Bus Stand → Market Square → Railway Station
- Stop count is 4

#### Test 7.2: Search Route - No Results
- [ ] Select "From" stop: `Railway Station`
- [ ] Select "To" stop: `Gandhi Chowk`
- [ ] Click "Search Routes"
- [ ] Verify "No results" message displays:
  - Emoji: 😔
  - English message
  - Marathi message

**Expected Results:**
- No results message appears
- Both languages show

#### Test 7.3: Search Route - Same Stop
- [ ] Select "From" stop: `Bus Stand`
- [ ] Select "To" stop: `Bus Stand`
- [ ] Click "Search Routes"
- [ ] Verify alert: "From and To stops cannot be the same"

**Expected Results:**
- Validation works
- Alert appears

#### Test 7.4: Search Route - Empty Selection
- [ ] Clear selections (reload page)
- [ ] Click "Search Routes" without selecting stops
- [ ] Verify alert: "Please select both From and To stops"

**Expected Results:**
- Validation works
- Alert appears

#### Test 7.5: View Full Route from Search
- [ ] Search from "Bus Stand" to "Market Square"
- [ ] Verify Route 102 appears
- [ ] Click "View Full Route Details →"
- [ ] Verify redirect to route details page

**Expected Results:**
- Navigation works
- Full route displays

---

### Phase 8: Admin Dashboard

#### Test 8.1: Dashboard Statistics
- [ ] Navigate to `/admin/dashboard`
- [ ] Verify statistics display:
  - Total Stops count (should match actual count)
  - Total Routes count (should match actual count)

**Expected Results:**
- Numbers are accurate
- Real-time data from Firestore

---

### Phase 9: Responsive Design

#### Test 9.1: Mobile View
- [ ] Open browser DevTools (F12)
- [ ] Switch to mobile view (iPhone or Android)
- [ ] Test all pages:
  - Home page
  - All routes page
  - Route details page
  - Search page
  - Admin login
  - Admin pages

**Expected Results:**
- All pages are responsive
- Navigation works on mobile
- Text is readable
- Buttons are touchable

---

### Phase 10: Edge Cases & Error Handling

#### Test 10.1: Invalid Route ID
- [ ] Navigate to http://localhost:5173/routes/invalid-id-123
- [ ] Verify error message or "Route not found"

**Expected Results:**
- App doesn't crash
- Error message displays

#### Test 10.2: Network Issues
- [ ] Turn off internet (or disable Firestore in Firebase Console)
- [ ] Try loading routes page
- [ ] Verify appropriate error handling

**Expected Results:**
- Loading state shows
- App handles errors gracefully

---

## ✅ Testing Summary

After completing all tests, verify:

- [ ] All admin features work
- [ ] All main site features work
- [ ] Search functionality works correctly
- [ ] No console errors
- [ ] Marathi text displays properly
- [ ] Responsive design works
- [ ] Firebase integration works
- [ ] Authentication/Authorization works
- [ ] Data persists correctly

---

## 🐛 Found Issues?

If you find any issues during testing:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check Firebase Console for Firestore errors
4. Verify security rules are correct
5. Check that you're using the correct admin email

---

## 📝 Sample Test Data Summary

**Stops Created:**
1. Gandhi Chowk (गांधी चौक) - MGN001
2. Bus Stand (बस स्टँड) - MGN002
3. Railway Station (रेल्वे स्टेशन) - MGN003
4. Market Square (बाजार चौक) - MGN004

**Routes Created:**
1. Route 101: Gandhi Chowk to Railway Station (4 stops)
2. Route 102: Bus Stand to Market Square (3 stops)

**Search Test Cases:**
- Gandhi Chowk → Railway Station ✓ (finds Route 101)
- Bus Stand → Market Square ✓ (finds Route 102)
- Railway Station → Gandhi Chowk ✗ (no results)
- Same stop → Same stop ✗ (validation error)

---

## 🎉 Testing Complete!

Once all tests pass, your application is ready for deployment!
