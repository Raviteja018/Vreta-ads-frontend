import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaCheckCircle, FaEye, FaChartLine, FaSearch, FaFilter, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { advertisementAPI, applicationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StatBox = ({ icon, label, value }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
            <dd className="text-lg font-semibold text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
    status: 'active'
  });
  
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [applicationData, setApplicationData] = useState({
    message: '',
    proposal: '',
    budget: '',
    estimatedTimeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        const { data } = await advertisementAPI.getAll();
        setAdvertisements(data);
      } catch (error) {
        toast.error('Error fetching advertisements.');
        console.error('Error fetching advertisements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  const filteredAds = advertisements.filter(ad => {
    const matchesSearch = ad.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.productDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || ad.category === filters.category;
    const matchesMinBudget = !filters.minBudget || ad.budget >= Number(filters.minBudget);
    const matchesMaxBudget = !filters.maxBudget || ad.budget <= Number(filters.maxBudget);
    const matchesStatus = !filters.status || ad.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesMinBudget && matchesMaxBudget && matchesStatus;
  });

  const handleInterest = (ad) => {
    setSelectedAd(ad);
    setApplicationData({
      message: `I'm interested in promoting your product "${ad.productName}"`, 
      proposal: `Here's how we can help promote ${ad.productName}:\n- Target audience: ${ad.targetAudience || 'General'}\n- Campaign duration: ${ad.campaignDuration || '2-4 weeks'}\n- Key strategies: Social media, influencer partnerships, content creation`,
      budget: ad.budget * 0.2, 
      estimatedTimeline: ad.campaignDuration || '4 weeks'
    });
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAd) return;
    
    try {
      setIsSubmitting(true);
      const payload = {
        advertisement: selectedAd._id,
        ...applicationData,
      };
      await applicationAPI.create(payload);
      
      setAdvertisements(ads => 
        ads.map(ad => 
          ad._id === selectedAd._id
            ? { 
                ...ad, 
                interestedCount: (ad.interestedCount || 0) + 1,
                hasApplied: true
              } 
            : ad
        )
      );
      
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agency Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome, {user?.name || 'Agency'}! Discover and apply for advertising opportunities.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search advertisements..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox 
            icon={<FaEye className="h-6 w-6 text-blue-600" />} 
            label="Active Applications" 
            value={advertisements.filter(a => a.status === 'active').length} 
          />
          <StatBox 
            icon={<FaCheckCircle className="h-6 w-6 text-green-600" />} 
            label="Won Campaigns" 
            value={advertisements.filter(a => a.status === 'completed').length} 
          />
          <StatBox 
            icon={<FaDollarSign className="h-6 w-6 text-yellow-600" />} 
            label="Estimated Revenue" 
            value={`$${advertisements
              .filter(a => a.status === 'completed')
              .reduce((sum, ad) => sum + (ad.budget * 0.2), 0)
              .toLocaleString()}`} 
          />
          <StatBox 
            icon={<FaChartLine className="h-6 w-6 text-purple-600" />} 
            label="Success Rate" 
            value={advertisements.length > 0 
              ? `${Math.round((advertisements.filter(a => a.status === 'completed').length / advertisements.length) * 100)}%` 
              : '0%'} 
          />
        </div>

        <div className="mt-6 bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="category"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value="">All Categories</option>
                    <option value="fashion">Fashion</option>
                    <option value="electronics">Electronics</option>
                    <option value="health">Health & Beauty</option>
                    <option value="food">Food & Beverage</option>
                    <option value="travel">Travel</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="minBudget" className="block text-sm font-medium text-gray-700">Min Budget</label>
                  <input
                    type="number"
                    id="minBudget"
                    placeholder="Min"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filters.minBudget}
                    onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700">Max Budget</label>
                  <input
                    type="number"
                    id="maxBudget"
                    placeholder="Max"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filters.maxBudget}
                    onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Advertisements</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredAds.length} of {advertisements.length} advertisements
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No advertisements found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAds.map((ad) => (
                <div key={ad._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    {ad.imageUrl ? (
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ad.category || 'General'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${ad.budget?.toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className="mt-2 text-lg font-medium text-gray-900 line-clamp-2">
                      {ad.productName}
                    </h3>
                    
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                      {ad.productDescription}
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-500">
                          {ad.interestedCount || 0} interested
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleInterest(ad)}
                        disabled={ad.hasApplied}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          ad.hasApplied 
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                            : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        }`}
                      >
                        {ad.hasApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showApplicationForm && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Apply for Advertisement</h2>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={isSubmitting}
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">{selectedAd.productName}</h3>
                  <p className="text-sm text-gray-600 mb-4">{selectedAd.productDescription}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Budget:</span>
                      <p className="font-medium">${selectedAd.budget?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Category:</span>
                      <p className="font-medium capitalize">{selectedAd.category || 'General'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message to Client
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={applicationData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Proposal
                  </label>
                  <textarea
                    id="proposal"
                    name="proposal"
                    rows={5}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={applicationData.proposal}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Budget ($)
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={applicationData.budget}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="estimatedTimeline" className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Timeline
                  </label>
                  <input
                    type="text"
                    id="estimatedTimeline"
                    name="estimatedTimeline"
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={applicationData.estimatedTimeline}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="-ml-1 mr-2 h-4 w-4" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
