# Firebase Setup Guide - Malegaon Aagar

This guide will walk you through setting up Firebase for the Malegaon Aagar project.

---

## 📋 Prerequisites

- Google Account
- Firebase project already created: `web-malegaon-aagar`
- Firebase configuration already added to `.env` file

---

## 🔥 Step 1: Enable Firebase Authentication

### 1.1 Navigate to Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **web-malegaon-aagar**
3. Click on **Authentication** in the left sidebar
4. If this is your first time, click **Get Started**

### 1.2 Enable Email/Password Provider
1. Click on the **Sign-in method** tab
2. Find **Email/Password** in the list
3. Click on it to expand
4. Toggle **Enable** to ON
5. Click **Save**

### 1.3 Create Admin User
1. Click on the **Users** tab
2. Click **Add user** button
3. Fill in the details:
   - **Email:** `admin@malegaonaagar.com`
   - **Password:** (Choose a strong password - **IMPORTANT: Remember this!**)
4. Click **Add user**
5. Verify the user appears in the users list

**✅ Checkpoint:** You should now have 1 user in your Authentication panel.

---

## 🗄️ Step 2: Create Firestore Database

### 2.1 Navigate to Firestore
1. In Firebase Console, click **Firestore Database** in the left sidebar
2. Click **Create database** button

