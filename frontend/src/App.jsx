import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import BookingConfirmation from './pages/BookingConfirmation';
import BulkBookingConfirmation from './pages/BulkBookingConfirmation';
import UserDashboard from './pages/UserDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen relative overflow-hidden">
          {/* Global Ambient Background Gradients */}
          <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-brand-400/10 dark:bg-brand-600/5 rounded-full filter blur-3xl animate-blob pointer-events-none"></div>
          <div className="absolute top-[50%] right-[5%] w-[450px] h-[450px] bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full filter blur-3xl animate-blob animation-delay-2000 pointer-events-none"></div>
          <div className="absolute bottom-[10%] left-[15%] w-80 h-80 bg-pink-400/10 dark:bg-pink-600/5 rounded-full filter blur-3xl animate-blob animation-delay-4000 pointer-events-none"></div>
          
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />

              {/* Guarded User/Attendee Routes */}
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_USER']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:id/confirmation"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_USER']}>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/bulk/confirmation"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_USER']}>
                    <BulkBookingConfirmation />
                  </ProtectedRoute>
                }
              />

              {/* Guarded Organizer Routes */}
              <Route
                path="/organizer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ORGANIZER']}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Guarded Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Global Footer */}
          <footer className="py-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-xs text-slate-400 bg-white/30 dark:bg-slate-950/20 backdrop-blur-sm">
            <p>© {new Date().getFullYear()} EventHub Inc. All rights reserved. Built with React and Spring Boot.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
