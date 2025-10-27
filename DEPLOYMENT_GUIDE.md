# Deployment Guide - Malegaon Aagar

This guide covers deploying the Malegaon Aagar application to Firebase Hosting.

---

## 📋 Prerequisites

Before deployment, ensure:
- [ ] Firebase project is set up ([FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md))
- [ ] All testing is complete ([TESTING_GUIDE.md](TESTING_GUIDE.md))
- [ ] Application works perfectly locally
- [ ] Real data has been added (stops and routes)
- [ ] `.env` file has correct Firebase configuration

---

## 🚀 Deployment Options

### Option 1: Firebase Hosting (Recommended)
- **Pros:** Free tier available, CDN, HTTPS, easy deployment
- **Cons:** Static hosting only (perfect for this React app)

### Option 2: Vercel
- **Pros:** Easy GitHub integration, automatic deployments
- **Cons:** Requires GitHub account

### Option 3: Netlify
- **Pros:** Drag-and-drop deployment, forms support
- **Cons:** Different deployment process

**This guide covers Firebase Hosting (Option 1).**

---

## 🔥 Firebase Hosting Deployment

### Step 1: Install Firebase CLI

Open your terminal and run:

```bash
npm install -g firebase-tools
```

**Verify installation:**
```bash
firebase --version
```

You should see a version number (e.g., `13.0.0`).

---

### Step 2: Login to Firebase

```bash
firebase login
```

This will:
1. Open your browser
2. Ask you to login with your Google account
3. Grant permissions to Firebase CLI

**Expected output:**
```
✔ Success! Logged in as your-email@gmail.com
```

---

### Step 3: Build the Application

Navigate to your project directory and build for production:

```bash
npm run build
```

**This will:**
- Create an optimized production build
- Generate a `dist` folder with all static files
- Minify and optimize code
- Process CSS and assets

**Expected output:**
```
vite v7.1.12 building for production...
✓ built in 5.23s
dist/index.html                   0.46 kB
dist/assets/index-[hash].css      10.23 kB
dist/assets/index-[hash].js       150.45 kB
```

**✅ Checkpoint:** Verify the `dist` folder exists with `index.html` inside.

---

### Step 4: Initialize Firebase Hosting

In your project root, run:

```bash
firebase init hosting
```

**You'll be asked several questions:**

#### Question 1: Select Firebase project
```
? Please select an option:
  ❯ Use an existing project
    Create a new project
    ...
```
**Answer:** Choose **Use an existing project**

Then select: **web-malegaon-aagar**

#### Question 2: Public directory
```
? What do you want to use as your public directory?
```
**Answer:** Type `dist` and press Enter

#### Question 3: Single-page app
```
? Configure as a single-page app (rewrite all urls to /index.html)?
```
**Answer:** Type `y` (yes) and press Enter

#### Question 4: GitHub automatic builds
```
? Set up automatic builds and deploys with GitHub?
```
**Answer:** Type `n` (no) and press Enter
(You can set this up later if needed)

#### Question 5: Overwrite index.html
```
? File dist/index.html already exists. Overwrite?
```
**Answer:** Type `N` (no) and press Enter
(DO NOT overwrite - we want to keep our built file)

---

### Step 5: Configure firebase.json

After initialization, you'll have a `firebase.json` file. Update it to:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

This configuration:
- Sets `dist` as the public directory
- Enables SPA routing (all routes go to index.html)
- Adds caching headers for better performance

---

### Step 6: Deploy to Firebase

Deploy your application:

```bash
firebase deploy --only hosting
```

**This will:**
1. Upload all files from `dist` to Firebase Hosting
2. Configure routing and headers
3. Deploy to Firebase CDN
4. Provide you with hosting URLs

**Expected output:**
```
=== Deploying to 'web-malegaon-aagar'...

i  deploying hosting
i  hosting[web-malegaon-aagar]: beginning deploy...
i  hosting[web-malegaon-aagar]: found 10 files in dist
✔  hosting[web-malegaon-aagar]: file upload complete
i  hosting[web-malegaon-aagar]: finalizing version...
✔  hosting[web-malegaon-aagar]: version finalized
i  hosting[web-malegaon-aagar]: releasing new version...
✔  hosting[web-malegaon-aagar]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/web-malegaon-aagar/overview
Hosting URL: https://web-malegaon-aagar.web.app
```

---

### Step 7: Verify Deployment

1. **Open the Hosting URL** in your browser:
   - `https://web-malegaon-aagar.web.app`
   - OR `https://web-malegaon-aagar.firebaseapp.com`

2. **Test all features:**
   - Home page loads
   - All routes page shows data
   - Search functionality works
   - Route details display correctly
   - Admin login works
   - Admin panel is functional

**✅ Checkpoint:** All features should work exactly as they did locally!

---

## 🌐 Custom Domain Setup (Optional)

### Step 1: Purchase a Domain
Purchase a domain (e.g., `malegaonaagar.com`) from:
- Google Domains
- GoDaddy
- Namecheap
- etc.

