import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Navbar from './component/Navbar';
import Footer from './component/Footer';
import ProtectedRoute from './component/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import BusSearch from './pages/BusSearch';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PassengerInfoPage from './pages/PassengerInfoPage';
import PaymentPage from './pages/PaymentPage';
import ETicketPage from './pages/ETicketPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

import OperatorDashboardPage from './pages/OperatorDashboardPage';
import BusManagementPage from './pages/BusManagementPage';
import RouteManagementPage from './pages/RouteManagementPage';
import TripSchedulerPage from './pages/TripSchedulerPage';

import AdminDashboardPage from './pages/AdminDashboardPage';
import ManageRegistrationsPage from './pages/ManageRegistrationsPage';
import VerificationHistoryPage from './pages/VerificationHistoryPage';
import DeactivationRequestsPage from './pages/DeactivationRequestsPage';
import ManageOperatorsPage from './pages/ManageOperatorsPage';

import BusLinkChatbot from './component/BusLinkChatbot';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-fill">
        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<BusSearch />} />
          <Route path="/seat-selection" element={<SeatSelectionPage />} />
          <Route path="/passenger-info" element={<PassengerInfoPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/ticket" element={<ETicketPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />

          {/* Operator Routes */}
          <Route
            path="/operator/dashboard"
            element={
              <ProtectedRoute allowedRole="operator">
                <OperatorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operator/fleet"
            element={
              <ProtectedRoute allowedRole="operator">
                <BusManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operator/routes"
            element={
              <ProtectedRoute allowedRole="operator">
                <RouteManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operator/trips"
            element={
              <ProtectedRoute allowedRole="operator">
                <TripSchedulerPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageRegistrationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verification-history"
            element={
              <ProtectedRoute allowedRole="admin">
                <VerificationHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/deactivation-requests"
            element={
              <ProtectedRoute allowedRole="admin">
                <DeactivationRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/operators"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageOperatorsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Routes>
      </main>

      <BusLinkChatbot />
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </div>
  );
}

export default App;
