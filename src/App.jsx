import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import ServiceProviders from './pages/ServiceProviders';
import ProviderDetail from './pages/ProviderDetail';
import Users from './pages/Users';
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
import './pages/Login.css';

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
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Restricted to Super Admin */}
          <Route path="users" element={<ProtectedRoute requiredRole="superadmin"><Users /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute requiredRole="superadmin"><Orders /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute requiredRole="superadmin"><OrderDetail /></ProtectedRoute>} />
          <Route path="bookings" element={<ProtectedRoute requiredRole="superadmin"><Bookings /></ProtectedRoute>} />
          <Route path="bookings/:id" element={<ProtectedRoute requiredRole="superadmin"><BookingDetail /></ProtectedRoute>} />
          <Route path="db-explorer" element={<ProtectedRoute requiredRole="superadmin"><DatabaseExplorer /></ProtectedRoute>} />

          {/* Accessible to both */}
          <Route path="pending-products" element={<PendingProducts />} />
          <Route path="pending-products/:id" element={<ProductDetail />} />
          <Route path="pending-services" element={<PendingServices />} />
          <Route path="pending-services/:id" element={<ServiceDetail />} />
          <Route path="pending-ads" element={<PendingAds />} />
          <Route path="pending-ads/:id" element={<AdDetail />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/:id" element={<VendorDetail />} />
          <Route path="service-providers" element={<ServiceProviders />} />
          <Route path="service-providers/:id" element={<ProviderDetail />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
