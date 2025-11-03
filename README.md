# Malegaon Aagar - मालेगाव आगार 🚌

**Your Complete Bus Timetable & Route Finder for Malegaon**

A modern, bilingual (English + Marathi) web application for discovering bus routes in Malegaon, Maharashtra. Features a public-facing route finder and a secure admin panel for managing stops and routes.

---

## 🌟 Features

### Main Site (Public)
- 🏠 **Home Page** - Beautiful landing page with search options
- 🚌 **All Routes** - Browse all available bus routes
- 📍 **Route Details** - View complete route information with all stops
- 🔍 **Smart Search** - Find routes between any two stops
- 🌐 **Bilingual** - Full support for English and Marathi
- 📱 **Responsive** - Works perfectly on mobile, tablet, and desktop

### Admin Panel (Protected)
- 🔐 **Secure Login** - Password-protected admin access
- 📊 **Dashboard** - Overview statistics of stops and routes
- ➕ **Add Stops** - Create new bus stops with bilingual names
- 📝 **Manage Stops** - View, edit, and delete stops
- 🛣️ **Create Routes** - Build routes with multiple stops
- 🗺️ **Manage Routes** - View and delete routes
- ⏱️ **Time & Distance** - Track distance and time between stops

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Modern web browser

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env.local` and add your Firebase credentials
   - The `.env.local` file is git-ignored for security
   - Admin email: `admin@malegaonaagar.com`

3. **Set up Firebase** (See [FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md))
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Configure security rules
   - Create admin user

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **React Router DOM 7** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling

### Backend
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Hosting** - Static hosting & CDN

### UI/UX
- **Material-UI (MUI)** - Component library
- **Emotion** - CSS-in-JS styling
- **Responsive Design** - Mobile-first approach

---

## 📖 Documentation

- **[Firebase Setup Guide](FIREBASE_SETUP_GUIDE.md)** - Complete Firebase configuration
- **[Testing Guide](TESTING_GUIDE.md)** - Comprehensive testing checklist
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[Implementation Plan](FOCUSED_IMPLEMENTATION_PLAN.md)** - Development roadmap

---

## 🧪 Testing

Run the development server and follow the [Testing Guide](TESTING_GUIDE.md):

```bash
npm run dev
```

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.**

---

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🎯 Quick Links

- **Firebase Console:** https://console.firebase.google.com/project/web-malegaon-aagar
- **Local Dev:** http://localhost:5173
- **Admin Login:** http://localhost:5173/admin/login

---

**Built with ❤️ for Malegaon**

**मालेगाव आगार - आपल्या शहरासाठी, आपल्यासाठी 🚌**
