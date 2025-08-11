import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBuilding,
  FaUserTie,
} from "react-icons/fa";

const GetStarted = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === "client") {
      navigate("/client/register");
    } else if (role === "agency") {
      navigate("/agency/register");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* ✅ Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-24 left-12 bg-white text-blue-600 shadow-md border border-blue-100 hover:bg-blue-50 transition-all px-4 py-2 rounded-full flex items-center space-x-2"
      >
        <FaArrowLeft />
        <span className="text-sm font-medium">Back</span>
      </button>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Started with AdMatchHub
          </h1>
          <p className="text-lg text-gray-600">Choose your role to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div
            onClick={() => handleRoleSelect("client")}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:border-purple-500 transition-all cursor-pointer flex flex-col items-center text-center"
          >
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <FaUserTie className="text-purple-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm a Client</h3>
            <p className="text-gray-600 mb-6">
              Looking to hire an advertising agency for your business needs
            </p>
            <div className="mt-auto flex items-center text-purple-600 font-medium">
              Continue as Client <FaArrowRight className="ml-2" />
            </div>
          </div>

          <div
            onClick={() => handleRoleSelect("agency")}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 transition-all cursor-pointer flex flex-col items-center text-center"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <FaBuilding className="text-blue-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm an Agency</h3>
            <p className="text-gray-600 mb-6">
              Looking to find clients who need advertising services
            </p>
            <div className="mt-auto flex items-center text-blue-600 font-medium">
              Continue as Agency <FaArrowRight className="ml-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GetStarted;
