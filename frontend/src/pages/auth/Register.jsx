// src/pages/auth/Register.jsx - FIXED VERSION WITH DATA PERSISTENCE & DARK MODE
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/context/ThemeContext';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const { isDark } = useTheme(); // ✅ Added theme hook

  // ✅ Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('registration-form-data');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        // Don't restore passwords for security
        setFormData(prev => ({
          ...parsedData,
          password: '',
          confirmPassword: ''
        }));
      } catch (error) {
        console.log('Failed to parse saved form data');
      }
    }
  }, []);

  // ✅ Save form data to localStorage when it changes (except passwords)
  useEffect(() => {
    const dataToSave = {
      ...formData,
      password: '', // Don't save passwords
      confirmPassword: ''
    };
    localStorage.setItem('registration-form-data', JSON.stringify(dataToSave));
  }, [formData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('📝 Register: Input changed', name, '=', value);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific error when user starts typing/changing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear general error when any field changes
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = currentLanguage === 'hi' ? 'नाम आवश्यक है' : 'Name is required';
    if (!formData.email.trim()) newErrors.email = currentLanguage === 'hi' ? 'ईमेल आवश्यक है' : 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = currentLanguage === 'hi' ? 'फ़ोन नंबर आवश्यक है' : 'Phone number is required';
    if (!formData.password.trim()) newErrors.password = currentLanguage === 'hi' ? 'पासवर्ड आवश्यक है' : 'Password is required';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = currentLanguage === 'hi' ? 'पासवर्ड की पुष्टि आवश्यक है' : 'Confirm password is required';
    if (!formData.role) newErrors.role = currentLanguage === 'hi' ? 'भूमिका आवश्यक है' : 'Role is required';
    if (!formData.state) newErrors.state = currentLanguage === 'hi' ? 'राज्य आवश्यक है' : 'State is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = currentLanguage === 'hi' ? 'कृपया नियम स्वीकार करें' : 'Please accept terms and conditions';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = currentLanguage === 'hi' ? 'कृपया वैध ईमेल दर्ज करें' : 'Please enter a valid email';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = currentLanguage === 'hi' ? 'कृपया 10 अंकों का फ़ोन नंबर दर्ज करें' : 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = currentLanguage === 'hi' ? 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए' : 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = currentLanguage === 'hi' ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Register: Form submitted');
    console.log('📝 Register: Form data =', formData);

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      console.log('📝 Register: Validation errors =', newErrors);
      setErrors(newErrors);
      // ✅ Form data is preserved - no reset!
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('📝 Register: Calling register API...');
      
      const result = await register(formData);
      
      console.log('📝 Register: Registration result =', result);

      if (result.success) {
        console.log('📝 Register: Registration successful, navigating to OTP...');
        
        // ✅ Clear saved form data on successful registration
        localStorage.removeItem('registration-form-data');
        
        // Navigate to OTP verification
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            phone: formData.phone,
            name: formData.name,
            role: formData.role,
            state: formData.state,
            district: formData.district
          }
        });
      } else {
        console.error('📝 Register: Registration failed =', result.message);
        setErrors({ general: result.message || (currentLanguage === 'hi' ? 'पंजीकरण असफल' : 'Registration failed') });
      }
    } catch (error) {
      console.error('📝 Register: Registration error =', error);
      setErrors({ 
        general: error.message || (currentLanguage === 'hi' ? 'पंजीकरण असफल। कृपया पुनः प्रयास करें।' : 'Registration failed. Please try again.') 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 py-8">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentLanguage === 'hi' ? 'खाता बनाएं' : 'Create Account'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
            {currentLanguage === 'hi' ? 'हजारों किसानों के साथ स्मार्ट खेती में शामिल हों' : 'Join thousands of farmers using smart agriculture'}
          </p>
          {/* Role indicator */}
          {formData.role && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
              {formData.role === 'farmer' && '👨‍🌾 ' + (currentLanguage === 'hi' ? 'चयनित: किसान' : 'Selected: Farmer')}
              {formData.role === 'buyer' && '🛒 ' + (currentLanguage === 'hi' ? 'चयनित: खरीदार' : 'Selected: Buyer')}
            </p>
          )}
        </div>

        {/* ✅ IMPROVED FORM CONTAINER WITH PROPER DARK MODE */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.general}
                </p>
              </div>
            )}

            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === 'hi' ? 'पूरा नाम' : 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder={currentLanguage === 'hi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                    required
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === 'hi' ? 'ईमेल पता' : 'Email Address'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder={currentLanguage === 'hi' ? 'अपना ईमेल पता दर्ज करें' : 'Enter your email address'}
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Phone and Role Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors ${errors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === 'hi' ? 'मैं हूं' : 'I am a'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white transition-colors ${errors.role ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  required
                >
                  <option value="">{currentLanguage === 'hi' ? 'अपनी भूमिका चुनें' : 'Select your role'}</option>
                  <option value="farmer">👨‍🌾 {currentLanguage === 'hi' ? 'किसान' : 'Farmer'}</option>
                  <option value="buyer">🛒 {currentLanguage === 'hi' ? 'खरीदार' : 'Buyer'}</option>
                </select>
                {errors.role && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.role}</p>}
              </div>
            </div>

            {/* State and District Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === 'hi' ? 'राज्य' : 'State'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white transition-colors ${errors.state ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
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
                {errors.state && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === 'hi' ? 'जिला' : 'District'}
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                    placeholder={currentLanguage === 'hi' ? 'अपना जिला दर्ज करें' : 'Enter your district'}
                  />
                </div>
              </div>
            </div>

            {/* ✅ IMPROVED PASSWORD FIELDS WITH TOGGLE VISIBILITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === 'hi' ? 'पासवर्ड' : 'Password'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder={currentLanguage === 'hi' ? 'एक मजबूत पासवर्ड बनाएं' : 'Create a strong password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder={currentLanguage === 'hi' ? 'अपने पासवर्ड की पुष्टि करें' : 'Confirm your password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.confirmPassword}</p>}
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
                className={`mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded transition-colors ${errors.agreeToTerms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                required
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {currentLanguage === 'hi' ? 'मैं सहमत हूं' : 'I agree to the'}{' '}
                <Link to="/terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  {currentLanguage === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}
                </Link>{' '}
                {currentLanguage === 'hi' ? 'और' : 'and'}{' '}
                <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  {currentLanguage === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.agreeToTerms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-3 px-6 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
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
                <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  {currentLanguage === 'hi' ? 'लॉगिन' : 'Login'}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