### Step 2: Add Custom Domain in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/project/web-malegaon-aagar/hosting)
2. Click **Add custom domain**
3. Enter your domain: `malegaonaagar.com`
4. Click **Continue**

### Step 3: Verify Ownership

Firebase will provide a TXT record. Add it to your domain's DNS:

1. Go to your domain registrar's DNS settings
2. Add a TXT record with the values Firebase provides
3. Wait for verification (can take up to 24 hours)

### Step 4: Configure DNS

After verification, Firebase will provide A records:

Add these A records to your domain DNS:
```
Type: A
Name: @
Value: 151.101.1.195

Type: A
Name: @
Value: 151.101.65.195
```

For `www` subdomain:
```
Type: A
Name: www
Value: 151.101.1.195

Type: A
Name: www
Value: 151.101.65.195
```

### Step 5: Wait for Propagation

DNS changes can take 24-48 hours to propagate globally.

**Check status:**
- Firebase Console will show "Connected" when ready
- Your site will be available at `https://malegaonaagar.com`

---

## 🔄 Re-Deployment (Updates)

When you make changes to the app:

### Step 1: Make Changes
Edit your code as needed

### Step 2: Test Locally
```bash
npm run dev
```
Test all changes thoroughly

### Step 3: Build
```bash
npm run build
```

### Step 4: Deploy
```bash
firebase deploy --only hosting
```

**That's it!** Your changes are now live.

---

## 📊 Monitoring Your Deployment

### View Deployment History
```bash
firebase hosting:channel:list
```

### View Current Deployment
Go to: Firebase Console → Hosting → Dashboard

You'll see:
- Deployment history
- Traffic analytics
- Storage usage
- Request counts

---

## 🔧 Advanced Deployment Options

### Preview Channels

Test your deployment before going live:

```bash
# Create a preview channel
firebase hosting:channel:deploy preview-test

# This gives you a temporary URL like:
# https://web-malegaon-aagar--preview-test-abc123.web.app
```

**Benefits:**
- Test in production environment
- Share with team for review
- No impact on live site

### Rollback to Previous Version

If something goes wrong:

1. Go to Firebase Console → Hosting
2. Click on "Release history"
3. Find the previous version
4. Click **⋮** (three dots) → **Rollback**

---

## 🛡️ Security Considerations

### Environment Variables

**IMPORTANT:** Your `.env` file is NOT deployed to hosting.

For production, Firebase config is safe to be public because:
- Firestore security rules protect your data
- Authentication is required for admin access
- API keys are domain-restricted in Firebase Console

### Restrict API Key (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Find your Browser key (Auto-created by Firebase)
5. Click **Edit**
6. Under **Application restrictions**:
   - Choose **HTTP referrers**
   - Add: `https://web-malegaon-aagar.web.app/*`
   - Add: `https://web-malegaon-aagar.firebaseapp.com/*`
   - Add: `http://localhost:5173/*` (for development)
7. Click **Save**

---

## 📈 Performance Optimization

### 1. Enable Compression
Already enabled by Firebase Hosting (gzip/brotli)

### 2. Caching
Configured in `firebase.json` (assets cached for 1 year)

### 3. CDN
Firebase Hosting automatically uses Google's CDN

### 4. HTTPS
Automatically enabled (SSL certificate included)

---

## 🐛 Troubleshooting

### Issue 1: "firebase: command not found"
**Solution:**
```bash
npm install -g firebase-tools
```

### Issue 2: Build fails
**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Issue 3: 404 errors after deployment
**Solution:**
Check `firebase.json` has proper rewrites configuration (see Step 5)

### Issue 4: Old version still showing
**Solution:**
Hard refresh the browser (Ctrl+Shift+R) or clear cache

### Issue 5: Admin login doesn't work
**Solution:**
Verify Firebase Authentication and Firestore are in the same project

---

## 📋 Deployment Checklist

Before deploying to production:

**Pre-Deployment:**
- [ ] All features tested locally
- [ ] Firebase setup complete
- [ ] Real data added
- [ ] Security rules configured
- [ ] Admin user created
- [ ] `.env` file has production config
- [ ] No console errors
- [ ] Responsive design tested

**During Deployment:**
- [ ] Build succeeds without errors
- [ ] `dist` folder created
- [ ] Firebase project selected correctly
- [ ] Deployment completes successfully

**Post-Deployment:**
- [ ] Hosting URL works
- [ ] Home page loads
- [ ] Routes display correctly
- [ ] Search works
- [ ] Admin login works
- [ ] Admin panel functional
- [ ] No console errors in production
- [ ] Mobile view works

---

## 🎉 Success!

Your Malegaon Aagar application is now live!

**Share your site:**
- Main site: `https://web-malegaon-aagar.web.app`
- Admin panel: `https://web-malegaon-aagar.web.app/admin/login`

---

## 📞 Support

- **Firebase Hosting Docs:** https://firebase.google.com/docs/hosting
- **Firebase Console:** https://console.firebase.google.com/
- **Deployment Logs:** `firebase hosting:channel:list`

**Congratulations on your deployment! 🚀**
