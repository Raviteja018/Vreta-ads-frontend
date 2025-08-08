import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaSignInAlt, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "client", // Default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { username, password, role } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);

      // Call the login API
      const response = await authAPI.login({
        username,
        password,
      });

      // Save token to localStorage
      localStorage.setItem("token", response.token);

      // Redirect based on role
      if (response.user.role === "client") {
        navigate("/client/dashboard");
      } else if (response.user.role === "agency") {
        navigate("/agency/dashboard");
      }

      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col justify-center py-0 sm:py-6 sm:px-4 lg:px-8">
      {/* Responsive Back Button */}
      <button
        onClick={() => navigate(-1)}
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
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="email"
                  autoComplete="email"
                  required
                  value={username}
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
