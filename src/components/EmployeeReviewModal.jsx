import React, { useState } from 'react';
import { FaTimes, FaCheck, FaEye, FaStar, FaUser, FaBuilding, FaDollarSign, FaClock, FaFileAlt, FaEnvelope, FaPhone, FaGlobe, FaCalendarAlt, FaChartLine, FaLightbulb } from 'react-icons/fa';

const EmployeeReviewModal = ({ application, isOpen, onClose, onSubmit }) => {
  const [reviewData, setReviewData] = useState({
    budgetApproved: false,
    proposalQuality: 'fair',
    portfolioQuality: 'fair',
    notes: '',
    decision: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewData.decision) {
      alert('Please select a decision');
      return;
    }
    onSubmit(application._id, reviewData);
  };

  const handleChange = (field, value) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !application) return null;

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityIcon = (quality) => {
    switch (quality) {
      case 'excellent': return '⭐⭐⭐⭐⭐';
      case 'good': return '⭐⭐⭐⭐';
      case 'fair': return '⭐⭐⭐';
      case 'poor': return '⭐⭐';
      default: return '⭐';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
              Employee Review - {application.advertisement?.productName}
            </h3>
              <p className="text-sm text-gray-600 mt-1">
                Application submitted by {application.agency?.agencyName} on {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Application Details - Left Column */}
            <div className="xl:col-span-2 space-y-6">
              {/* Agency Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaBuilding className="w-5 h-5 mr-2 text-blue-600" />
                  Agency Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
                    <p className="text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200">
                      {application.agency?.agencyName}
                </p>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <p className="text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200">
                      {application.agency?.fullname}
                    </p>
                  </div>
                  
                  {application.agency?.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200 flex items-center">
                        <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                        {application.agency?.email}
                      </p>
                    </div>
                  )}
                  
                  {application.agency?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200 flex items-center">
                        <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                        {application.agency?.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Advertisement Details */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaFileAlt className="w-5 h-5 mr-2 text-green-600" />
                  Advertisement Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <p className="text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200 font-medium">
                      {application.advertisement?.productName}
                </p>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200">
                      {application.advertisement?.category || 'Not specified'}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200">
                      {application.advertisement?.description || 'No description provided'}
                </p>
              </div>

                  {application.advertisement?.requirements && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200">
                        {application.advertisement?.requirements}
                  </p>
                </div>
              )}
                </div>
              </div>

              {/* Agency Proposal */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaLightbulb className="w-5 h-5 mr-2 text-purple-600" />
                  Agency Proposal
                </h4>
                
                <div className="space-y-4">
                  {application.message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Initial Message</label>
                      <div className="bg-white p-4 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-900 leading-relaxed">{application.message}</p>
                      </div>
                </div>
              )}

              {application.proposal && (
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Proposal</label>
                      <div className="bg-white p-4 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{application.proposal}</p>
                      </div>
                    </div>
                  )}

                  {application.portfolio && application.portfolio.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Items ({application.portfolio.length})</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {application.portfolio.map((item, index) => (
                          <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
                            <h5 className="font-medium text-sm text-gray-900 mb-1">{item.title}</h5>
                            <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                View Project
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                </div>
              )}
                </div>
              </div>
            </div>

            {/* Review Form - Right Column */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaChartLine className="w-5 h-5 mr-2 text-blue-600" />
                  Review Form
                </h4>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Budget Approval */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Budget Approval</label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors duration-200">
                      <input
                        type="radio"
                        name="budgetApproved"
                        value="true"
                        checked={reviewData.budgetApproved === true}
                        onChange={() => handleChange('budgetApproved', true)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Approve Budget</span>
                          <p className="text-xs text-gray-500">Budget is reasonable and within acceptable range</p>
                        </div>
                    </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors duration-200">
                      <input
                        type="radio"
                        name="budgetApproved"
                        value="false"
                        checked={reviewData.budgetApproved === false}
                        onChange={() => handleChange('budgetApproved', false)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Reject Budget</span>
                          <p className="text-xs text-gray-500">Budget is too high or not justified</p>
                        </div>
                    </label>
                  </div>
                </div>

                  {/* Proposal Quality */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Proposal Quality</label>
                    <div className="grid grid-cols-2 gap-2">
                    {['poor', 'fair', 'good', 'excellent'].map((quality) => (
                        <label key={quality} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors duration-200">
                        <input
                          type="radio"
                          name="proposalQuality"
                          value={quality}
                          checked={reviewData.proposalQuality === quality}
                          onChange={() => handleChange('proposalQuality', quality)}
                          className="sr-only"
                        />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${getQualityColor(quality)}`}>
                            <span className="text-xs">{getQualityIcon(quality)}</span>
                        </div>
                          <span className="text-xs text-gray-700 capitalize font-medium">{quality}</span>
                      </label>
                    ))}
                  </div>
                </div>

                  {/* Portfolio Quality */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Portfolio Quality</label>
                    <div className="grid grid-cols-2 gap-2">
                    {['poor', 'fair', 'good', 'excellent'].map((quality) => (
                        <label key={quality} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors duration-200">
                        <input
                          type="radio"
                          name="portfolioQuality"
                          value={quality}
                          checked={reviewData.portfolioQuality === quality}
                          onChange={() => handleChange('portfolioQuality', quality)}
                          className="sr-only"
                        />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${getQualityColor(quality)}`}>
                            <span className="text-xs">{getQualityIcon(quality)}</span>
                        </div>
                          <span className="text-xs text-gray-700 capitalize font-medium">{quality}</span>
                      </label>
                    ))}
                  </div>
                </div>

                  {/* Review Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Add your detailed review notes here..."
                  />
                </div>

                  {/* Decision */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Final Decision</label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors duration-200">
                      <input
                        type="radio"
                        name="decision"
                        value="approve"
                        checked={reviewData.decision === 'approve'}
                        onChange={() => handleChange('decision', 'approve')}
                          className="mr-3 text-green-600 focus:ring-green-500"
                      />
                        <div>
                          <span className="text-sm font-medium text-gray-900 text-green-700">Approve & Send to Client</span>
                          <p className="text-xs text-gray-500">Application meets quality standards and can proceed to client review</p>
                        </div>
                    </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors duration-200">
                      <input
                        type="radio"
                        name="decision"
                        value="reject"
                        checked={reviewData.decision === 'reject'}
                        onChange={() => handleChange('decision', 'reject')}
                          className="mr-3 text-red-600 focus:ring-red-500"
                      />
                        <div>
                          <span className="text-sm font-medium text-gray-900 text-red-700">Reject Application</span>
                          <p className="text-xs text-gray-500">Application does not meet quality standards or requirements</p>
                        </div>
                    </label>
                  </div>
                </div>

                  {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reviewData.decision}
                      className={`flex-1 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${
                      reviewData.decision
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Submit Review
                  </button>
                </div>
              </form>
              </div>

              {/* Quick Summary */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaEye className="w-5 h-5 mr-2 text-gray-600" />
                  Quick Summary
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Proposed Budget:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${application.budget?.toLocaleString() || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Timeline:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {application.timeline || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Application Date:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Portfolio Items:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {application.portfolio?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReviewModal;
