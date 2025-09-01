import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage";
import ClientDashboard from "./pages/ClientDashboard.jsx";
import AgencyDashboard from "./pages/AgencyDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import EmployeeLoginPage from "./pages/EmployeeLoginPage.jsx";
import NotFound from "./pages/NotFound";

// Toast notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import GetStarted from "./pages/GetStarted.jsx";

// Import ProtectedRoute component
import ProtectedRoute from "./components/ProtectedRoute";
import ClientForm from "./pages/get-started/ClientForm.jsx";
import AgencyForm from "./pages/get-started/AgencyForm.jsx";

// Pending approval component
const PendingApproval = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="mt-3 text-lg font-medium text-gray-900">
        Account Pending Approval
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Your account is currently being reviewed by our team. You'll be able to
        access the platform once your account is approved.
      </p>
      <div className="mt-6">
        <button
          onClick={() => (window.location.href = "/login")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Back to Login
        </button>
      </div>
    </div>
  </div>
);

// App layout component
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/register" element={<GetStarted />} />
            <Route path="/client/register" element={<ClientForm />} />
            <Route path="/client/dashboard" element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/agency/register" element={<AgencyForm />} />
            <Route path="/agency/dashboard" element={
              <ProtectedRoute requiredRole="agency">
                <AgencyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Protected routes */}
            <Route
              path="/client"
              element={
                <ProtectedRoute requiredRole="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agency"
              element={
                <ProtectedRoute requiredRole="agency">
                  <AgencyDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            <Route path="/employee/login" element={<EmployeeLoginPage />} />
            <Route path="/employee/dashboard" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppLayout />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
