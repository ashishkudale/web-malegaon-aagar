# Malegaon Aagar - Focused Implementation Plan
## Main Site + Admin Site (Phase 1)

## 🎯 Project Goals

### Main Site (malegaonaagar.com)
1. **Home Page** - Welcome page with search functionality
2. **All Routes Page** - View all available bus routes
3. **Route Details Page** - Detailed view of a selected route with all stops
4. **Route Search** - Search routes by selecting "From" and "To" stops

### Admin Site (malegaonaagar.com/admin)
1. **Admin Login** - Password-protected access
2. **Dashboard** - Overview statistics
3. **Manage Stops** - Add, view, edit stops (English + Marathi)
4. **Manage Routes** - Create, view routes with stops

---

## 📦 Phase 0: Project Setup (Day 1 - Morning)

### Step 1: Create Project

```bash
# Create React app
npx create-react-app malegaon-aagar
cd malegaon-aagar

# Install dependencies
npm install firebase react-router-dom @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### Step 2: Folder Structure

```bash
# Create folders
mkdir -p src/components/main
mkdir -p src/components/admin
mkdir -p src/pages/main
mkdir -p src/pages/admin
mkdir -p src/contexts
mkdir -p src/config
mkdir -p src/services
mkdir -p src/styles
mkdir -p src/utils
```

**Final Structure:**
```
malegaon-aagar/
├── src/
│   ├── components/
│   │   ├── main/          # Main site components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── RouteCard.jsx
│   │   │   ├── StopSelector.jsx
│   │   │   └── SearchBar.jsx
│   │   └── admin/         # Admin site components
│   │       ├── Sidebar.jsx
│   │       └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── main/          # Main site pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── AllRoutesPage.jsx
│   │   │   ├── RouteDetailsPage.jsx
│   │   │   └── SearchRoutesPage.jsx
│   │   └── admin/         # Admin pages
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── StopsList.jsx
│   │       ├── AddStop.jsx
│   │       ├── RoutesList.jsx
│   │       └── CreateRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── services/
│   │   ├── stopService.js
│   │   └── routeService.js
│   ├── styles/
│   │   ├── main.css
│   │   └── admin.css
│   ├── App.js
│   └── index.js
```

### Step 3: Create .env File

Create `.env`:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_ADMIN_EMAIL=admin@malegaonaagar.com
```

---

## 🔥 Phase 1: Firebase Setup (Day 1 - Afternoon)

### Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project: `malegaon-aagar`
3. Enable **Authentication** → Email/Password
4. Add admin user: `admin@malegaonaagar.com`
5. Enable **Firestore Database** (Production mode, asia-south1)

### Step 2: Firestore Security Rules

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

### Step 3: Firebase Config

