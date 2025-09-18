// src/pages/auth/Register.jsx - COMPLETE WORKING VERSION WITH ROLE PASSING
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

const Register = () => {
  console.log('📝 Register: Component rendering');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    state: '',
    district: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  const { currentLanguage, t } = useLanguage();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('📝 Register: Input changed', name, '=', value);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Please accept terms and conditions';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    return newErrors;
  };

  // ✅ FIXED: Handle form submission with role passing
  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ CRITICAL: Prevent default form submission
    console.log('📝 Register: Form submitted');
    console.log('📝 Register: Form data =', formData);

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      console.log('📝 Register: Validation errors =', newErrors);
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('📝 Register: Calling register API...');
      
      // Call the register function from useAuth
      const result = await register(formData);
      
      console.log('📝 Register: Registration result =', result);

      if (result.success) {
        console.log('📝 Register: Registration successful, navigating to OTP...');
        console.log('📝 Register: Selected role =', formData.role); // ✅ Debug role
        
        // ✅ FIXED: Navigate to OTP verification with ALL user data including role
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            phone: formData.phone,
            name: formData.name,
            role: formData.role, // ✅ CRITICAL: Pass the selected role
            state: formData.state,
            district: formData.district
          }
        });
      } else {
        console.error('📝 Register: Registration failed =', result.message);
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('📝 Register: Registration error =', error);
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🌾</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentLanguage === 'hi' ? 'खाता बनाएं' : 'Create Account'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
          {currentLanguage === 'hi' ? 'हजारों किसानों के साथ स्मार्ट खेती में शामिल हों' : 'Join thousands of farmers using smart agriculture'}
        </p>
        {/* ✅ Show selected role for debugging */}
        {formData.role && (
          <p className="text-xs text-blue-600 mt-2">
            {formData.role === 'farmer' && '👨‍🌾 Selected: Farmer'}
            {formData.role === 'buyer' && '🛒 Selected: Buyer'}
          </p>
        )}
      </div>

      {/* Complete Registration Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8">
        {/* ✅ FIXED: Added onSubmit handler */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'पूरा नाम' : 'Full Name'} *
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder={currentLanguage === 'hi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                  required
                />
              </div>
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'ईमेल पता' : 'Email Address'} *
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder={currentLanguage === 'hi' ? 'अपना ईमेल पता दर्ज करें' : 'Enter your email address'}
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Phone and Role Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'} *
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="9876543210"
                  required
                />
              </div>
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* ✅ CRITICAL: Role selection field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'मैं हूं' : 'I am a'} *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                required
              >
                <option value="">{currentLanguage === 'hi' ? 'अपनी भूमिका चुनें' : 'Select your role'}</option>
                <option value="farmer">👨‍🌾 {currentLanguage === 'hi' ? 'किसान' : 'Farmer'}</option>
                <option value="buyer">🛒 {currentLanguage === 'hi' ? 'खरीदार' : 'Buyer'}</option>
              </select>
              {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
            </div>
          </div>

          {/* State and District Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'राज्य' : 'State'} *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                required
              >
                <option value="">{currentLanguage === 'hi' ? 'अपना राज्य चुनें' : 'Select your state'}</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
              </select>
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'जिला' : 'District'}
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder={currentLanguage === 'hi' ? 'अपना जिला दर्ज करें' : 'Enter your district'}
                />
              </div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'पासवर्ड' : 'Password'} *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder={currentLanguage === 'hi' ? 'एक मजबूत पासवर्ड बनाएं' : 'Create a strong password'}
                required
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'} *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder={currentLanguage === 'hi' ? 'अपने पासवर्ड की पुष्टि करें' : 'Confirm your password'}
                required
              />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className={`mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded ${errors.agreeToTerms ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {currentLanguage === 'hi' ? 'मैं सहमत हूं' : 'I agree to the'}{' '}
              <a href="/terms" className="text-emerald-600 hover:underline">
                {currentLanguage === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}
              </a>{' '}
              {currentLanguage === 'hi' ? 'और' : 'and'}{' '}
              <a href="/privacy" className="text-emerald-600 hover:underline">
                {currentLanguage === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </a>
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-sm text-red-500 mt-1">{errors.agreeToTerms}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 px-6 rounded-md hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {currentLanguage === 'hi' ? 'रजिस्टर हो रहा है...' : 'Creating Account...'}
              </>
            ) : (
              currentLanguage === 'hi' ? 'खाता बनाएं' : 'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentLanguage === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
              <a href="/login" className="text-emerald-600 hover:underline font-medium">
                {currentLanguage === 'hi' ? 'लॉगिन' : 'Login'}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
