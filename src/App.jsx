import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import ServiceProviders from './pages/ServiceProviders';
import ProviderDetail from './pages/ProviderDetail';
import Dashboard from './pages/Dashboard';
import PendingProducts from './pages/PendingProducts';
import ProductDetail from './pages/ProductDetail';
import PendingServices from './pages/PendingServices';
import ServiceDetail from './pages/ServiceDetail';
import PendingAds from './pages/PendingAds';
import AdDetail from './pages/AdDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import DatabaseExplorer from './pages/DatabaseExplorer';
import Drivers from './pages/Drivers';
import DriverDetail from './pages/DriverDetail';
import EmergencyMonitor from './pages/EmergencyMonitor';
import './pages/Login.css';

const IndexRedirect = () => {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin';
  return <Navigate to={isSuperAdmin ? "/db-explorer" : "/dashboard"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<IndexRedirect />} />
          
          {/* Admin only routes */}
          <Route path="dashboard" element={<ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="pending-products" element={<ProtectedRoute requiredRole="admin"><PendingProducts /></ProtectedRoute>} />
          <Route path="pending-products/:id" element={<ProtectedRoute requiredRole="admin"><ProductDetail /></ProtectedRoute>} />
          <Route path="pending-services" element={<ProtectedRoute requiredRole="admin"><PendingServices /></ProtectedRoute>} />
          <Route path="pending-services/:id" element={<ProtectedRoute requiredRole="admin"><ServiceDetail /></ProtectedRoute>} />
          <Route path="pending-ads" element={<ProtectedRoute requiredRole="admin"><PendingAds /></ProtectedRoute>} />
          <Route path="pending-ads/:id" element={<ProtectedRoute requiredRole="admin"><AdDetail /></ProtectedRoute>} />
          <Route path="vendors" element={<ProtectedRoute requiredRole="admin"><Vendors /></ProtectedRoute>} />
          <Route path="vendors/:id" element={<ProtectedRoute requiredRole="admin"><VendorDetail /></ProtectedRoute>} />
          <Route path="service-providers" element={<ProtectedRoute requiredRole="admin"><ServiceProviders /></ProtectedRoute>} />
          <Route path="service-providers/:id" element={<ProtectedRoute requiredRole="admin"><ProviderDetail /></ProtectedRoute>} />

          {/* Admin routes (Regular Admin + Super Admin) */}
          <Route path="orders" element={<ProtectedRoute requiredRole="admin"><Orders /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute requiredRole="admin"><OrderDetail /></ProtectedRoute>} />
          <Route path="bookings" element={<ProtectedRoute requiredRole="admin"><Bookings /></ProtectedRoute>} />
          <Route path="bookings/:id" element={<ProtectedRoute requiredRole="admin"><BookingDetail /></ProtectedRoute>} />
          <Route path="drivers" element={<ProtectedRoute requiredRole="admin"><Drivers /></ProtectedRoute>} />
          <Route path="drivers/:id" element={<ProtectedRoute requiredRole="admin"><DriverDetail /></ProtectedRoute>} />
          <Route path="emergency" element={<ProtectedRoute requiredRole="admin"><EmergencyMonitor /></ProtectedRoute>} />

          {/* Restricted routes (Super Admin ONLY) */}
          <Route path="db-explorer" element={<ProtectedRoute requiredRole="superadmin"><DatabaseExplorer /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
