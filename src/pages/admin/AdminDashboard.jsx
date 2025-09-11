import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { FaUsers, FaAd, FaHandshake, FaChartBar, FaShieldAlt, FaCog, FaChevronLeft, FaChevronRight, FaSync, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaClipboardCheck, FaKey, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import adminAPI from '../../services/adminAPI';
import EmployeeReviewModal from '../../components/EmployeeReviewModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    department: '',
    position: '',
    permissions: {
      canReviewApplications: true,
      canManageUsers: false,
      canViewAnalytics: true
    }
  });

  // Employee review modal states
  const [reviewModal, setReviewModal] = useState({ isOpen: false, application: null });
  const [pendingReviews, setPendingReviews] = useState([]);
  const [applicationStats, setApplicationStats] = useState({});

  // Edit modal states
  const [editModal, setEditModal] = useState({ isOpen: false, type: null, data: null });
  const [editForm, setEditForm] = useState({});

  // Employee modal states
  const [employeeModal, setEmployeeModal] = useState({ isOpen: false });
  const [employeeForm, setEmployeeForm] = useState({});

  // Handle edit modal open
  const openEditModal = (type, data) => {
    setEditModal({ isOpen: true, type, data });
    setEditForm(data);
  };

  // Handle edit modal close
  const closeEditModal = () => {
    setEditModal({ isOpen: false, type: null, data: null });
    setEditForm({});
  };

  // Handle employee modal
  const openEmployeeModal = () => {
    setEmployeeModal({ isOpen: true });
    setEmployeeForm({
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
      department: '',
      position: '',
      permissions: {
        canReviewApplications: true,
        canManageUsers: false,
        canViewAnalytics: true
      }
    });
  };

  const closeEmployeeModal = () => {
    setEmployeeModal({ isOpen: false });
    setEmployeeForm({
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
      department: '',
      position: '',
      permissions: {
        canReviewApplications: true,
        canManageUsers: false,
        canViewAnalytics: true
      }
    });
  };

  const handleEmployeeFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEmployeeForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEmployeeForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (employeeForm.password !== employeeForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (employeeForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/admin/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: employeeForm.username,
          password: employeeForm.password,
          fullName: employeeForm.fullName,
          email: employeeForm.email,
          department: employeeForm.department,
          position: employeeForm.position,
          permissions: employeeForm.permissions
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        closeEmployeeModal();
        // Refresh employees list if we have one
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Failed to create employee');
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      switch (editModal.type) {
        case 'advertisement':
          result = await adminAPI.editAdvertisement(editModal.data._id, editForm);
          toast.success('Advertisement updated successfully');
          await loadAdvertisements();
          break;
        case 'application':
          result = await adminAPI.editApplication(editModal.data._id, editForm);
          toast.success('Application updated successfully');
          await loadApplications();
          break;
        case 'agency':
          result = await adminAPI.editAgency(editModal.data._id, editForm);
          toast.success('Agency updated successfully');
          await loadAgencies();
          break;
        case 'client':
          result = await adminAPI.editClient(editModal.data._id, editForm);
          toast.success('Client updated successfully');
          await loadClients();
          break;
        case 'employee':
          const response = await fetch(`http://localhost:3000/api/admin/employees/${editModal.data._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(editForm)
          });
          
          if (response.ok) {
            toast.success('Employee updated successfully');
            await loadEmployees();
          } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update employee');
          }
          break;
        default:
          throw new Error('Unknown edit type');
      }
      closeEditModal();
    } catch (error) {
      console.error('Error updating:', error);
      toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle employee review modal
  const openReviewModal = (application) => {
    setReviewModal({ isOpen: true, application });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, application: null });
  };

  const handleEmployeeReview = async (applicationId, reviewData) => {
    try {
      await adminAPI.submitEmployeeReview(applicationId, reviewData);
      toast.success(`Application ${reviewData.decision === 'approve' ? 'approved and sent to client' : 'rejected'}`);
      closeReviewModal();
      await loadPendingReviews();
      await loadApplications();
      await loadApplicationStats();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(`Failed to submit review: ${error.message || 'Unknown error'}`);
    }
  };

  // Load pending review applications
  const loadPendingReviews = async () => {
    try {
      const [employeeResp, clientReviewResp] = await Promise.all([
        adminAPI.getPendingReviewApplications(), // status: employee_review
        adminAPI.getApplicationsByStatus('client_review', 1, 50) // status: client_review
      ]);

      const employeeItems = employeeResp.data || [];
      const clientItems = (clientReviewResp.applications || []).map(a => ({ ...a, status: 'client_review' }));

      // Merge and sort by createdAt desc if available
      const merged = [...employeeItems, ...clientItems].sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
      });

      setPendingReviews(merged);
    } catch (error) {
      console.error('Error loading pending reviews:', error);
      toast.error('Failed to load pending reviews');
    }
  };

  // Load application statistics
  const loadApplicationStats = async () => {
    try {
      const response = await adminAPI.getApplicationStats();
      setApplicationStats(response.data || {});
    } catch (error) {
      console.error('Error loading application stats:', error);
      toast.error('Failed to load application statistics');
    }
  };

  // Handle form input changes
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [analyticsData, activityData, statsData] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getRecentActivity(),
        adminAPI.getApplicationStats()
      ]);
      setAnalytics(analyticsData);
      setRecentActivity(activityData);
      setApplicationStats(statsData.data || {});
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load clients
  const loadClients = async () => {
    try {
      console.log('Loading clients...');
      const response = await adminAPI.getClients(currentPage, 10);
      console.log('Clients response:', response);
      setClients(response.clients || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error(`Failed to load clients: ${error.message || 'Unknown error'}`);
    }
  };

  // Load agencies
  const loadAgencies = async () => {
    try {
      console.log('Loading agencies...');
      const response = await adminAPI.getAgencies(currentPage, 10);
      console.log('Agencies response:', response);
      setAgencies(response.agencies || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading agencies:', error);
      toast.error(`Failed to load agencies: ${error.message || 'Unknown error'}`);
    }
  };

  // Load advertisements
  const loadAdvertisements = async () => {
    try {
      console.log('Loading advertisements...');
      const response = await adminAPI.getAdvertisements(currentPage, 10);
      console.log('Advertisements response:', response);
      setAdvertisements(response.advertisements || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading advertisements:', error);
      toast.error(`Failed to load advertisements: ${error.message || 'Unknown error'}`);
    }
  };

  // Load applications
  const loadApplications = async () => {
    try {
      const result = await adminAPI.getApplications(currentPage);
      setApplications(result.applications || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error(`Failed to load applications: ${error.message || 'Unknown error'}`);
    }
  };

  // Load employees
  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setEmployees(result.employees || []);
      } else {
        toast.error('Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    }
  };

  // Handle client/agency toggle
  const handleToggleStatus = async (type, id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      let result;
      
      if (type === 'client') {
        result = await adminAPI.approveClient(id, newStatus);
        toast.success(`Client ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        await loadClients();
      } else if (type === 'agency') {
        result = await adminAPI.approveAgency(id, newStatus);
        toast.success(`Agency ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        await loadAgencies();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(`Failed to toggle status: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Load data based on active tab
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'analytics') {
        loadDashboardData();
      } else if (activeTab === 'clients') {
        loadClients();
      } else if (activeTab === 'agencies') {
        loadAgencies();
      } else if (activeTab === 'advertisements') {
        loadAdvertisements();
      } else if (activeTab === 'applications') {
        loadApplications();
      } else if (activeTab === 'pending-reviews') {
        loadPendingReviews();
      } else if (activeTab === 'employees') {
        loadEmployees();
      }
    }
  }, [activeTab, currentPage, isAuthenticated]);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: FaChartBar, color: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { id: 'clients', label: 'User Management', icon: FaUsers, color: 'bg-gradient-to-r from-green-500 to-teal-600' },
    { id: 'advertisements', label: 'Advertisements', icon: FaAd, color: 'bg-gradient-to-r from-orange-500 to-red-600' },
    { id: 'applications', label: 'Applications', icon: FaHandshake, color: 'bg-gradient-to-r from-indigo-500 to-blue-600' },
    { id: 'pending-reviews', label: 'Pending Reviews', icon: FaClipboardCheck, color: 'bg-gradient-to-r from-yellow-500 to-orange-600' },
    { id: 'employees', label: 'Employees', icon: FaUsers, color: 'bg-gradient-to-r from-pink-500 to-rose-600' },
    { id: 'agencies', label: 'Agencies', icon: FaShieldAlt, color: 'bg-gradient-to-r from-purple-500 to-indigo-600' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ tab, isActive }) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white text-gray-900 shadow-lg border border-gray-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <tab.icon className="w-5 h-5" />
      <span className="hidden sm:inline">{tab.label}</span>
    </button>
  );

  const TableCard = ({ children, title }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Welcome, {user?.username}
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
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl">
            {tabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {/* Debug Section - Remove in production */}
          {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"> */}
            {/* <h3 className="text-sm font-medium text-yellow-800 mb-2">🔧 Debug Info (Development)</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>Active Tab: {activeTab}</div>
              <div>Current Page: {currentPage}</div>
              <div>Clients Count: {clients.length}</div>
              <div>Agencies Count: {agencies.length}</div>
              <div>Advertisements Count: {advertisements.length}</div>
              <div>Applications Count: {applications.length}</div>
              <div>Analytics: {Object.keys(analytics).length > 0 ? 'Loaded' : 'Not loaded'}</div>
              <div>Recent Activity: {recentActivity.length} items</div>
            </div> */}
          {/* </div> */}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={analytics.totalUsers || 0}
                  icon={FaUsers}
                  color="bg-gradient-to-r from-blue-500 to-blue-600"
                  subtitle="Clients & Agencies"
                />
                <StatCard
                  title="Total Ads"
                  value={analytics.totalAds || 0}
                  icon={FaAd}
                  color="bg-gradient-to-r from-green-500 to-green-600"
                  subtitle="Active & Paused"
                />
                <StatCard
                  title="Applications"
                  value={analytics.totalApplications || 0}
                  icon={FaHandshake}
                  color="bg-gradient-to-r from-purple-500 to-purple-600"
                  subtitle="Total Submissions"
                />
                <StatCard
                  title="Pending Approvals"
                  value={(analytics.pendingApprovals || 0) + (applicationStats.pendingReview || 0) + (applicationStats.clientReview || 0)}
                  icon={FaShieldAlt}
                  color="bg-gradient-to-r from-orange-500 to-orange-600"
                  subtitle="Awaiting Review"
                />
              </div>

              {/* Recent Activity */}
              <TableCard title="Recent Activity">
                <div className="p-6">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUsers className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No recent activity</div>
                  )}
                </div>
              </TableCard>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
                <button
                  onClick={loadClients}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaSync className="w-4 h-4 inline mr-2" />
                  Refresh Clients
                </button>
              </div>
              <TableCard title="Client Management">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.fullname}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            client.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Client"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal('client', client)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Client"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium ${client.isApproved ? 'text-green-600' : 'text-red-600'}`}>
                              {client.isApproved ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => handleToggleStatus('client', client._id, client.isApproved ? 'active' : 'inactive')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                client.isApproved ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                              title={client.isApproved ? 'Deactivate Client' : 'Activate Client'}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                  client.isApproved ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {clients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No clients found</p>
                    <button
                      onClick={loadClients}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Try Loading Again
                    </button>
                  </div>
                )}
              </TableCard>
            </div>
          )}

          {/* Agencies Tab */}
          {activeTab === 'agencies' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Agency Management</h2>
                <button
                  onClick={loadAgencies}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaSync className="w-4 h-4 inline mr-2" />
                  Refresh Agencies
                </button>
              </div>
              <TableCard title="Agency Management">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agencies.map((agency) => (
                      <tr key={agency._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agency.fullname}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agency.agencyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agency.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            agency.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {agency.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Agency"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal('agency', agency)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Agency"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium ${agency.isApproved ? 'text-green-600' : 'text-red-600'}`}>
                              {agency.isApproved ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => handleToggleStatus('agency', agency._id, agency.isApproved ? 'active' : 'inactive')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                agency.isApproved ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                              title={agency.isApproved ? 'Deactivate Agency' : 'Activate Agency'}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                  agency.isApproved ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {agencies.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No agencies found</p>
                    <button
                      onClick={loadAgencies}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Try Loading Again
                    </button>
                  </div>
                )}
              </TableCard>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Employee Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Employees login with username and password</p>
                </div>
                <button
                  onClick={openEmployeeModal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <FaUsers className="w-4 h-4 inline mr-2" />
                  Add Employee
                </button>
              </div>
              <TableCard title="Employee Management">
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Login Information:</strong> Employees use their <strong>username</strong> and password to access the employee dashboard.
                  </p>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Username</span>
                          <div className="relative group">
                            <FaInfoCircle className="w-3 h-3 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              Login credential
                            </div>
                          </div>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.userId?.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            employee.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => openEditModal('employee', employee)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Employee"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {/* TODO: Add reset password functionality */}}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Reset Password"
                          >
                            <FaKey className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {employees.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No employees found</p>
                    <button
                      onClick={loadEmployees}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Try Loading Again
                    </button>
                  </div>
                )}
              </TableCard>
            </div>
          )}

          {/* Advertisements Tab */}
          {activeTab === 'advertisements' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Advertisement Management</h2>
                <button
                  onClick={loadAdvertisements}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaSync className="w-4 h-4 inline mr-2" />
                  Refresh Advertisements
                </button>
              </div>
              <TableCard title="Advertisement Management">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {advertisements.map((ad) => (
                      <tr key={ad._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ad.productName}</div>
                            <div className="text-sm text-gray-500">{ad.productDescription}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ad.client?.fullname}</div>
                            <div className="text-sm text-gray-500">{ad.client?.company}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ad.budget}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            ad.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {ad.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Advertisement"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal('advertisement', ad)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Advertisement"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {advertisements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No advertisements found</p>
                    <button
                      onClick={loadAdvertisements}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Try Loading Again
                    </button>
                  </div>
                )}
              </TableCard>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Application Management</h2>
                <button
                  onClick={loadApplications}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaSync className="w-4 h-4 inline mr-2" />
                  Refresh Applications
                </button>
              </div>
              <TableCard title="Application Management">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advertisement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.advertisement?.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.agency?.fullname}</div>
                            <div className="text-sm text-gray-500">{app.agency?.agencyName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{app.message}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            app.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Application"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal('application', app)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Application"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {applications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No applications found</p>
                    <button
                      onClick={loadApplications}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Try Loading Again
                    </button>
                  </div>
                )}
              </TableCard>
            </div>
          )}

          {/* Pending Reviews Tab */}
          {activeTab === 'pending-reviews' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Pending Review Applications</h2>
                <button
                  onClick={loadPendingReviews}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaSync className="w-4 h-4 inline mr-2" />
                  Refresh Pending Reviews
                </button>
              </div>
              <TableCard title="Pending Review Applications">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advertisement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingReviews.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.advertisement?.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.agency?.fullname}</div>
                            <div className="text-sm text-gray-500">{app.agency?.agencyName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${app.budget?.toLocaleString() || 'Not specified'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {app.status === 'client_review' ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Admin Final Approval</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Employee Review</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {app.status === 'client_review' ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await adminAPI.adminFinalApproval(app._id, 'approve');
                                    toast.success('Application approved by admin');
                                    await loadPendingReviews();
                                    await loadApplicationStats();
                                  } catch (e) {
                                    console.error('Admin approval failed:', e);
                                    toast.error(e.message || 'Admin approval failed');
                                  }
                                }}
                                className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await adminAPI.adminFinalApproval(app._id, 'reject');
                                    toast.success('Application rejected by admin');
                                    await loadPendingReviews();
                                    await loadApplicationStats();
                                  } catch (e) {
                                    console.error('Admin rejection failed:', e);
                                    toast.error(e.message || 'Admin rejection failed');
                                  }
                                }}
                                className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => openReviewModal(app)}
                              className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingReviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No pending review applications found</p>
                    <button
                      onClick={loadPendingReviews}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Try Loading Again
                    </button>
                  </div>
                )}
              </TableCard>
            </div>
          )}

        </div>

        {/* Edit Modal */}
        {editModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit {editModal.type === 'advertisement' ? 'Advertisement' : 
                           editModal.type === 'application' ? 'Application' : 
                           editModal.type === 'agency' ? 'Agency' : 
                           editModal.type === 'client' ? 'Client' : 'Item'}
                  </h3>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  {editModal.type === 'advertisement' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={editForm.productName || ''}
                          onChange={(e) => handleEditFormChange('productName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={editForm.productDescription || ''}
                          onChange={(e) => handleEditFormChange('productDescription', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                        <input
                          type="number"
                          value={editForm.budget || ''}
                          onChange={(e) => handleEditFormChange('budget', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editForm.status || ''}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </>
                  )}

                  {editModal.type === 'application' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                          value={editForm.message || ''}
                          onChange={(e) => handleEditFormChange('message', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editForm.status || ''}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </>
                  )}

                  {editModal.type === 'agency' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.fullname || ''}
                          onChange={(e) => handleEditFormChange('fullname', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
                        <input
                          type="text"
                          value={editForm.agencyName || ''}
                          onChange={(e) => handleEditFormChange('agencyName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </>
                  )}

                  {editModal.type === 'client' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.fullname || ''}
                          onChange={(e) => handleEditFormChange('fullname', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={editForm.company || ''}
                          onChange={(e) => handleEditFormChange('company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </>
                  )}

                  {editModal.type === 'employee' && (
                    <>
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Username cannot be changed. Employees login with their username and password.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username (Read-only)</label>
                        <input
                          type="text"
                          value={editForm.userId?.username || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.fullName || ''}
                          onChange={(e) => handleEditFormChange('fullName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={editForm.department || ''}
                          onChange={(e) => handleEditFormChange('department', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={editForm.position || ''}
                          onChange={(e) => handleEditFormChange('position', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editForm.isActive !== undefined ? editForm.isActive : true}
                          onChange={(e) => handleEditFormChange('isActive', e.target.value === 'true')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Employee Creation Modal */}
        {employeeModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Create New Employee</h3>
                  <button
                    onClick={closeEmployeeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Employees will login using their <strong>username</strong> and password, not their email address.
                  </p>
                </div>

                <form onSubmit={handleEmployeeSubmit} className="space-y-4" autoComplete="off">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="employee-username"
                      value={employeeForm.username}
                      onChange={(e) => handleEmployeeFormChange('username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoComplete="new-username"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="employee-password"
                      value={employeeForm.password}
                      onChange={(e) => handleEmployeeFormChange('password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      name="employee-confirm-password"
                      value={employeeForm.confirmPassword}
                      onChange={(e) => handleEmployeeFormChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={employeeForm.fullName}
                      onChange={(e) => handleEmployeeFormChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={employeeForm.email}
                      onChange={(e) => handleEmployeeFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={employeeForm.department}
                      onChange={(e) => handleEmployeeFormChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={employeeForm.position}
                      onChange={(e) => handleEmployeeFormChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={employeeForm.permissions.canReviewApplications}
                          onChange={(e) => handleEmployeeFormChange('permissions.canReviewApplications', e.target.checked)}
                          className="mr-2"
                        />
                        Can Review Applications
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={employeeForm.permissions.canManageUsers}
                          onChange={(e) => handleEmployeeFormChange('permissions.canManageUsers', e.target.checked)}
                          className="mr-2"
                        />
                        Can Manage Users
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={employeeForm.permissions.canViewAnalytics}
                          onChange={(e) => handleEmployeeFormChange('permissions.canViewAnalytics', e.target.checked)}
                          className="mr-2"
                        />
                        Can View Analytics
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeEmployeeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Create Employee
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

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

export default AdminDashboard;