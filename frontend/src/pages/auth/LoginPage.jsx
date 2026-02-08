import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response.data);
      const data = response.data;

      if (!data.user || !data.token) {
        const missingFields = [];
        if (!data.user) missingFields.push('user');
        if (!data.token) missingFields.push('token');
        setError(`Invalid response: Missing ${missingFields.join(', ')}`);
        console.error('Missing fields in login response:', missingFields);
        setLoading(false);
        return;
      }

      // Update AuthContext with user data and token
      console.log('Calling login() with:', data.user, data.token);
      login(data.user, data.token);
      
      // Verify data was stored
      console.log('After login - localStorage.token:', localStorage.getItem('token') ? 'exists' : 'missing');
      console.log('After login - localStorage.user:', localStorage.getItem('user') ? 'exists' : 'missing');
      console.log('Login successful, user:', data.user);

      // Redirect based on role after a brief delay
      const dashboardRoute = {
        patient: "/patient",
        doctor: "/doctor",
        admin: "/admin",
      };

      const route = dashboardRoute[data.user.role] || "/patient";
      console.log('Navigating to:', route);
      
      // Use a longer delay to ensure state updates
      setTimeout(() => {
        console.log('Executing navigation...');
        navigate(route, { replace: true });
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred. Please check your connection and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HealthVillage</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email/Phone Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email or Phone Number
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or phone number"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account? {" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            Demo Credentials
          </p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Patient:</strong> patient@demo.com / password123
            </p>
            <p>
              <strong>Doctor:</strong> doctor@demo.com / password123
            </p>
            <p>
              <strong>Admin:</strong> admin@demo.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
