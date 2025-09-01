import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaClipboardCheck, FaEye, FaCheck, FaTimes, FaSync, FaSignOutAlt, FaUser, FaBuilding } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmployeeReviewModal from '../components/EmployeeReviewModal';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [reviewModal, setReviewModal] = useState({ isOpen: false, application: null });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'employee') {
      navigate('/employee/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated && user?.role === 'employee') {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load pending applications and stats
      const [applicationsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/api/employee/applications/pending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:3000/api/employee/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (applicationsRes.ok) {
        const applications = await applicationsRes.json();
        setPendingApplications(applications);
      }

      if (statsRes.ok) {
        const dashboardData = await statsRes.json();
        setStats(dashboardData.stats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeReview = async (applicationId, reviewData) => {
    try {
      const response = await fetch(`http://localhost:3000/api/employee/applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        closeReviewModal();
        await loadDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const openReviewModal = (application) => {
    setReviewModal({ isOpen: true, application });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, application: null });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || user?.role !== 'employee') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Welcome, {user?.fullName || user?.username}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {user?.department} - {user?.position}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                <FaSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <FaSignOutAlt className="w-4 h-4 inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Reviews</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalPending || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaClipboardCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Reviewed</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalReviewed || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Department</p>
                <p className="text-lg font-semibold text-gray-900">{user?.department || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBuilding className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Pending Review Applications</h3>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaSync className="w-4 h-4 inline mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advertisement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{app.advertisement?.productName}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">{app.advertisement?.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{app.agency?.fullname}</div>
                        <div className="text-xs text-gray-500">{app.agency?.agencyName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${app.budget?.toLocaleString() || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.timeline || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => openReviewModal(app)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors duration-200"
                        title="Review Application"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pendingApplications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FaClipboardCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">No pending reviews</p>
                <p className="text-sm text-gray-500">All applications have been reviewed or there are no new submissions.</p>
                <button
                  onClick={loadDashboardData}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaSync className="w-4 h-4 inline mr-2" />
                  Check for New Applications
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Employee Review Modal */}
        {reviewModal.isOpen && (
          <EmployeeReviewModal
            isOpen={reviewModal.isOpen}
            onClose={closeReviewModal}
            application={reviewModal.application}
            onSubmit={handleEmployeeReview}
          />
        )}

        <ToastContainer position="top-right" />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
