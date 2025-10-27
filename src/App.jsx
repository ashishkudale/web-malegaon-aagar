import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Admin Components
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import StopsList from './pages/admin/StopsList';
import AddStop from './pages/admin/AddStop';
import EditStop from './pages/admin/EditStop';
import RoutesList from './pages/admin/RoutesList';
import CreateRoute from './pages/admin/CreateRoute';
import EditRoute from './pages/admin/EditRoute';
import Sidebar from './components/admin/Sidebar';

// Main Site Components
import HomePage from './pages/main/HomePage';
import AllRoutesPage from './pages/main/AllRoutesPage';
import RouteDetailsPage from './pages/main/RouteDetailsPage';
import SearchRoutesPage from './pages/main/SearchRoutesPage';
import NotFound from './pages/NotFound';

import './App.css';
import './styles/admin.css';
import './styles/main.css';

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
            path="/admin/stops/edit/:stopId"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <EditStop />
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

          <Route
            path="/admin/routes/edit/:routeId"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <EditRoute />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
