// components/HeroSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import AdminLoginButton from '../src/components/AdminLoginButton';

export default function HeroSection() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const handlePostProject = () => {
    if(!user || user.role !== 'client') return navigate('/login');
    navigate('/client-dashboard');
  }

  const handleBrowseProjects = () => { 
    if(!user || user.role !== 'agency') return navigate('/login');
    navigate('/agency-dashboard');
  }
  return (
    <section className="text-center py-20 bg-gray-50 px-4">
      {/* Badge */}
      <div className="inline-flex items-center px-3 py-1 mb-4 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
        🚀 Connecting Brands with Creative Agencies
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
        The Future of <span className="text-purple-600">Advertising Partnerships</span>
      </h1>

      {/* Subtext */}
      <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
        AdMatchHub is the premier platform where companies find the perfect advertising agencies for their video campaigns through transparent bidding and live collaboration.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 items-center">
        <button
          onClick={handlePostProject}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium transition"
        >
          Post Your Project →
        </button>
        <button
          onClick={handleBrowseProjects}
          className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-6 py-3 rounded font-medium transition"
        >
          Browse Projects
        </button>
      </div>
      
      <div className="mt-4">
        <AdminLoginButton />
      </div>
    </section>
  );
}
