import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBriefcase, FaUsersCog, FaUserShield, FaBars, FaTimes, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../src/contexts/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {user} = useAuth();
  const navigate = useNavigate();
  const activeClass = 'text-purple-600 font-semibold';

  // const handleProtectedNav = (rolePath) => {
  //   if(!user) return navigate('/login');
  //   if(user.role !== rolePath) return alert('Unauthorized Access');
  //   navigate(`/${rolePath}`);
  // }

  return (
    <nav className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-purple-600 text-white px-2 py-1 rounded font-bold">AM</div>
          <span className="text-xl font-semibold text-gray-800">AdMatchHub</span>
        </div>

        {/* Center: Links */}
        {/* <div className="hidden md:flex items-center space-x-8 text-gray-500">
          <NavLink
          onClick = {() => handleProtectedNav('client')}
            className={({ isActive }) =>
              `flex items-center gap-1 hover:text-black ${isActive ? activeClass : ''}`
            }
          >
            <FaBriefcase />
            Client Portal
          </NavLink>
          <NavLink
          onClick = {() => handleProtectedNav('agency')}
            className={({ isActive }) =>
              `flex items-center gap-1 hover:text-black ${isActive ? activeClass : ''}`
            }
          >
            <FaUsersCog />
            Agency Portal
          </NavLink>
          <NavLink
          onClick = {() => handleProtectedNav('admin')}
            // to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-1 hover:text-black ${isActive ? activeClass : ''}`
            }
          >
            <FaUserShield />
            Admin Panel
          </NavLink>
        </div> */}

        {/* Right: CTA Button and quick logins */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLink
            to="/employee/login"
            className="text-gray-600 hover:text-green-600 font-medium px-3 py-2 transition-colors duration-200"
          >
            Employee Login
          </NavLink>
          <NavLink
            to="/admin/login"
            className="text-gray-600 hover:text-purple-600 font-medium px-3 py-2 transition-colors duration-200"
          >
            Admin Login
          </NavLink>
          <NavLink
            to="/get-started"
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold px-5 py-2 rounded-lg hover:opacity-90"
          >
            Get Started
          </NavLink>
        </div>

        {/* Mobile Toggle Button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl text-gray-800">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 space-y-4 text-gray-600">
          <NavLink
            to="/client"
            className={({ isActive }) =>
              `flex items-center gap-2 hover:text-black ${isActive ? activeClass : ''}`
            }
          >
            <FaBriefcase />
            Client Portal
          </NavLink>
          <NavLink
            to="/agency"
            className={({ isActive }) =>
              `flex items-center gap-2 hover:text-black ${isActive ? activeClass : ''}`
            }
          >
            <FaUsersCog />
            Agency Portal
          </NavLink>
          <NavLink
            to="/admin/login"
            className="flex items-center gap-2 hover:text-purple-600 text-gray-600"
          >
            <FaUserShield />
            Admin Login
          </NavLink>
          <NavLink
            to="/employee/login"
            className="flex items-center gap-2 hover:text-green-600 text-gray-600"
          >
            <FaBuilding />
            Employee Login
          </NavLink>
          <NavLink
            to="/get-started"
            className="block bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold px-4 py-2 rounded hover:opacity-90"
          >
            Get Started
          </NavLink>
        </div>
      )}
    </nav>
  );
}
