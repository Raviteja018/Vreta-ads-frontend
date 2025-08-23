import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { FaUsers, FaAd, FaHandshake, FaChartBar, FaShieldAlt, FaCog, FaChevronLeft, FaChevronRight, FaSync, FaEye, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import adminAPI from '../../services/adminAPI';

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

  // Edit modal states
  const [editModal, setEditModal] = useState({ isOpen: false, type: null, data: null });
  const [editForm, setEditForm] = useState({});

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
        default:
          throw new Error('Unknown edit type');
      }
      closeEditModal();
    } catch (error) {
      console.error('Error updating:', error);
      toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
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
      const [analyticsData, activityData] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getRecentActivity()
      ]);
      setAnalytics(analyticsData);
      setRecentActivity(activityData);
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
      console.log('Loading applications...');
      const response = await adminAPI.getApplications(currentPage, 10);
      console.log('Applications response:', response);
      setApplications(response.applications || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error(`Failed to load applications: ${error.message || 'Unknown error'}`);
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
    { id: 'agencies', label: 'Agencies', icon: FaShieldAlt, color: 'bg-gradient-to-r from-pink-500 to-rose-600' }
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">🔧 Debug Info (Development)</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>Active Tab: {activeTab}</div>
              <div>Current Page: {currentPage}</div>
              <div>Clients Count: {clients.length}</div>
              <div>Agencies Count: {agencies.length}</div>
              <div>Advertisements Count: {advertisements.length}</div>
              <div>Applications Count: {applications.length}</div>
              <div>Analytics: {Object.keys(analytics).length > 0 ? 'Loaded' : 'Not loaded'}</div>
              <div>Recent Activity: {recentActivity.length} items</div>
            </div>
          </div>

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
                  value={analytics.pendingApprovals || 0}
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

        <ToastContainer position="top-right" />
      </div>
    </div>
  );
};

export default AdminDashboard;