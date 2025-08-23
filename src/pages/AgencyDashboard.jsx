import React, { useState, useEffect, useCallback } from 'react';
import { advertisementAPI, applicationAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaHandshake,
  FaAd,
  FaUserFriends,
  FaSpinner,
  FaCheck,
  FaTimes as FaReject,
  FaClock,
  FaEdit,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const categories = [
  'fashion', 'electronics', 'health', 'food', 'travel', 'beauty', 
  'home', 'sports', 'education', 'finance', 'automotive', 'other'
];

const AgencyDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [advertisements, setAdvertisements] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
    showApplied: 'all', // 'all', 'applied', 'not-applied'
    showStatus: 'all', // 'all', 'active', 'paused'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredAdvertisements, setFilteredAdvertisements] = useState([]);
  
  const [applicationForm, setApplicationForm] = useState({
    message: '',
    proposal: '',
    budget: '',
    timeline: '',
  });
  const [selectedAdvertisement, setSelectedAdvertisement] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  const fetchAdvertisements = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await advertisementAPI.getPublic();
      const ads = response.data.data || [];
      console.log('Fetched advertisements:', ads.map(ad => ({
        id: ad._id,
        name: ad.productName,
        status: ad.status,
        client: ad.client?.fullname
      })));
      setAdvertisements(ads);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error('Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyApplications = useCallback(async () => {
    try {
      // Use the refresh endpoint to get the latest advertisement statuses
      const response = await applicationAPI.refreshAll();
      const apps = response.data.data || [];
      console.log('Refreshed applications:', apps.map(app => ({
        id: app._id,
        adName: app.advertisement?.productName,
        adStatus: app.advertisement?.status,
        appStatus: app.status,
        clientName: app.advertisement?.client?.fullname
      })));
      setMyApplications(apps);
      setLastRefreshTime(new Date());
      
      // Show success toast with application count
      const activeCount = apps.filter(app => app.advertisement?.status === 'active').length;
      const pausedCount = apps.filter(app => app.advertisement?.status === 'paused').length;
      
      toast.success(
        `✅ Applications refreshed successfully! ${apps.length} total applications (${activeCount} active, ${pausedCount} paused)`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('❌ Failed to load applications');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const applicationData = {
        advertisement: selectedAdvertisement._id,
        message: applicationForm.message,
        proposal: applicationForm.proposal,
        budget: parseFloat(applicationForm.budget),
        timeline: applicationForm.timeline,
      };

      const response = await applicationAPI.create(applicationData);
      setMyApplications(prev => [response.data.data, ...prev]);
      toast.success('Application submitted successfully!');
      
      setApplicationForm({
        message: '', proposal: '', budget: '', timeline: ''
      });
      setSelectedAdvertisement(null);
      setShowApplicationForm(false);
      fetchMyApplications();
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openApplicationForm = (advertisement) => {
    setSelectedAdvertisement(advertisement);
    setShowApplicationForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: <FaCheck className="mr-1" /> };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: <FaReject className="mr-1" /> };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <FaClock className="mr-1" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <FaClock className="mr-1" /> };
    }
  };

  // Check if agency has already applied to an advertisement
  const getApplicationStatus = (advertisementId) => {
    const application = myApplications.find(app => app.advertisement?._id === advertisementId);
    return application ? application.status : null;
  };

  // Get the application object for an advertisement
  const getApplication = (advertisementId) => {
    return myApplications.find(app => app.advertisement?._id === advertisementId);
  };

  const isFilterActive = () => {
    return Object.values(filters).some((value) => value !== '');
  };

  const clearFilters = () => {
    setFilters({ category: '', minBudget: '', maxBudget: '', showApplied: 'all', showStatus: 'all' });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdvertisements();
      fetchMyApplications();
    }
  }, [isAuthenticated, fetchAdvertisements, fetchMyApplications]);

  // Refresh applications every 10 seconds to get updated advertisement statuses
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchMyApplications();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchMyApplications]);

  // Refresh applications when applications tab is activated
  useEffect(() => {
    if (activeTab === 'applications' && isAuthenticated) {
      fetchMyApplications();
    }
  }, [activeTab, isAuthenticated, fetchMyApplications]);

  useEffect(() => {
    let filtered = advertisements;

    if (searchTerm) {
      filtered = filtered.filter(
        (ad) =>
          ad.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ad.productDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter((ad) => ad.category === filters.category);
    }

    if (filters.minBudget) {
      filtered = filtered.filter((ad) => ad.budget >= parseFloat(filters.minBudget));
    }
    if (filters.maxBudget) {
      filtered = filtered.filter((ad) => ad.budget <= parseFloat(filters.maxBudget));
    }

    // Filter by application status
    if (filters.showApplied === 'applied') {
      filtered = filtered.filter((ad) => getApplicationStatus(ad._id));
    } else if (filters.showApplied === 'not-applied') {
      filtered = filtered.filter((ad) => !getApplicationStatus(ad._id));
    }

    // Filter by advertisement status
    if (filters.showStatus === 'active') {
      filtered = filtered.filter((ad) => ad.status === 'active');
    } else if (filters.showStatus === 'paused') {
      filtered = filtered.filter((ad) => ad.status === 'paused');
    }

    setFilteredAdvertisements(filtered);
  }, [searchTerm, filters, advertisements, myApplications]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Agency Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'User'}! Browse advertisements and manage your applications.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('browse')}
                className={`${
                  activeTab === 'browse'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <FaAd className="mr-2 h-4 w-4" />
                Browse Advertisements
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {filteredAdvertisements.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`${
                  activeTab === 'applications'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <FaUserFriends className="mr-2 h-4 w-4" />
                My Applications
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {myApplications.length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'browse' && (
          <>
            {/* Application Statistics */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Application Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {myApplications.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {myApplications.filter(app => app.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {myApplications.filter(app => app.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {myApplications.filter(app => app.status === 'rejected').length}
                  </div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>
            </div>



            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search advertisements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center px-3 py-2 border ${
                      isFilterActive() ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                    } rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                  >
                    <FaFilter className="mr-2 h-4 w-4 text-gray-400" />
                    Filters
                    {isFilterActive() && (
                      <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-purple-600"></span>
                    )}
                  </button>
                  {isFilterActive() && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <FaTimes className="mr-1.5 h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="category-filter"
                        name="category"
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="application-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Application Status
                      </label>
                      <select
                        id="application-status-filter"
                        name="showApplied"
                        value={filters.showApplied}
                        onChange={(e) => setFilters({ ...filters, showApplied: e.target.value })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                      >
                        <option value="all">All Advertisements</option>
                        <option value="not-applied">Not Applied Yet</option>
                        <option value="applied">Already Applied</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="advertisement-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Advertisement Status
                      </label>
                      <select
                        id="advertisement-status-filter"
                        name="showStatus"
                        value={filters.showStatus}
                        onChange={(e) => setFilters({ ...filters, showStatus: e.target.value })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="paused">Paused Only</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="min-budget" className="block text-sm font-medium text-gray-700 mb-1">
                        Min Budget
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="minBudget"
                          id="min-budget"
                          value={filters.minBudget}
                          onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                          placeholder="0"
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="max-budget" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Budget
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="maxBudget"
                          id="max-budget"
                          value={filters.maxBudget}
                          onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                          placeholder="10000"
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <FaSpinner className="animate-spin h-8 w-8 text-purple-600" />
                </div>
              ) : filteredAdvertisements.length > 0 ? (
                filteredAdvertisements.map((ad) => (
                  <div
                    key={ad._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {ad.imageUrl ? (
                        <img
                          src={ad.imageUrl}
                          alt={ad.productName || 'Advertisement'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ad.productName || 'Ad')}&background=7E3AF2&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-100">
                          <FaAd className="h-12 w-12 text-purple-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ad.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : ad.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : ad.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ad.status?.charAt(0).toUpperCase() + ad.status?.slice(1) || 'Unknown'}
                        </span>
                        
                        {/* Show application status badge if agency has applied */}
                        {(() => {
                          const applicationStatus = getApplicationStatus(ad._id);
                          if (applicationStatus) {
                            const statusDisplay = getStatusDisplay(applicationStatus);
                            return (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center justify-center ${statusDisplay.color}`}>
                                {statusDisplay.icon}
                                {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{ad.productName || 'Untitled'}</h3>
                        <span className="text-sm font-medium text-purple-700">
                          ${ad.budget?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {ad.productDescription || 'No description provided'}
                      </p>

                      <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <FaAd className="mr-1" />
                          {ad.category?.charAt(0).toUpperCase() + ad.category?.slice(1) || 'Uncategorized'}
                        </span>
                        <span className="flex items-center">
                          <FaHandshake className="mr-1" />
                          {ad.campaignDuration || 'No duration set'}
                        </span>
                      </div>

                      {ad.keyFeatures && ad.keyFeatures.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Key Features
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(ad.keyFeatures) ? ad.keyFeatures : []).slice(0, 3).map((feature, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {feature}
                              </span>
                            ))}
                            {ad.keyFeatures.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                +{ad.keyFeatures.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Client:</span> {ad.client?.fullname || 'Unknown'}
                        </div>
                        
                        {/* Show application status or Apply button */}
                        {(() => {
                          const applicationStatus = getApplicationStatus(ad._id);
                          const application = getApplication(ad._id);
                          
                          if (applicationStatus) {
                            // Agency has already applied - show status
                            const statusDisplay = getStatusDisplay(applicationStatus);
                            return (
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${statusDisplay.color}`}>
                                  {statusDisplay.icon}
                                  {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                                </span>
                                {applicationStatus === 'pending' && (
                                  <button
                                    onClick={() => openApplicationForm(ad)}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    title="Update Application"
                                  >
                                    <FaEdit className="mr-1 h-3 w-3" />
                                    Update
                                  </button>
                                )}
                              </div>
                            );
                          } else {
                            // Agency hasn't applied yet - show Apply button
                            return (
                              <button
                                onClick={() => openApplicationForm(ad)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              >
                                <FaHandshake className="mr-1 h-3 w-3" />
                                Apply
                              </button>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FaAd className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No advertisements found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || isFilterActive()
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No advertisements are currently available.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Applications Header with Classical Design */}
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full border-2 border-blue-200">
                    <FaUserFriends className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
                    <p className="text-sm text-gray-600 mt-1">Track your project applications and their current status</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Last Updated Time */}
                  <div className="text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                    <span className="font-medium text-gray-700">Last updated:</span>
                    <span className="ml-2 font-mono text-blue-600">{lastRefreshTime.toLocaleTimeString()}</span>
                  </div>
                  
                  {/* Classical Refresh Button */}
                  <button
                    onClick={fetchMyApplications}
                    disabled={isLoading}
                    className="group inline-flex items-center px-4 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh Applications"
                  >
                    <FaSpinner className={`mr-2 h-4 w-4 text-gray-600 ${isLoading ? 'animate-spin' : 'group-hover:text-gray-800'}`} />
                    <span className="text-sm">
                      {isLoading ? 'Refreshing...' : 'Refresh'}
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Applications Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{myApplications.length}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {myApplications.filter(app => app.advertisement?.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {myApplications.filter(app => app.advertisement?.status === 'paused').length}
                  </div>
                  <div className="text-sm text-gray-600">Paused Projects</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {myApplications.filter(app => app.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Reviews</div>
                </div>
              </div>
            </div>
            
            {myApplications.length > 0 ? (
              myApplications.map((application) => {
                const statusDisplay = getStatusDisplay(application.status);
                return (
                  <div
                    key={application._id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Application Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-3 mb-3 md:mb-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full border border-blue-200">
                            <FaAd className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.advertisement?.productName || 'Unknown Advertisement'}
                            </h3>
                            <p className="text-sm text-gray-600">Client: {application.advertisement?.client?.fullname || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {/* Advertisement Status Badge */}
                          <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${
                            application.advertisement?.status === 'active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : application.advertisement?.status === 'paused'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : application.advertisement?.status === 'draft'
                              ? 'bg-gray-50 text-gray-700 border-gray-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {application.advertisement?.status?.charAt(0).toUpperCase() + application.advertisement?.status?.slice(1) || 'Active'}
                          </span>
                          
                          {/* Application Status Badge */}
                          <span className={`px-3 py-1.5 text-xs font-medium rounded-full border flex items-center ${statusDisplay.color}`}>
                            {statusDisplay.icon}
                            {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Application Content */}
                    <div className="p-6">
                      {/* Status Information */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-full border border-green-200">
                              <span className="text-green-600 text-sm">📊</span>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Advertisement Status</span>
                              <div className="text-sm font-semibold text-gray-900">
                                {application.advertisement?.status === 'active' ? (
                                  <span className="text-green-700">✓ Active & Accepting Applications</span>
                                ) : application.advertisement?.status === 'paused' ? (
                                  <span className="text-yellow-700">⏸ Paused for Review</span>
                                ) : application.advertisement?.status === 'draft' ? (
                                  <span className="text-gray-700">📝 Draft Mode</span>
                                ) : (
                                  <span className="text-blue-700">ℹ Status Unknown</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-full border border-blue-200">
                              <span className="text-blue-600 text-sm">📝</span>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Your Application</span>
                              <div className="text-sm font-semibold text-gray-900">
                                {application.status === 'pending' ? (
                                  <span className="text-yellow-700">⏳ Pending Review</span>
                                ) : application.status === 'approved' ? (
                                  <span className="text-green-700">✅ Approved</span>
                                ) : application.status === 'rejected' ? (
                                  <span className="text-red-700">❌ Rejected</span>
                                ) : (
                                  <span className="text-gray-700">📋 Status Unknown</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Update Note */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-center space-x-2 text-xs text-blue-700">
                            <span className="animate-pulse">🔄</span>
                            <span className="font-medium">Auto-refresh:</span>
                            <span>Advertisement status updates every 10 seconds</span>
                            <span className="text-blue-600 font-semibold">•</span>
                            <span>Use refresh button above for immediate update</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Application Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Project Information
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500">Client</p>
                                <p className="text-sm font-semibold text-gray-900">{application.advertisement?.client?.fullname || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Applied on</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {application.createdAt
                                    ? new Date(application.createdAt).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Your Proposal
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500">Budget</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  ${application.budget?.toLocaleString() || 'Not specified'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Timeline</p>
                                <p className="text-sm font-semibold text-gray-900">{application.timeline || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Application Content */}
                      {application.message && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            Your Message
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-900">{application.message}</p>
                          </div>
                        </div>
                      )}

                      {application.proposal && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                            Your Proposal
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-900">{application.proposal}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <FaUserFriends className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications submitted</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start browsing advertisements and submit your first application!
                </p>
              </div>
            )}
          </div>
        )}

        {showApplicationForm && selectedAdvertisement && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Apply for: {selectedAdvertisement.productName}
                  </h3>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message to Client
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={applicationForm.message}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Introduce yourself and explain why you're the best fit..."
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="proposal" className="block text-sm font-medium text-gray-700">
                      Your Proposal
                    </label>
                    <textarea
                      id="proposal"
                      name="proposal"
                      rows={4}
                      value={applicationForm.proposal}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Describe your approach, strategy, and deliverables..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                        Your Bid ($)
                      </label>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        min="0"
                        step="0.01"
                        value={applicationForm.budget}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
                        Timeline
                      </label>
                      <input
                        type="text"
                        id="timeline"
                        name="timeline"
                        value={applicationForm.timeline}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        placeholder="e.g., 2 weeks"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default AgencyDashboard;
