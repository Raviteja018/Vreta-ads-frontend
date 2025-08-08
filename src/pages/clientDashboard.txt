import React, { useState, useEffect } from 'react';
import { advertisementAPI, applicationAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaPlus,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaTimes,
  FaEdit,
  FaTrash,
  FaImage,
  FaTag,
  FaCalendarAlt,
  FaUserFriends,
  FaAd,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Available categories for dropdown
const categories = [
  'fashion',
  'electronics',
  'health',
  'food',
  'travel',
  'beauty',
  'home',
  'sports',
  'education',
  'finance',
  'automotive',
  'other',
];

const ClientDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [advertisements, setAdvertisements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('advertisements');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    minBudget: '',
    maxBudget: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredAdvertisements, setFilteredAdvertisements] = useState([]);

  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    targetAudience: '',
    budget: '',
    campaignDuration: '1 month',
    category: 'general',
    keyFeatures: '',
    productImage: null,
    imagePreview: '',
  });

  // Fetch advertisements from API
  const fetchAdvertisements = async () => {
    try {
      setIsLoading(true);
      const response = await advertisementAPI.getAll();
      setAdvertisements(response.data.data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error('Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch applications for client
  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getByClient();
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'productImage' && files && files[0]) {
      const file = files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          productImage: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();

      // Validate required fields
      if (!formData.productName || !formData.productDescription || !formData.budget) {
        throw new Error('Please fill in all required fields');
      }

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (key === 'keyFeatures' && value) {
            formDataToSend.append(
              key,
              JSON.stringify(value.split(',').map((feature) => feature.trim()).filter(Boolean))
            );
          } else if (key !== 'imagePreview') {
            formDataToSend.append(key, value);
          }
        }
      });

      let response;
      if (editingId) {
        // Update existing advertisement
        response = await advertisementAPI.update(editingId, formDataToSend);
        setAdvertisements((prev) =>
          prev.map((ad) => (ad._id === editingId ? response.data.data : ad))
        );
        toast.success('Advertisement updated successfully!');
      } else {
        // Create new advertisement
        response = await advertisementAPI.create(formDataToSend);
        setAdvertisements((prev) => [response.data.data, ...prev]);
        toast.success('Advertisement created successfully!');
      }

      resetForm();
      setFormVisible(false);
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      productName: '',
      productDescription: '',
      targetAudience: '',
      budget: '',
      campaignDuration: '1 month',
      category: 'general',
      keyFeatures: '',
      productImage: null,
      imagePreview: '',
    });
    setEditingId(null);
  };

  // Toggle form visibility
  const toggleForm = () => {
    setFormVisible(!formVisible);
    if (formVisible) {
      resetForm();
    }
  };

  // Handle edit action
  const handleEdit = (ad) => {
    setFormData({
      productName: ad.productName || '',
      productDescription: ad.productDescription || '',
      targetAudience: ad.targetAudience || '',
      budget: ad.budget || '',
      campaignDuration: ad.campaignDuration || '1 month',
      category: ad.category || 'general',
      keyFeatures: Array.isArray(ad.keyFeatures) ? ad.keyFeatures.join(', ') : ad.keyFeatures || '',
      productImage: null,
      imagePreview: ad.imageUrl || '',
    });
    setEditingId(ad._id);
    setFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await advertisementAPI.delete(id);
        setAdvertisements((prev) => prev.filter((ad) => ad._id !== id));
        toast.success('Advertisement deleted successfully');
      } catch (error) {
        console.error('Error deleting advertisement:', error);
        toast.error('Failed to delete advertisement');
      }
    }
  };

  // Handle application status update
  const handleApplicationStatusUpdate = async (applicationId, status) => {
    try {
      await applicationAPI.updateStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
      );
      toast.success(`Application ${status} successfully!`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if any filters are active
  const isFilterActive = () => {
    return Object.values(filters).some((value) => value !== '');
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      minBudget: '',
      maxBudget: '',
    });
  };

  // Fetch data on component mount and when tab changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdvertisements();
      fetchApplications();
    }
  }, [isAuthenticated]);

  // Filter advertisements when data, search term, or filters change
  useEffect(() => {
    let filtered = advertisements;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ad) =>
          ad.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ad.productDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((ad) => ad.category === filters.category);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((ad) => ad.status === filters.status);
    }

    // Budget filter
    if (filters.minBudget) {
      filtered = filtered.filter((ad) => ad.budget >= parseFloat(filters.minBudget));
    }
    if (filters.maxBudget) {
      filtered = filtered.filter((ad) => ad.budget <= parseFloat(filters.maxBudget));
    }

    setFilteredAdvertisements(filtered);
  }, [searchTerm, filters, advertisements]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Client Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name || 'User'}! Manage your advertisements and applications.</p>
          </div>
          {activeTab === 'advertisements' && (
            <button
              onClick={toggleForm}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FaPlus className="-ml-1 mr-2 h-4 w-4" />
              {formVisible ? 'Close Form' : 'New Advertisement'}
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('advertisements')}
                className={`${
                  activeTab === 'advertisements'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <FaAd className="mr-2 h-4 w-4" />
                My Advertisements
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {advertisements.length}
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
                Applications Received
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {applications.length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filter Section - Only for Advertisements */}
        {activeTab === 'advertisements' && (
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

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status-filter"
                      name="status"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
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
        )}

        {/* Create/Edit Advertisement Form */}
        {formVisible && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Advertisement' : 'Create New Advertisement'}
              </h2>
              <button
                type="button"
                onClick={toggleForm}
                className="mt-2 md:mt-0 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FaTimes className="mr-1 h-3 w-3" /> Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="productDescription"
                    name="productDescription"
                    rows={4}
                    value={formData.productDescription}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Describe your product and advertising goals"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g., Age 18-35, Tech Enthusiasts"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                      Budget ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        min="0"
                        step="0.01"
                        value={formData.budget}
                        onChange={handleChange}
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="campaignDuration" className="block text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <select
                      id="campaignDuration"
                      name="campaignDuration"
                      value={formData.campaignDuration}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                    >
                      <option value="1 week">1 Week</option>
                      <option value="2 weeks">2 Weeks</option>
                      <option value="1 month">1 Month</option>
                      <option value="3 months">3 Months</option>
                      <option value="6 months">6 Months</option>
                      <option value="1 year">1 Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="keyFeatures" className="block text-sm font-medium text-gray-700">
                    Key Features
                  </label>
                  <input
                    type="text"
                    id="keyFeatures"
                    name="keyFeatures"
                    value={formData.keyFeatures}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate features with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        id="productImage"
                        name="productImage"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1 text-sm text-gray-500">or drag and drop</p>
                  </div>
                  {formData.imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 mb-1">Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              productImage: null,
                              imagePreview: '',
                            }));
                            const fileInput = document.getElementById('productImage');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 focus:outline-none"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={toggleForm}
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
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : editingId ? (
                  'Update Advertisement'
                ) : (
                  'Create Advertisement'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Advertisements List */}
        {activeTab === 'advertisements' && (
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
                        <FaImage className="h-12 w-12 text-purple-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ad.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : ad.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : ad.status === 'completed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ad.status?.charAt(0).toUpperCase() + ad.status?.slice(1) || 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{ad.productName || 'Untitled'}</h3>
                      <span className="text-sm font-medium text-purple-700">
                        ${ad.budget?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {ad.productDescription || 'No description provided'}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <FaTag className="mr-1" />
                        {ad.category?.charAt(0).toUpperCase() + ad.category?.slice(1) || 'Uncategorized'}
                      </span>
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {ad.campaignDuration || 'No duration set'}
                      </span>
                    </div>

                    {ad.keyFeatures && ad.keyFeatures.length > 0 && (
                      <div className="mt-3">
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

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUserFriends className="mr-1" />
                        {ad.targetAudience || 'No target set'}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 focus:outline-none"
                          title="Edit"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 focus:outline-none"
                          title="Delete"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
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
                    : 'Get started by creating a new advertisement.'}
                </p>
                {!searchTerm && !isFilterActive() && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={toggleForm}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                      New Advertisement
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Applications List */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {applications.length > 0 ? (
              applications.map((application) => (
                <div
                  key={application._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Application for:{' '}
                          {application.advertisement?.productName || 'Unknown Advertisement'}
                        </h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(application.status)}`}>
                          {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Agency:</p>
                          <p className="text-sm text-gray-900">{application.agency?.name || 'Unknown Agency'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Applied on:</p>
                          <p className="text-sm text-gray-900">
                            {application.createdAt
                              ? new Date(application.createdAt).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Proposed Budget:</p>
                          <p className="text-sm text-gray-900">
                            ${application.budget?.toLocaleString() || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Timeline:</p>
                          <p className="text-sm text-gray-900">{application.timeline || 'Not specified'}</p>
                        </div>
                      </div>

                      {application.message && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Message:</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{application.message}</p>
                        </div>
                      )}

                      {application.proposal && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Proposal:</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{application.proposal}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {application.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleApplicationStatusUpdate(application._id, 'rejected')}
                        className="inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTimes className="mr-2 h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApplicationStatusUpdate(application._id, 'approved')}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FaCheck className="mr-2 h-4 w-4" />
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaUserFriends className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications received</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Applications from agencies will appear here when they apply to your advertisements.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default ClientDashboard;