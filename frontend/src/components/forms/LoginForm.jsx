// src/components/forms/LoginForm.jsx - COMPACT VERSION
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, User, Lock, AlertCircle, CheckCircle, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, getRedirectPath } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = currentLanguage === 'hi' ? 'ईमेल आवश्यक है' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = currentLanguage === 'hi' ? 'वैध ईमेल दर्ज करें' : 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = currentLanguage === 'hi' ? 'पासवर्ड आवश्यक है' : 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = currentLanguage === 'hi' ? 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए' : 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    console.log('🔐 LoginForm: ===== LOGIN PROCESS STARTED =====')
    console.log('🔐 LoginForm: Form data =', { email: formData.email, password: '***' })

    try {
      console.log('🔐 LoginForm: Calling AuthContext login...')
      const result = await login(formData);
      console.log('🔐 LoginForm: AuthContext login result =', result)
      
      if (result.success && result.user) {
        console.log('✅ LoginForm: Login successful!')
        
        const redirectPath = getRedirectPath(result.user);
        console.log('🎯 LoginForm: Redirecting to =', redirectPath)
        
        navigate(redirectPath, { replace: true });
        console.log('🔐 LoginForm: ===== LOGIN PROCESS COMPLETED =====')
      } else {
        console.log('❌ LoginForm: Login failed =', result.message)
        setErrors({ 
          general: result.message || (currentLanguage === 'hi' ? 'लॉगिन असफल' : 'Login failed')
        });
      }
    } catch (error) {
      console.error('❌ LoginForm: Login error:', error)
      setErrors({ 
        general: error.message || (currentLanguage === 'hi' ? 'लॉगिन में त्रुटि हुई' : 'An error occurred during login')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    en: {
      welcome: 'Welcome Back, Farmer!',
      loginSubtitle: 'Sign in to access your smart farming dashboard',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      forgotPassword: 'Forgot Password?',
      login: 'Sign In to Dashboard',
      secureLogin: 'Secure farmer login'
    },
    hi: {
      welcome: 'वापस आपका स्वागत है, किसान!',
      loginSubtitle: 'अपने स्मार्ट कृषि डैशबोर्ड में साइन इन करें',
      email: 'ईमेल पता',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      password: 'पासवर्ड',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      forgotPassword: 'पासवर्ड भूल गए?',
      login: 'डैशबोर्ड में साइन इन करें',
      secureLogin: 'सुरक्षित किसान लॉगिन'
    }
  };

  const t = translations[currentLanguage] || translations.en;

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="shadow-2xl border-2 border-green-200/50 dark:border-green-700/50 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-teal-900/40 backdrop-blur-md">
        <CardHeader className="space-y-4 pb-4 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-4 text-3xl">🌾</div>
            <div className="absolute bottom-2 left-4 text-2xl">🌱</div>
            <div className="absolute top-1/2 right-6 text-xl">🚜</div>
          </div>
          
          {/* Logo & Brand - Smaller */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-green-200/50 dark:ring-green-700/50">
                <span className="text-white text-3xl">🌾</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t.welcome}
              </CardTitle>
              <p className="text-green-700 dark:text-green-300 font-medium text-sm">
                {t.loginSubtitle}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-green-600/80 dark:text-green-400/80">
                <CheckCircle className="h-3 w-3" />
                <span>{t.secureLogin}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error Alert */}
            {errors.general && (
              <Alert variant="destructive" className="border-red-300 bg-red-50/80 dark:bg-red-900/20 dark:border-red-800 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Field - Smaller */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                {t.email}
              </label>
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.emailPlaceholder}
                  className={`h-11 pl-4 pr-10 text-sm font-medium border-2 transition-all duration-300 rounded-lg ${
                    errors.email 
                      ? 'border-red-400 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20 dark:border-red-600' 
                      : 'border-green-300 focus:border-green-500 bg-green-50/50 dark:bg-green-900/20 focus:bg-green-100/50 dark:focus:bg-green-900/30 dark:border-green-600'
                  } placeholder:text-green-500/60 dark:placeholder:text-green-400/60`}
                  autoComplete="email"
                />
                {formData.email && !errors.email && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                )}
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field - Smaller */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                <Lock className="h-3 w-3 text-green-600 dark:text-green-400" />
                {t.password}
              </label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.passwordPlaceholder}
                  className={`h-11 pl-4 pr-10 text-sm font-medium border-2 transition-all duration-300 rounded-lg ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20 dark:border-red-600' 
                      : 'border-green-300 focus:border-green-500 bg-green-50/50 dark:bg-green-900/20 focus:bg-green-100/50 dark:focus:bg-green-900/30 dark:border-green-600'
                  } placeholder:text-green-500/60 dark:placeholder:text-green-400/60`}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-green-200/50 dark:hover:bg-green-800/50 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-3 w-3 text-green-600" /> : <Eye className="h-3 w-3 text-green-600" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link - Smaller */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-xs text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:underline font-semibold transition-colors flex items-center gap-1"
              >
                <span>{t.forgotPassword}</span>
              </Link>
            </div>

            {/* Submit Button - Smaller */}
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg border-0 relative overflow-hidden" 
              disabled={isLoading}
            >
              {/* Button Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1 right-3 text-sm">🌾</div>
                <div className="absolute bottom-1 left-4 text-xs">🚜</div>
              </div>
              
              {isLoading ? (
                <div className="flex items-center gap-2 relative z-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{currentLanguage === 'hi' ? 'साइन इन हो रहा है...' : 'Signing In...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Wheat className="h-4 w-4" />
                  <span>{t.login}</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