### 2.2 Configure Database
1. **Select starting mode:**
   - Choose **Production mode** (we'll set custom rules next)
   - Click **Next**

2. **Set location:**
   - Choose **asia-south1 (Mumbai)**
   - This is closest to Malegaon and will provide better performance
   - Click **Enable**

3. Wait for the database to be created (takes ~1 minute)

**✅ Checkpoint:** You should see an empty Firestore database with "Start collection" button.

---

## 🔒 Step 3: Configure Firestore Security Rules

### 3.1 Navigate to Rules
1. In Firestore Database, click on the **Rules** tab at the top
2. You'll see the default rules editor

### 3.2 Replace with Custom Rules
1. **Delete all existing rules**
2. **Copy and paste** the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.email == 'admin@malegaonaagar.com';
    }

    // Stops collection
    match /stops/{stopId} {
      allow read: if true;  // Anyone can read stops
      allow write: if isAdmin();  // Only admin can create/update/delete
    }

    // Routes collection
    match /routes/{routeId} {
      allow read: if true;  // Anyone can read routes
      allow write: if isAdmin();  // Only admin can create/update/delete
    }

    // Route-Stops junction collection
    match /routeStops/{routeStopId} {
      allow read: if true;  // Anyone can read route stops
      allow write: if isAdmin();  // Only admin can create/update/delete
    }
  }
}
```

3. Click **Publish** button

### 3.3 Verify Rules
After publishing, you should see a success message: "Rules published successfully"

**✅ Checkpoint:** Rules are now active and protecting your database.

---

## 📊 Step 4: Understand Database Structure

Your Firestore database will have 3 main collections:

### Collection 1: `stops`
Stores all bus stop information.

**Document Structure:**
```javascript
{
  stopNameEnglish: "Gandhi Chowk",
  stopNameMarathi: "गांधी चौक",
  stopCode: "MGN001",
  latitude: 20.5579,  // Optional (can be 0)
  longitude: 74.5287,  // Optional (can be 0)
  address: "Main Road, Malegaon",
  landmark: "Near City Hospital",
  city: "Malegaon",
  district: "Nashik",
  state: "Maharashtra",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "admin@malegaonaagar.com"
}
```

### Collection 2: `routes`
Stores bus route information.

**Document Structure:**
```javascript
{
  routeNumber: "101",
  routeNameEnglish: "Gandhi Chowk to Railway Station",
  routeNameMarathi: "गांधी चौक ते रेल्वे स्टेशन",
  routeType: "local",  // local, express, or shuttle
  operatorName: "Malegaon ST",
  fare: 20,
  startStop: "stopId1",  // Reference to first stop
  endStop: "stopId4",  // Reference to last stop
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "admin@malegaonaagar.com"
}
```

### Collection 3: `routeStops`
Junction table linking routes to stops in sequence.

**Document Structure:**
```javascript
{
  routeId: "routeId123",  // Reference to route
  stopId: "stopId456",  // Reference to stop
  stopSequence: 2,  // Order in the route (1, 2, 3, ...)
  distanceFromPrevious: 2.5,  // km
  estimatedTimeFromPrevious: 10,  // minutes
  createdAt: Timestamp
}
```

---

## 🧪 Step 5: Test Database Access

### 5.1 Test from Application
1. Make sure your app is running: `npm run dev`
2. Navigate to: http://localhost:5173/admin/login
3. Login with: `admin@malegaonaagar.com` and your password
4. You should see the dashboard with 0 stops and 0 routes

### 5.2 Add Test Data
1. Click **Add Stop** in the sidebar
2. Create a test stop:
   - Stop Name (English): Test Stop
   - Stop Name (Marathi): टेस्ट स्टॉप
   - Leave other fields optional
3. Click **Add Stop**
4. If successful, you'll see an alert and be redirected

### 5.3 Verify in Firebase Console
1. Go back to Firebase Console → Firestore Database
2. Click on **Data** tab
3. You should see a `stops` collection with 1 document
4. Click on the document to see its fields

**✅ Checkpoint:** If you can see the data in Firestore, everything is working!

---

## 🔍 Step 6: Monitor and Debug

### 6.1 View Firestore Data
- Go to: Firebase Console → Firestore Database → Data
- You can browse all collections and documents
- Click on documents to edit them manually (if needed)

### 6.2 Check Authentication Status
- Go to: Firebase Console → Authentication → Users
- You'll see all logged-in users here
- You can disable/delete users if needed

### 6.3 Monitor Usage
- Go to: Firebase Console → Firestore Database → Usage
- See read/write counts
- Monitor storage usage

### 6.4 View Logs
- Go to: Firebase Console → Firestore Database → Rules
- Click **Rules playground** to test specific operations

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Permission Denied" Error
**Problem:** Cannot write to Firestore from admin panel

**Solutions:**
1. Check that you're logged in with `admin@malegaonaagar.com`
2. Verify security rules are published correctly
3. Check the exact email in rules matches your user email
4. Try logging out and logging back in

### Issue 2: "User Not Found" During Login
**Problem:** Cannot login with admin credentials

**Solutions:**
1. Go to Authentication → Users
2. Verify `admin@malegaonaagar.com` exists
3. If not, create it again
4. Try resetting the password

### Issue 3: Cannot Read Data on Main Site
**Problem:** Routes/stops don't show on main site

**Solutions:**
1. Check that security rules have `allow read: if true;`
2. Verify data exists in Firestore
3. Check browser console for errors
4. Ensure Firebase is initialized correctly

### Issue 4: Data Not Updating in Real-time
**Problem:** Changes don't reflect immediately

**Solutions:**
1. Hard refresh the page (Ctrl+F5)
2. Check network tab for failed requests
3. Verify Firestore is not in offline mode
4. Clear browser cache

---

## 🔐 Security Best Practices

### ✅ DO:
- Keep your admin password strong and private
- Use security rules to protect data
- Regularly review Authentication users
- Monitor Firestore usage for anomalies
- Keep your `.env` file in `.gitignore`

### ❌ DON'T:
- Share your Firebase config publicly (it's in `.env`)
- Give admin access to multiple users (create separate roles if needed)
- Allow anonymous writes in security rules
- Commit `.env` file to Git
- Use weak passwords for admin account

---

## 📊 Firestore Indexes

For optimal performance, Firestore may require composite indexes for complex queries.

### Current Queries:
1. **Stops:** `orderBy('stopNameEnglish')` + `where('isActive', '==', true)`
2. **Routes:** `orderBy('routeNumber')`
3. **RouteStops:** `where('routeId', '==', routeId)` + `orderBy('stopSequence')`

**Note:** If you see "index required" errors in the console, Firestore will provide a direct link to create the index. Simply click it and Firebase will auto-create it.

---

## 🚀 Next Steps

After completing Firebase setup:

1. ✅ Test the application thoroughly (see [TESTING_GUIDE.md](TESTING_GUIDE.md))
2. ✅ Add real bus stop and route data
3. ✅ Test all features (admin + main site)
4. ✅ Prepare for deployment

---

## 📞 Support Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started
- **Firebase Console:** https://console.firebase.google.com/
- **Firestore Data Viewer:** Go to your project → Firestore Database → Data

---

## ✅ Setup Complete Checklist

- [ ] Firebase project exists
- [ ] Authentication enabled
- [ ] Email/Password provider enabled
- [ ] Admin user created (`admin@malegaonaagar.com`)
- [ ] Firestore database created (asia-south1)
- [ ] Security rules published
- [ ] Test stop created successfully
- [ ] Data visible in Firebase Console
- [ ] Admin login works
- [ ] Ready for testing!

---

**Congratulations! 🎉**

Your Firebase backend is now fully configured and ready to use!
