import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaSignInAlt, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "client", // Default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password, role } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password || !role) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);

      // Call the login API
      const response = await axios.post('http://localhost:3000/api/login', {email, password, role})
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response data keys:", Object.keys(response.data));
      
      // Guard: require a token to proceed. If missing, treat as invalid credentials
      const token = response.data?.token;
      if (!token) {
        throw new Error(response.data?.message || 'Invalid credentials');
      }
      const userData = {
        id: response.data.id,
        name: response.data.name,
        role: response.data.role,
        token: token
      };
      
      console.log("User data being created:", userData);
      console.log("Role from response.data.role:", response.data.role);
      console.log("Role type:", typeof response.data.role);
      
      // Save token and user data to localStorage and update AuthContext
      localStorage.setItem("token", token);
      login(userData);

      // Redirect based on role from API response
      const userRole = response.data.role;
      console.log("User role from API:", userRole);
      console.log("Attempting to navigate to:", userRole === "client" ? "/client/dashboard" : "/agency/dashboard");
      
      if (userRole === "client") {
        console.log("Navigating to client dashboard...");
        console.log("Current URL before navigation:", window.location.href);
        navigate("/client/dashboard");
        console.log("Navigation called");
        // Force a small delay to see if navigation happens
        setTimeout(() => {
          console.log("URL after navigation:", window.location.href);
        }, 100);
      } else if (userRole === "agency") {
        console.log("Navigating to agency dashboard...");
        console.log("Current URL before navigation:", window.location.href);
        navigate("/agency/dashboard");
        console.log("Navigation called");
        // Force a small delay to see if navigation happens
        setTimeout(() => {
          console.log("URL after navigation:", window.location.href);
        }, 100);
      }

      toast.success("Login successful!");
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message;
      if (!error.response) {
        toast.error("Cannot reach server. Please try again later.");
      } else if (status === 403 && msg?.includes('registered as')) {
        toast.error(msg);
      } else if (status === 400 || status === 401 || status === 403) {
        toast.error(msg || "Invalid credentials. Please try again.");
      } else {
        toast.error(msg || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col justify-center py-0 sm:py-6 sm:px-4 lg:px-8">
      {/* Responsive Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed sm:absolute top-4 left-4 sm:top-24 sm:left-12 bg-white text-purple-600 border border-purple-100 shadow hover:bg-purple-50 transition-all px-4 py-2 rounded-full flex items-center space-x-2 z-10"
      >
        <FaArrowLeft />
        <span className="text-sm font-medium hidden xs:inline">Back</span>
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">

          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow sm:rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Login as
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="client">Client</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <FaSignInAlt className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </button>
            </div>
            
            {/* Employee Login Link */}
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Are you an employee or administrator?</div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  to="/employee/login"
                  className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                >
                  Employee Login →
                </Link>
                <span className="text-gray-400 hidden sm:inline">|</span>
                <Link
                  to="/admin/login"
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Admin Login →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
