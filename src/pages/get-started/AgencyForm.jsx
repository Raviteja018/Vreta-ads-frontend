import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaBuilding, FaPhone, FaMapMarkerAlt, FaUsers, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AgencyForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    agencyName: '',
    phone: '',
    agencyAddress: '',
    agencyWebsite: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        fullname: formData.name,
        email: formData.email,
        agencyName: formData.agencyName,
        phone: formData.phone,
        agencyAddress: formData.agencyAddress,
        agencyWebsite: formData.agencyWebsite,
        password: formData.password,
      };

      toast.success('Registration successful! Please login to continue.');
      onSubmitSuccess();
      navigate('/agency/login');
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="w-full max-w-xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-md">
       {/* ✅ Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center text-blue-600 hover:underline font-medium"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Agency Registration</h2>
      <p className="text-gray-600 mb-6">Fill in your agency details to create an account</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Full Name"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaBuilding className="text-gray-400" />
          </div>
          <input
            type="text"
            name="agencyName"
            value={formData.agencyName}
            onChange={handleChange}
            placeholder="Agency Name"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaPhone className="text-gray-400" />
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 pt-2">
            <FaMapMarkerAlt className="text-gray-400" />
          </div>
          <textarea
            name="agencyAddress"
            value={formData.agencyAddress}
            onChange={handleChange}
            placeholder="Agency Address"
            rows="2"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaGlobe className="text-gray-400" />
          </div>
          <input
            type="url"
            name="  agencyWebsite"
            value={formData.agencyWebsite}
            onChange={handleChange}
            placeholder="Website URL (optional)"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-70 transition-opacity"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Agency Account'}
        </button>
      </form>
    </div>
  );
};

export default AgencyForm;
