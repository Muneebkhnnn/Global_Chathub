import React, { useState, useEffect } from 'react'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SignUpUserThunk } from '../../store/slice/user/user.thunk';

function SignUp() {
  const { isAuthenticated, buttonLoading } = useSelector(state => state.user)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'male'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }


    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isAuthenticated) navigate('/')

  }, [isAuthenticated]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const response = await dispatch(SignUpUserThunk(formData))
    
    if (response.payload?.success) {
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: ''
      });
    }

    if (response.payload?.errors?.code==="Email_not_verified"){

      const unVerifiedEmail=response.payload?.errors?.email

      navigate('/resend-verification-email')
    }

  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 text-white rounded-full w-20 h-20 flex items-center justify-center">
                <FaUserPlus size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  <FaUser className="inline mr-2" />
                  Full Name
                </span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {errors.fullName && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{errors.fullName}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  <FaUser className="inline mr-2" />
                  Username
                </span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {errors.username && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{errors.username}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  <FaUser className="inline mr-2" />
                  email
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {errors.email && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{errors.email}</span>
                </div>
              )}
            </div>

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
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
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

            <div className="space-y-1">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  <FaLock className="inline mr-2" />
                  Confirm Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            <div className='flex gap-4'>
              <span>Gender :</span>
              <div className=" input input-bordered flex items-center gap-5">
                <label htmlFor="male" className="flex gap-3 items-center">
                  <input
                    id="male"
                    type="radio"
                    name="gender"
                    value="male"
                    className="radio radio-primary"
                    onChange={handleChange}
                  />
                  male
                </label>

                <label htmlFor="female" className="flex gap-3 items-center">
                  <input
                    id="female"
                    type="radio"
                    name="gender"
                    value="female"
                    className="radio radio-primary"
                    onChange={handleChange}
                  />
                  female
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/Terms&Conditions" className="text-green-600 hover:text-green-800 hover:underline">
                    Terms and Conditions
                  </Link>
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={buttonLoading}
                className={`w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${buttonLoading ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                {buttonLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-800 font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp