import React, { useState } from 'react';
import { FaTimes, FaCheck, FaEye, FaStar } from 'react-icons/fa';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Employee Review - {application.advertisement?.productName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Application Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {application.agency?.fullname} ({application.agency?.agencyName})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Budget</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  ${application.budget?.toLocaleString() || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {application.timeline || 'Not specified'}
                </p>
              </div>

              {application.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {application.message}
                  </p>
                </div>
              )}

              {application.proposal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposal</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {application.proposal}
                  </p>
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Review Form</h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Approval</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="budgetApproved"
                        value="true"
                        checked={reviewData.budgetApproved === true}
                        onChange={() => handleChange('budgetApproved', true)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Approve Budget</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="budgetApproved"
                        value="false"
                        checked={reviewData.budgetApproved === false}
                        onChange={() => handleChange('budgetApproved', false)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Reject Budget</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proposal Quality</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['poor', 'fair', 'good', 'excellent'].map((quality) => (
                      <label key={quality} className="flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="proposalQuality"
                          value={quality}
                          checked={reviewData.proposalQuality === quality}
                          onChange={() => handleChange('proposalQuality', quality)}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          reviewData.proposalQuality === quality 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <FaStar className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-gray-700 capitalize">{quality}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Quality</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['poor', 'fair', 'good', 'excellent'].map((quality) => (
                      <label key={quality} className="flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="portfolioQuality"
                          value={quality}
                          checked={reviewData.portfolioQuality === quality}
                          onChange={() => handleChange('portfolioQuality', quality)}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          reviewData.portfolioQuality === quality 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <FaStar className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-gray-700 capitalize">{quality}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add your review notes here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="decision"
                        value="approve"
                        checked={reviewData.decision === 'approve'}
                        onChange={() => handleChange('decision', 'approve')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Approve & Send to Client</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="decision"
                        value="reject"
                        checked={reviewData.decision === 'reject'}
                        onChange={() => handleChange('decision', 'reject')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Reject</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reviewData.decision}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      reviewData.decision
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReviewModal;