Create `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

---

## 🔐 Phase 2: Authentication (Day 1 - Evening)

### Step 1: Auth Context

Create `src/contexts/AuthContext.jsx`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const isAdmin = () => {
    return user?.email === process.env.REACT_APP_ADMIN_EMAIL;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { user, login, logout, isAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### Step 2: Protected Route

Create `src/components/admin/ProtectedRoute.jsx`:

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 🗄️ Phase 3: Database Services (Day 2 - Morning)

### Stop Service

Create `src/services/stopService.js`:

```javascript
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  getDocs, getDoc, query, where, orderBy, Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const stopService = {
  // Get all stops
  getAllStops: async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'stops'), orderBy('stopNameEnglish'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get stop by ID
  getStopById: async (stopId) => {
    const docSnap = await getDoc(doc(db, 'stops', stopId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Stop not found');
  },

  // Add stop
  addStop: async (stopData) => {
    const docRef = await addDoc(collection(db, 'stops'), {
      ...stopData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: auth.currentUser?.email || 'system'
    });
    return docRef.id;
  },

  // Update stop
  updateStop: async (stopId, stopData) => {
    await updateDoc(doc(db, 'stops', stopId), {
      ...stopData,
      updatedAt: Timestamp.now()
    });
  },

  // Delete stop
  deleteStop: async (stopId) => {
    await deleteDoc(doc(db, 'stops', stopId));
  },

  // Get active stops
  getActiveStops: async () => {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'stops'), 
        where('isActive', '==', true),
        orderBy('stopNameEnglish')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
```

### Route Service

Create `src/services/routeService.js`:

```javascript
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  getDocs, getDoc, query, where, orderBy, Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { stopService } from './stopService';

export const routeService = {
  // Get all routes
  getAllRoutes: async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'routes'), orderBy('routeNumber'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get route with stops
  getRouteById: async (routeId) => {
    // Get route
    const routeDoc = await getDoc(doc(db, 'routes', routeId));
    if (!routeDoc.exists()) throw new Error('Route not found');

    // Get route stops
    const stopsQuery = query(
      collection(db, 'routeStops'),
      where('routeId', '==', routeId),
      orderBy('stopSequence')
    );
    const stopsSnapshot = await getDocs(stopsQuery);
    
    // Get full stop details
    const routeStops = await Promise.all(
      stopsSnapshot.docs.map(async (stopDoc) => {
        const stopData = stopDoc.data();
        const stopDetails = await stopService.getStopById(stopData.stopId);
        return {
          id: stopDoc.id,
          ...stopData,
          stopDetails
        };
      })
    );

    return {
      id: routeDoc.id,
      ...routeDoc.data(),
      stops: routeStops
    };
  },

  // Create route with stops
  createRoute: async (routeData, stops) => {
    // Create route
    const routeRef = await addDoc(collection(db, 'routes'), {
      ...routeData,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: auth.currentUser?.email
    });

    // Create route-stops
    for (let i = 0; i < stops.length; i++) {
      await addDoc(collection(db, 'routeStops'), {
        routeId: routeRef.id,
        stopId: stops[i].stopId,
        stopSequence: i + 1,
        distanceFromPrevious: stops[i].distanceFromPrevious || 0,
        estimatedTimeFromPrevious: stops[i].estimatedTimeFromPrevious || 0,
        createdAt: Timestamp.now()
      });
    }

    return routeRef.id;
  },

  // Update route
  updateRoute: async (routeId, routeData) => {
    await updateDoc(doc(db, 'routes', routeId), {
      ...routeData,
      updatedAt: Timestamp.now()
    });
  },

  // Delete route
  deleteRoute: async (routeId) => {
    // Delete route
    await deleteDoc(doc(db, 'routes', routeId));

    // Delete route-stops
    const stopsQuery = query(
      collection(db, 'routeStops'),
      where('routeId', '==', routeId)
    );
    const stopsSnapshot = await getDocs(stopsQuery);
    for (const stopDoc of stopsSnapshot.docs) {
      await deleteDoc(doc(db, 'routeStops', stopDoc.id));
    }
  },

  // Search routes between two stops
  searchRoutes: async (fromStopId, toStopId) => {
    // Get all routes
    const allRoutes = await routeService.getAllRoutes();
    const matchingRoutes = [];

    for (const route of allRoutes) {
      // Get stops for this route
      const routeWithStops = await routeService.getRouteById(route.id);
      
      // Find from and to stop positions
      const fromIndex = routeWithStops.stops.findIndex(s => s.stopId === fromStopId);
      const toIndex = routeWithStops.stops.findIndex(s => s.stopId === toStopId);
      
      // Check if route contains both stops in correct order
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
        matchingRoutes.push({
          ...routeWithStops,
          fromStopIndex: fromIndex,
          toStopIndex: toIndex,
          stopsInJourney: routeWithStops.stops.slice(fromIndex, toIndex + 1)
        });
      }
    }

    return matchingRoutes;
  }
};
```

---

## 👨‍💼 Phase 4: Admin Site (Day 2-3)

### Admin Login

Create `src/pages/admin/AdminLogin.jsx`:

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Malegaon Aagar Admin</h1>
        <h2 className="marathi">मालेगाव आगार प्रशासक</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="back-link">
          <a href="/">← Back to Main Site</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
```

### Admin Sidebar

Create `src/components/admin/Sidebar.jsx`:

```javascript
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>

      <nav className="sidebar-nav">
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/stops">Manage Stops</Link>
        <Link to="/admin/stops/add">Add Stop</Link>
        <Link to="/admin/routes">Manage Routes</Link>
        <Link to="/admin/routes/create">Create Route</Link>
      </nav>

      <div className="sidebar-footer">
        <a href="/" target="_blank">View Main Site</a>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
```

### Admin Dashboard

Create `src/pages/admin/AdminDashboard.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { stopService } from '../../services/stopService';
import { routeService } from '../../services/routeService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStops: 0, totalRoutes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [stops, routes] = await Promise.all([
        stopService.getAllStops(),
        routeService.getAllRoutes()
      ]);
      setStats({
        totalStops: stops.length,
        totalRoutes: routes.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Stops</h3>
          <p className="stat-number">{stats.totalStops}</p>
        </div>
        <div className="stat-card">
          <h3>Total Routes</h3>
          <p className="stat-number">{stats.totalRoutes}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

### Add Stop Page

Create `src/pages/admin/AddStop.jsx`:

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stopService } from '../../services/stopService';

const AddStop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    stopNameEnglish: '',
    stopNameMarathi: '',
    stopCode: '',
    latitude: '',
    longitude: '',
    address: '',
    landmark: '',
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await stopService.addStop({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        city: 'Malegaon',
        district: 'Nashik',
        state: 'Maharashtra'
      });
      alert('Stop added successfully!');
      navigate('/admin/stops');
    } catch (error) {
      alert('Error adding stop');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Add New Stop</h1>
      <p className="subtitle">नवीन स्टॉप जोडा</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Stop Name (English) *</label>
            <input
              type="text"
              name="stopNameEnglish"
              value={formData.stopNameEnglish}
              onChange={handleChange}
              placeholder="e.g., Gandhi Chowk"
              required
            />
          </div>

          <div className="form-group">
            <label>स्टॉप नाव (मराठी) *</label>
            <input
              type="text"
              name="stopNameMarathi"
              value={formData.stopNameMarathi}
              onChange={handleChange}
              placeholder="उदा. गांधी चौक"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stop Code</label>
            <input
              type="text"
              name="stopCode"
              value={formData.stopCode}
              onChange={handleChange}
              placeholder="e.g., MGN001"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude *</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="20.5579"
              required
            />
          </div>

          <div className="form-group">
            <label>Longitude *</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="74.5287"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Landmark</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="Near City Hospital"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Active</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/stops')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding...' : 'Add Stop'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStop;
```

### Stops List Page

Create `src/pages/admin/StopsList.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stopService } from '../../services/stopService';

const StopsList = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    try {
      const data = await stopService.getAllStops();
      setStops(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await stopService.deleteStop(id);
        loadStops();
      } catch (error) {
        alert('Error deleting stop');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Manage Stops</h1>
          <p>Total: {stops.length}</p>
        </div>
        <Link to="/admin/stops/add" className="btn-primary">Add Stop</Link>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name (English)</th>
            <th>नाव (मराठी)</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stops.map(stop => (
            <tr key={stop.id}>
              <td>{stop.stopCode || '-'}</td>
              <td>{stop.stopNameEnglish}</td>
              <td>{stop.stopNameMarathi}</td>
              <td>{stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}</td>
              <td>
                <span className={`badge ${stop.isActive ? 'active' : 'inactive'}`}>
                  {stop.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button onClick={() => handleDelete(stop.id, stop.stopNameEnglish)} className="btn-delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StopsList;
```

### Create Route Page

Create `src/pages/admin/CreateRoute.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stopService } from '../../services/stopService';
import { routeService } from '../../services/routeService';

const CreateRoute = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allStops, setAllStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [formData, setFormData] = useState({
    routeNumber: '',
    routeNameEnglish: '',
    routeNameMarathi: '',
    routeType: 'local',
    operatorName: 'Malegaon ST',
    fare: ''
  });

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    const stops = await stopService.getActiveStops();
    setAllStops(stops);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddStop = (stopId) => {
    const stop = allStops.find(s => s.id === stopId);
    if (stop && !selectedStops.find(s => s.stopId === stopId)) {
      setSelectedStops(prev => [...prev, {
        stopId: stop.id,
        stopName: stop.stopNameEnglish,
        stopNameMarathi: stop.stopNameMarathi,
        distanceFromPrevious: 0,
        estimatedTimeFromPrevious: 0
      }]);
    }
  };

  const handleRemoveStop = (index) => {
    setSelectedStops(prev => prev.filter((_, i) => i !== index));
  };

  const handleStopDataChange = (index, field, value) => {
    setSelectedStops(prev => prev.map((stop, i) => 
      i === index ? { ...stop, [field]: value } : stop
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedStops.length < 2) {
      alert('Add at least 2 stops');
      return;
    }

    setLoading(true);
    try {
      const routeData = {
        ...formData,
        fare: parseFloat(formData.fare),
        startStop: selectedStops[0].stopId,
        endStop: selectedStops[selectedStops.length - 1].stopId
      };

      const stops = selectedStops.map((stop, index) => ({
        stopId: stop.stopId,
        distanceFromPrevious: index === 0 ? 0 : parseFloat(stop.distanceFromPrevious) || 0,
        estimatedTimeFromPrevious: index === 0 ? 0 : parseInt(stop.estimatedTimeFromPrevious) || 0
      }));

      await routeService.createRoute(routeData, stops);
      alert('Route created!');
      navigate('/admin/routes');
    } catch (error) {
      alert('Error creating route');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Create New Route</h1>
      <p className="subtitle">नवीन मार्ग तयार करा</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Route Number *</label>
            <input
              type="text"
              name="routeNumber"
              value={formData.routeNumber}
              onChange={handleChange}
              placeholder="101"
              required
            />
          </div>

          <div className="form-group">
            <label>Route Type</label>
            <select name="routeType" value={formData.routeType} onChange={handleChange}>
              <option value="local">Local</option>
              <option value="express">Express</option>
              <option value="shuttle">Shuttle</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Route Name (English) *</label>
            <input
              type="text"
              name="routeNameEnglish"
              value={formData.routeNameEnglish}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>मार्ग नाव (मराठी) *</label>
            <input
              type="text"
              name="routeNameMarathi"
              value={formData.routeNameMarathi}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Base Fare (₹)</label>
          <input
            type="number"
            name="fare"
            value={formData.fare}
            onChange={handleChange}
            placeholder="25"
          />
        </div>

        <div className="form-section">
          <h3>Add Stops</h3>
          <select onChange={(e) => handleAddStop(e.target.value)} value="">
            <option value="">-- Select a stop --</option>
            {allStops.map(stop => (
              <option key={stop.id} value={stop.id}>
                {stop.stopNameEnglish} ({stop.stopNameMarathi})
              </option>
            ))}
          </select>

          {selectedStops.length > 0 && (
            <div className="selected-stops">
              {selectedStops.map((stop, index) => (
                <div key={index} className="stop-item">
                  <span className="stop-number">{index + 1}</span>
                  <div className="stop-info">
                    <p>{stop.stopName}</p>
                    <p className="marathi">{stop.stopNameMarathi}</p>
                  </div>
                  {index > 0 && (
                    <div className="stop-inputs">
                      <input
                        type="number"
                        placeholder="Distance (km)"
                        value={stop.distanceFromPrevious}
                        onChange={(e) => handleStopDataChange(index, 'distanceFromPrevious', e.target.value)}
                        step="0.1"
                      />
                      <input
                        type="number"
                        placeholder="Time (min)"
                        value={stop.estimatedTimeFromPrevious}
                        onChange={(e) => handleStopDataChange(index, 'estimatedTimeFromPrevious', e.target.value)}
                      />
                    </div>
                  )}
                  <button type="button" onClick={() => handleRemoveStop(index)} className="btn-remove">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/routes')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Route'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoute;
```

### Routes List Page

Create `src/pages/admin/RoutesList.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { routeService } from '../../services/routeService';

const RoutesList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routeService.getAllRoutes();
      setRoutes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete route "${name}"?`)) {
      try {
        await routeService.deleteRoute(id);
        loadRoutes();
      } catch (error) {
        alert('Error deleting route');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Manage Routes</h1>
          <p>Total: {routes.length}</p>
        </div>
        <Link to="/admin/routes/create" className="btn-primary">Create Route</Link>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Route No.</th>
            <th>Name (English)</th>
            <th>नाव (मराठी)</th>
            <th>Type</th>
            <th>Fare</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map(route => (
            <tr key={route.id}>
              <td><strong>{route.routeNumber}</strong></td>
              <td>{route.routeNameEnglish}</td>
              <td>{route.routeNameMarathi}</td>
              <td><span className="badge">{route.routeType}</span></td>
              <td>₹{route.fare}</td>
              <td>
                <button onClick={() => handleDelete(route.id, route.routeNameEnglish)} className="btn-delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoutesList;
```

### Admin CSS

Create `src/styles/admin.css`:

```css
/* Admin Layout */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.admin-content {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
  background: #f5f6fa;
}

.sidebar-header {
  padding: 30px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.sidebar-nav a {
  display: block;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
  transition: background 0.3s;
}

.sidebar-nav a:hover {
  background: rgba(255,255,255,0.1);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.sidebar-footer a {
  display: block;
  color: #3498db;
  margin-bottom: 10px;
  text-decoration: none;
}

.sidebar-footer button {
  width: 100%;
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Login Page */
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.login-container h1 {
  text-align: center;
  margin-bottom: 10px;
}

.login-container .marathi {
  text-align: center;
  color: #667eea;
  margin-bottom: 30px;
}

.back-link {
  text-align: center;
  margin-top: 20px;
}

.back-link a {
  color: #667eea;
  text-decoration: none;
}

/* Admin Pages */
.admin-page {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.subtitle {
  color: #667eea;
  margin-top: -10px;
  margin-bottom: 20px;
}

/* Forms */
.admin-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-primary {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Dashboard */
.dashboard h1 {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
  text-transform: uppercase;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

/* Tables */
.data-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8f9fa;
}

.data-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #667eea;
  color: white;
}

.badge.active {
  background: #27ae60;
}

.badge.inactive {
  background: #e74c3c;
}

.btn-delete {
  padding: 6px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

/* Route Creation */
.form-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #ddd;
}

.selected-stops {
  margin-top: 20px;
}

.stop-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
}

.stop-number {
  width: 32px;
  height: 32px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.stop-info {
  flex: 1;
}

.stop-info p {
  margin: 0;
}

.stop-info .marathi {
  font-size: 13px;
  color: #666;
}

.stop-inputs {
  display: flex;
  gap: 10px;
}

.stop-inputs input {
  width: 120px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-remove {
  padding: 6px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
}
```

---

## 🌐 Phase 5: Main Site (Day 4-5)

### Header Component

Create `src/components/main/Header.jsx`:

```javascript
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>Malegaon Aagar</h1>
          <p className="marathi">मालेगाव आगार</p>
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/routes">All Routes</Link>
          <Link to="/search">Search Routes</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
```

### Footer Component

Create `src/components/main/Footer.jsx`:

```javascript
import React from 'react';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <p>&copy; 2025 Malegaon Aagar. All rights reserved.</p>
        <a href="/admin/login">Admin Login</a>
      </div>
    </footer>
  );
};

export default Footer;
```

### Home Page

Create `src/pages/main/HomePage.jsx`:

```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import '../../styles/main.css';

const HomePage = () => {
  return (
    <div className="main-site">
      <Header />
      
      <main className="home-hero">
        <div className="hero-content">
          <h1>Welcome to Malegaon Aagar</h1>
          <h2 className="marathi">मालेगाव आगार मध्ये आपले स्वागत आहे</h2>
          <p>Your Complete Bus Timetable & Route Finder</p>
          
          <div className="cta-buttons">
            <Link to="/routes" className="btn-large">View All Routes</Link>
            <Link to="/search" className="btn-large btn-outline">Search Routes</Link>
          </div>
        </div>
      </main>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-box">
              <div className="icon">🚌</div>
              <h3>All Routes</h3>
              <p>Browse complete list of bus routes in Malegaon</p>
            </div>
            <div className="feature-box">
              <div className="icon">🔍</div>
              <h3>Smart Search</h3>
              <p>Find routes between any two stops</p>
            </div>
            <div className="feature-box">
              <div className="icon">📍</div>
              <h3>Detailed Info</h3>
              <p>View all stops and timings for each route</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
```

### All Routes Page

Create `src/pages/main/AllRoutesPage.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import { routeService } from '../../services/routeService';

const AllRoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routeService.getAllRoutes();
      setRoutes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-site">
      <Header />
      
      <main className="page-content">
        <div className="container">
          <div className="page-title">
            <h1>All Bus Routes</h1>
            <p className="marathi">सर्व बस मार्ग</p>
            <p className="count">Total Routes: {routes.length}</p>
          </div>

          {loading ? (
            <div className="loading">Loading routes...</div>
          ) : (
            <div className="routes-grid">
              {routes.map(route => (
                <Link 
                  key={route.id} 
                  to={`/routes/${route.id}`} 
                  className="route-card"
                >
                  <div className="route-number">{route.routeNumber}</div>
                  <div className="route-info">
                    <h3>{route.routeNameEnglish}</h3>
                    <p className="marathi">{route.routeNameMarathi}</p>
                    <div className="route-meta">
                      <span className="badge">{route.routeType}</span>
                      <span className="fare">₹{route.fare}</span>
                    </div>
                  </div>
                  <div className="arrow">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllRoutesPage;
```

### Route Details Page

Create `src/pages/main/RouteDetailsPage.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import { routeService } from '../../services/routeService';

const RouteDetailsPage = () => {
  const { routeId } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoute();
  }, [routeId]);

  const loadRoute = async () => {
    try {
      const data = await routeService.getRouteById(routeId);
      setRoute(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="main-site"><div className="loading">Loading...</div></div>;
  if (!route) return <div className="main-site"><div>Route not found</div></div>;

  return (
    <div className="main-site">
      <Header />
      
      <main className="page-content">
        <div className="container">
          <Link to="/routes" className="back-link">← Back to All Routes</Link>

          <div className="route-detail-header">
            <div className="route-badge">{route.routeNumber}</div>
            <div>
              <h1>{route.routeNameEnglish}</h1>
              <p className="marathi">{route.routeNameMarathi}</p>
              <div className="route-detail-meta">
                <span className="badge">{route.routeType}</span>
                <span>Operator: {route.operatorName}</span>
                <span>Base Fare: ₹{route.fare}</span>
              </div>
            </div>
          </div>

          <div className="stops-section">
            <h2>Route Stops ({route.stops.length})</h2>
            <p className="marathi">मार्गावरील स्टॉप</p>
            
            <div className="stops-list">
              {route.stops.map((stop, index) => (
                <div key={stop.id} className="stop-detail-item">
                  <div className="stop-sequence">{index + 1}</div>
                  <div className="stop-line">
                    {index < route.stops.length - 1 && <div className="connector"></div>}
                  </div>
                  <div className="stop-detail-info">
                    <h3>{stop.stopDetails.stopNameEnglish}</h3>
                    <p className="marathi">{stop.stopDetails.stopNameMarathi}</p>
                    {stop.stopDetails.landmark && (
                      <p className="landmark">📍 {stop.stopDetails.landmark}</p>
                    )}
                    {index > 0 && (
                      <div className="stop-metrics">
                        <span>🚶 {stop.distanceFromPrevious} km</span>
                        <span>⏱️ {stop.estimatedTimeFromPrevious} min</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RouteDetailsPage;
```

### Search Routes Page

Create `src/pages/main/SearchRoutesPage.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import { stopService } from '../../services/stopService';
import { routeService } from '../../services/routeService';

const SearchRoutesPage = () => {
  const [allStops, setAllStops] = useState([]);
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    const stops = await stopService.getActiveStops();
    setAllStops(stops);
  };

  const handleSearch = async () => {
    if (!fromStop || !toStop) {
      alert('Please select both From and To stops');
      return;
    }

    if (fromStop === toStop) {
      alert('From and To stops cannot be the same');
      return;
    }

    setSearching(true);
    setSearched(true);

    try {
      const results = await routeService.searchRoutes(fromStop, toStop);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
      alert('Error searching routes');
    } finally {
      setSearching(false);
    }
  };

  const getStopName = (stopId) => {
    const stop = allStops.find(s => s.id === stopId);
    return stop ? stop.stopNameEnglish : '';
  };

  return (
    <div className="main-site">
      <Header />
      
      <main className="page-content">
        <div className="container">
          <div className="page-title">
            <h1>Search Bus Routes</h1>
            <p className="marathi">बस मार्ग शोधा</p>
          </div>

          <div className="search-box">
            <div className="search-form">
              <div className="form-group">
                <label>From (प्रारंभ)</label>
                <select 
                  value={fromStop} 
                  onChange={(e) => setFromStop(e.target.value)}
                  className="search-select"
                >
                  <option value="">Select starting stop</option>
                  {allStops.map(stop => (
                    <option key={stop.id} value={stop.id}>
                      {stop.stopNameEnglish} ({stop.stopNameMarathi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-arrow">⬇️</div>

              <div className="form-group">
                <label>To (गंतव्य)</label>
                <select 
                  value={toStop} 
                  onChange={(e) => setToStop(e.target.value)}
                  className="search-select"
                >
                  <option value="">Select destination stop</option>
                  {allStops.map(stop => (
                    <option key={stop.id} value={stop.id}>
                      {stop.stopNameEnglish} ({stop.stopNameMarathi})
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleSearch} 
                disabled={searching}
                className="btn-search"
              >
                {searching ? 'Searching...' : 'Search Routes 🔍'}
              </button>
            </div>
          </div>

          {searched && (
            <div className="search-results">
              <h2>Search Results</h2>
              {searchResults.length === 0 ? (
                <div className="no-results">
                  <p>😔 No direct routes found between these stops.</p>
                  <p className="marathi">या स्टॉप दरम्यान कोणतेही थेट मार्ग आढळले नाहीत.</p>
                </div>
              ) : (
                <>
                  <p className="results-count">
                    Found {searchResults.length} route(s) from <strong>{getStopName(fromStop)}</strong> to <strong>{getStopName(toStop)}</strong>
                  </p>
                  
                  <div className="routes-list">
                    {searchResults.map(route => (
                      <div key={route.id} className="search-result-card">
                        <div className="result-header">
                          <div className="route-badge">{route.routeNumber}</div>
                          <div>
                            <h3>{route.routeNameEnglish}</h3>
                            <p className="marathi">{route.routeNameMarathi}</p>
                          </div>
                          <div className="result-fare">₹{route.fare}</div>
                        </div>

                        <div className="result-journey">
                          <p><strong>Your Journey:</strong></p>
                          <div className="journey-stops">
                            {route.stopsInJourney.map((stop, index) => (
                              <div key={stop.id} className="journey-stop">
                                <span className="journey-number">{index + 1}</span>
                                <span>{stop.stopDetails.stopNameEnglish}</span>
                                {index < route.stopsInJourney.length - 1 && (
                                  <span className="journey-arrow">→</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="stops-count">
                            {route.stopsInJourney.length} stops
                          </p>
                        </div>

                        <Link to={`/routes/${route.id}`} className="view-details-btn">
                          View Full Route Details →
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchRoutesPage;
```

### Main Site CSS

Create `src/styles/main.css`:

```css
/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  line-height: 1.6;
  color: #333;
}

.main-site {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.marathi {
  color: #667eea;
  font-weight: 500;
}

/* Header */
.main-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.logo {
  text-decoration: none;
  color: #333;
}

.logo h1 {
  font-size: 24px;
  margin: 0;
}

.logo .marathi {
  font-size: 14px;
  margin-top: -5px;
}

.main-header nav {
  display: flex;
  gap: 30px;
}

.main-header nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.main-header nav a:hover {
  color: #667eea;
}

/* Footer */
.main-footer {
  background: #2c3e50;
  color: white;
  padding: 30px 20px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-content a {
  color: #667eea;
  text-decoration: none;
}

/* Home Hero */
.home-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 10px;
}

.hero-content h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: rgba(255,255,255,0.9);
}

.hero-content p {
  font-size: 18px;
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn-large {
  padding: 15px 40px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  transition: transform 0.3s;
}

.btn-large:hover {
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

/* Features Section */
.features-section {
  padding: 80px 20px;
  background: #f8f9fa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
}

.feature-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.feature-box .icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-box h3 {
  margin-bottom: 15px;
  color: #333;
}

.feature-box p {
  color: #666;
}

/* Page Content */
.page-content {
  flex: 1;
  padding: 60px 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 50px;
}

.page-title h1 {
  font-size: 42px;
  margin-bottom: 10px;
}

.page-title .count {
  color: #666;
  margin-top: 10px;
}

.back-link {
  display: inline-block;
  margin-bottom: 30px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

/* Routes Grid */
.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.route-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  color: #333;
  transition: transform 0.3s, box-shadow 0.3s;
}

.route-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.route-number {
  width: 60px;
  height: 60px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.route-info {
  flex: 1;
}

.route-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.route-meta {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  align-items: center;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e0e7ff;
  color: #667eea;
  border-radius: 12px;
  font-size: 12px;
  text-transform: capitalize;
}

.fare {
  font-weight: 600;
  color: #27ae60;
}

.arrow {
  font-size: 24px;
  color: #667eea;
}

/* Route Details */
.route-detail-header {
  background: white;
  padding: 40px;
  border-radius: 12px;
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.route-badge {
  width: 80px;
  height: 80px;
  background: #667eea;
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  flex-shrink: 0;
}

.route-detail-header h1 {
  margin: 0 0 10px 0;
}

.route-detail-meta {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

/* Stops Section */
.stops-section {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stops-section h2 {
  margin: 0 0 30px 0;
}

.stops-list {
  margin-top: 30px;
}

.stop-detail-item {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stop-sequence {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.stop-line {
  position: relative;
  width: 20px;
}

.connector {
  position: absolute;
  left: 50%;
  top: 40px;
  bottom: -20px;
  width: 3px;
  background: #ddd;
  transform: translateX(-50%);
}

.stop-detail-info {
  flex: 1;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.stop-detail-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.landmark {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.stop-metrics {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

/* Search Page */
.search-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 40px;
}

.search-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.search-select {
  width: 100%;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
}

.search-select:focus {
  outline: none;
  border-color: #667eea;
}

.search-arrow {
  text-align: center;
  font-size: 24px;
  margin: 10px 0;
}

.btn-search {
  width: 100%;
  padding: 18px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-search:hover {
  background: #5568d3;
}

.btn-search:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Search Results */
.search-results {
  margin-top: 40px;
}

.search-results h2 {
  margin-bottom: 20px;
}

.results-count {
  background: #e0e7ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
  color: #333;
}

.no-results {
  background: #fff3cd;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
}

.no-results p {
  font-size: 18px;
  margin-bottom: 10px;
}

.routes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-result-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.result-header > div:nth-child(2) {
  flex: 1;
}

.result-header h3 {
  margin: 0 0 5px 0;
}

.result-fare {
  font-size: 24px;
  font-weight: bold;
  color: #27ae60;
}

.result-journey {
  margin: 20px 0;
}

.journey-stops {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
}

.journey-stop {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 8px;
}

.journey-number {
  width: 24px;
  height: 24px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.journey-arrow {
  color: #667eea;
  font-weight: bold;
}

.stops-count {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
}

.view-details-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.3s;
}

.view-details-btn:hover {
  background: #5568d3;
}

.loading {
  text-align: center;
  padding: 60px;
  font-size: 18px;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 20px;
  }

  .main-header nav {
    margin-top: 15px;
  }

  .hero-content h1 {
    font-size: 32px;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .routes-grid {
    grid-template-columns: 1fr;
  }

  .route-detail-header {
    flex-direction: column;
    text-align: center;
  }

  .journey-stops {
    flex-direction: column;
    align-items: stretch;
  }
}
```

---

## 🔀 Phase 6: App Routing (Day 5 - Evening)

### Update App.js

Update `src/App.js`:

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Admin Components
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import StopsList from './pages/admin/StopsList';
import AddStop from './pages/admin/AddStop';
import RoutesList from './pages/admin/RoutesList';
import CreateRoute from './pages/admin/CreateRoute';
import Sidebar from './components/admin/Sidebar';

// Main Site Components
import HomePage from './pages/main/HomePage';
import AllRoutesPage from './pages/main/AllRoutesPage';
import RouteDetailsPage from './pages/main/RouteDetailsPage';
import SearchRoutesPage from './pages/main/SearchRoutesPage';

import './styles/main.css';
import './styles/admin.css';

// Admin Layout Wrapper
const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Main Site Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/routes" element={<AllRoutesPage />} />
          <Route path="/routes/:routeId" element={<RouteDetailsPage />} />
          <Route path="/search" element={<SearchRoutesPage />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stops"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <StopsList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stops/add"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AddStop />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/routes"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <RoutesList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/routes/create"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CreateRoute />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## ✅ Testing Checklist (Day 6)

### Admin Site Testing

1. **Authentication**
   - [ ] Go to `/admin/login`
   - [ ] Login with admin credentials
   - [ ] Verify redirect to dashboard
   - [ ] Test logout

2. **Stops Management**
   - [ ] Add a new stop with English and Marathi names
   - [ ] View stops list
   - [ ] Delete a stop
   - [ ] Verify stop appears/disappears

3. **Routes Management**
   - [ ] Create a route with at least 3 stops
   - [ ] View routes list
   - [ ] Verify route shows route number and names
   - [ ] Delete a route

### Main Site Testing

4. **Home Page**
   - [ ] Visit `/`
   - [ ] Click "View All Routes"
   - [ ] Click "Search Routes"

5. **All Routes Page**
   - [ ] Visit `/routes`
   - [ ] Verify all routes display
   - [ ] Click on a route card

6. **Route Details Page**
   - [ ] View route details
   - [ ] Verify all stops display in sequence
   - [ ] Check stop names in English and Marathi
   - [ ] Verify distances and times show (if entered)

7. **Search Routes**
   - [ ] Visit `/search`
   - [ ] Select "From" stop
   - [ ] Select "To" stop
   - [ ] Click "Search Routes"
   - [ ] Verify matching routes display
   - [ ] Verify "Your Journey" section shows stops between from and to
   - [ ] Click "View Full Route Details"

---

## 🚀 Deployment (Day 7)

### Build and Deploy

```bash
# Build the app
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init
# Select: Hosting
# Public directory: build
# Single-page app: Yes

# Deploy
firebase deploy

# Your app will be live at:
# https://your-project.web.app
```

---

## 📋 Complete Feature List

### ✅ Implemented Features

**Admin Site** (`/admin`)
- ✅ Password-protected login
- ✅ Dashboard with statistics
- ✅ Add stops (English + Marathi)
- ✅ View all stops
- ✅ Delete stops
- ✅ Create routes with multiple stops
- ✅ View all routes
- ✅ Delete routes
- ✅ Logout functionality

**Main Site** (`/`)
- ✅ Home page with call-to-action
- ✅ View all bus routes
- ✅ View detailed route information
- ✅ See all stops on a route
- ✅ Search routes by from/to stops
- ✅ Display all stops in dropdowns
- ✅ Show matching routes with journey details
- ✅ Bilingual support (English + Marathi)

### 🔄 Future Features (Later)
- Schedule management
- Real-time tracking
- Notifications
- User accounts
- Favorites
- Mobile app
- Offline mode

---

## 🆘 Quick Troubleshooting

**Firebase not connecting?**
- Check `.env` file exists and has correct values
- Verify Firebase project is active
- Check console for errors

**Stops/Routes not showing?**
- Check Firebase Console → Firestore
- Verify data exists
- Check browser console for errors

**Admin login not working?**
- Verify admin email matches exactly
- Check Firebase Console → Authentication
- Clear browser cache

---

## 📞 Support

**Questions?** Check:
- Firebase Console: https://console.firebase.google.com
- React Router Docs: https://reactrouter.com
- Firestore Docs: https://firebase.google.com/docs/firestore

---

**Project Complete! 🎉**

You now have:
- ✅ Main site for viewing routes
- ✅ Admin site for managing data
- ✅ Search functionality
- ✅ Detailed route views
- ✅ Bilingual support

**Next Steps:**
- Add real bus stop data
- Create actual routes
- Test with users
- Plan Phase 2 (Schedules)
