import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaClipboardCheck, FaEye, FaCheck, FaTimes, FaSync, FaSignOutAlt, FaUser, FaBuilding, FaFilter, FaSearch, FaCalendarAlt, FaDollarSign, FaFileAlt, FaStar, FaClock } from 'react-icons/fa';
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
  const [filters, setFilters] = useState({
    search: '',
    budgetRange: 'all',
    quality: 'all',
    dateRange: 'all'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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
      
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('=== EmployeeDashboard Debug ===');
      console.log('Token from localStorage:', token ? `"${token.substring(0, 20)}..."` : 'Missing');
      console.log('User data from localStorage:', userData);
      console.log('User from context:', user);
      console.log('Is authenticated:', isAuthenticated);
      console.log('User role:', user?.role);
      console.log('================================');
      
      if (!token) {
        console.error('No token found in localStorage');
        toast.error('No authentication token found. Please log in again.');
        return;
      }
      
      // Load pending applications and stats
      const [applicationsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/api/employee/applications/pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://localhost:3000/api/employee/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      console.log('=== API Response Debug ===');
      console.log('Applications Response Status:', applicationsRes.status);
      console.log('Stats Response Status:', statsRes.status);

      if (applicationsRes.ok) {
        const applications = await applicationsRes.json();
        console.log('Applications data received:', applications);
        console.log('Number of applications:', applications.length);
        setPendingApplications(applications);
      } else {
        const error = await applicationsRes.json();
        console.error('Error fetching applications:', error);
        toast.error(error.message || 'Failed to load applications');
      }

      if (statsRes.ok) {
        const dashboardData = await statsRes.json();
        console.log('Dashboard stats received:', dashboardData);
        setStats(dashboardData.stats);
      } else {
        const error = await statsRes.json();
        console.error('Error fetching stats:', error);
        toast.error(error.message || 'Failed to load dashboard stats');
      }
      console.log('================================');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeReview = async (applicationId, reviewData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('EmployeeDashboard - Review submission token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`http://localhost:3000/api/employee/applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  // Filter and sort applications
  const getFilteredApplications = () => {
    let filtered = [...pendingApplications];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(app => 
        app.advertisement?.productName?.toLowerCase().includes(searchTerm) ||
        app.agency?.fullname?.toLowerCase().includes(searchTerm) ||
        app.agency?.agencyName?.toLowerCase().includes(searchTerm) ||
        app.message?.toLowerCase().includes(searchTerm) ||
        app.proposal?.toLowerCase().includes(searchTerm)
      );
    }

    // Budget range filter
    if (filters.budgetRange !== 'all') {
      filtered = filtered.filter(app => {
        const budget = app.budget || 0;
        switch (filters.budgetRange) {
          case 'low': return budget <= 5000;
          case 'medium': return budget > 5000 && budget <= 25000;
          case 'high': return budget > 25000;
          default: return true;
        }
      });
    }

    // Quality filter
    if (filters.quality !== 'all') {
      filtered = filtered.filter(app => {
        // This would need to be implemented based on your quality assessment logic
        return true;
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(app => {
        const appDate = new Date(app.createdAt);
        const diffDays = Math.floor((now - appDate) / (1000 * 60 * 60 * 24));
        switch (filters.dateRange) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      });
    }

    // Sort applications
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        case 'agency':
          aValue = a.agency?.agencyName || '';
          bValue = b.agency?.agencyName || '';
          break;
        case 'product':
          aValue = a.advertisement?.productName || '';
          bValue = b.advertisement?.productName || '';
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      budgetRange: 'all',
      quality: 'all',
      dateRange: 'all'
    });
  };

  const getBudgetRangeLabel = (budget) => {
    if (!budget) return 'Not specified';
    if (budget <= 5000) return 'Low Budget';
    if (budget <= 25000) return 'Medium Budget';
    return 'High Budget';
  };

  const getBudgetRangeColor = (budget) => {
    if (!budget) return 'bg-gray-100 text-gray-800';
    if (budget <= 5000) return 'bg-green-100 text-green-800';
    if (budget <= 25000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!isAuthenticated || user?.role !== 'employee') {
    return null;
  }

  const filteredApplications = getFilteredApplications();

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-blue-600">{filteredApplications.filter(app => {
                  const appDate = new Date(app.createdAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return appDate >= weekAgo;
                }).length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaCalendarAlt className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Department</p>
                <p className="text-lg font-semibold text-gray-900">{user?.department || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaBuilding className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applications, agencies, or products..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FaFilter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt">Date</option>
                <option value="budget">Budget</option>
                <option value="agency">Agency</option>
                <option value="product">Product</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select
                    value={filters.budgetRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Budgets</option>
                    <option value="low">Low (≤ $5,000)</option>
                    <option value="medium">Medium ($5,001 - $25,000)</option>
                    <option value="high">High (> $25,000)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Review Applications</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredApplications.length} of {pendingApplications.length} applications
                </p>
              </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advertisement & Agency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget & Timeline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{app.advertisement?.productName}</div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">{app.advertisement?.description}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaUser className="w-3 h-3 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.agency?.fullname}</div>
                            <div className="text-xs text-gray-500">{app.agency?.agencyName}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {app.message && (
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Message</div>
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-w-xs truncate">
                              {app.message}
                            </div>
                          </div>
                        )}
                        {app.proposal && (
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Proposal</div>
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-w-xs truncate">
                              {app.proposal}
                            </div>
                          </div>
                        )}
                        {app.portfolio && app.portfolio.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Portfolio Items</div>
                            <div className="text-xs text-gray-600">{app.portfolio.length} items</div>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FaDollarSign className="w-3 h-3 text-gray-400" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              ${app.budget?.toLocaleString() || 'Not specified'}
                            </div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getBudgetRangeColor(app.budget)}`}>
                              {getBudgetRangeLabel(app.budget)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaClock className="w-3 h-3 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            {app.timeline || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FaClock className="w-3 h-3 mr-1" />
                            Pending Review
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openReviewModal(app)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <FaEye className="w-3 h-3 mr-1" />
                            Review
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FaClipboardCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {pendingApplications.length === 0 ? 'No pending reviews' : 'No applications match your filters'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {pendingApplications.length === 0 
                    ? 'All applications have been reviewed or there are no new submissions.'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
                <div className="space-x-3">
                  <button
                    onClick={loadDashboardData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FaSync className="w-4 h-4 inline mr-2" />
                    Check for New Applications
                  </button>
                  {pendingApplications.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
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
