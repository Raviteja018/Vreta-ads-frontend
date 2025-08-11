import React, { useState } from "react";
import axios from "axios"; 
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
 
const ClientForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    phone: "",
    companyAddress: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (!validatePhoneNumber(formData.phone)) {
      toast.error("Please enter a valid 10-digit Indian phone number starting with 6-9");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ Match backend schema field names
      const payload = {
        fullname: formData.name,
        email: formData.email,
        company: formData.companyName,
        phone: formData.phone,
        companyAddress: formData.companyAddress,
        password: formData.password,
      };

      const response = await axios.post(
        "http://localhost:3000/api/client/register",
        payload
      );

      toast.success(response.data.message || "Registration successful! Please login to continue.");
      onSubmitSuccess?.();
      navigate("/client/login");
    } catch (error) {
      console.error("Registration error:", error);
      console.log("Error response:", error.response?.data);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please check your details and try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-md">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 hover:underline font-medium"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Client Registration
      </h2>
      <p className="text-gray-600 mb-6">
        Fill in your details to create a client account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        {/* Email */}
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

        {/* Company Name */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaBuilding className="text-gray-400" />
          </div>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Company Name"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaPhone className="text-gray-400" />
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number (e.g., 9876543210)"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            pattern="[6-9]\d{9}"
            title="Please enter a valid 10-digit Indian phone number starting with 6-9"
            required
          />
        </div>

        {/* Company Address */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 pt-2">
            <FaMapMarkerAlt className="text-gray-400" />
          </div>
          <textarea
            name="companyAddress" // ✅ fixed name
            value={formData.companyAddress}
            onChange={handleChange}
            placeholder="Company Address"
            rows="2"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        {/* Password */}
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
          {isSubmitting ? "Creating Account..." : "Create Client Account"}
        </button>
      </form>
    </div>
  );
};

export default ClientForm;
