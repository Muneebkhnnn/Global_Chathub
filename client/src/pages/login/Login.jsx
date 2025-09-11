import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import { IoMdLogIn } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { loginUserThunk } from '../../store/slice/user/user.thunk';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Login() {

  const { isAuthenticated, buttonLoading } = useSelector(state => state.user)

  const dispatch = useDispatch()
  const navigate = useNavigate()
    
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    console.log(e.target)
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

   // console.log(formData)

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};


    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    } else if (formData.identifier.length < 3) {
      newErrors.identifier = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isAuthenticated){
      navigate('/')
    }
    console.log('is user logged in: ', isAuthenticated)
  }, [isAuthenticated]);


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
   
    const response = await dispatch(loginUserThunk(formData))
    
    console.log(response.payload)
    if(response.payload==='Please verify yourself'){
      navigate('/resend-verification-email')
    }

    console.log('login')

    if (response.payload?.success) {
      navigate('/') 
      
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Card Header */}
        <div className="p-8">
          <div className="flex flex-col justify-center items-center mb-6">
            <div className="mb-4">
              <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center">
                <IoMdLogIn size={32} />
              </div>
            </div>
            <h2 className="text-center text-3xl font-bold mb-2 text-gray-800">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  <FaUser className="inline mr-2" />
                  Username or email
                </span>
              </label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter your username or email"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.identifier ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {errors.identifier && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{errors.identifier}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  <FaLock className="inline mr-2" />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{errors.password}</span>
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={buttonLoading}
                className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${buttonLoading ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                {buttonLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/SignUp" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;