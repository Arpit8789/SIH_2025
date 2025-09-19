// src/pages/auth/ForgotPassword.jsx - COMPLETE WITH DARK MODE SUPPORT
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Send, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { currentLanguage } = useLanguage();

  // ✅ Simple email validation without external validators
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email
    if (!email) {
      setError(currentLanguage === 'hi' ? 'ईमेल आवश्यक है' : 'Email is required');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError(currentLanguage === 'hi' ? 'कृपया वैध ईमेल दर्ज करें' : 'Please enter a valid email');
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Simulate API call - replace with actual authService call
      const response = await mockForgotPasswordAPI(email);
      
      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError(error.message || (currentLanguage === 'hi' ? 'रीसेट ईमेल भेजने में असफल' : 'Failed to send reset email'));
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Mock API function - replace with your actual API call
  const mockForgotPasswordAPI = async (email) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success response
    return {
      success: true,
      message: 'Reset email sent successfully'
    };
  };

  const translations = {
    en: {
      forgotPassword: 'Forgot Password?',
      forgotPasswordSubtitle: 'Enter your email to receive a password reset link',
      email: 'Email Address',
      emailPlaceholder: 'Enter your registered email',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Login',
      emailSent: 'Email Sent!',
      resetEmailSent: `We've sent a password reset link to`,
      checkEmailInstructions: 'Please check your email and follow the instructions to reset your password. The link will expire in 15 minutes.',
      securityNote: 'For your security, we only send reset links to registered email addresses.',
      noEmail: 'Didn\'t receive email?',
      resendLink: 'Resend link',
      smartFarming: 'Smart Farming Platform'
    },
    hi: {
      forgotPassword: 'पासवर्ड भूल गए?',
      forgotPasswordSubtitle: 'पासवर्ड रीसेट लिंक प्राप्त करने के लिए अपना ईमेल दर्ज करें',
      email: 'ईमेल पता',
      emailPlaceholder: 'अपना पंजीकृत ईमेल दर्ज करें',
      sendResetLink: 'रीसेट लिंक भेजें',
      backToLogin: 'लॉगिन पर वापस जाएं',
      emailSent: 'ईमेल भेजा गया!',
      resetEmailSent: 'हमने पासवर्ड रीसेट लिंक भेजा है',
      checkEmailInstructions: 'कृपया अपना ईमेल चेक करें और पासवर्ड रीसेट करने के लिए निर्देशों का पालन करें। यह लिंक 15 मिनट में समाप्त हो जाएगा।',
      securityNote: 'आपकी सुरक्षा के लिए, हम केवल पंजीकृत ईमेल पते पर रीसेट लिंक भेजते हैं।',
      noEmail: 'ईमेल नहीं मिला?',
      resendLink: 'दोबारा भेजें',
      smartFarming: 'स्मार्ट खेती प्लेटफॉर्म'
    }
  };

  const t = translations[currentLanguage] || translations.en;

  // ✅ Success State with Dark Mode Support
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            
            {/* Success Message */}
            <div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {t.emailSent}
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t.resetEmailSent}
              </p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  {t.checkEmailInstructions}
                </p>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{t.securityNote}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.backToLogin}
                </Button>
              </Link>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{t.noEmail}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSuccess(false)}
                  className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Send className="mr-1 h-3 w-3" />
                  {t.resendLink}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Main Forgot Password Form with Dark Mode Support
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Mail className="text-white h-8 w-8" />
            </div>
          </div>
          
          {/* Title */}
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
              {t.forgotPassword}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              {t.forgotPasswordSubtitle}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {t.email}
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className={`h-12 pl-4 pr-4 text-base border-2 transition-all duration-200 ${
                    error 
                      ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10' 
                      : 'border-blue-200 focus:border-blue-500 focus:bg-blue-50/50 dark:focus:bg-blue-900/10 dark:border-blue-700'
                  }`}
                  autoComplete="email"
                  required
                />
                {email && validateEmail(email) && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  {t.securityNote}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{currentLanguage === 'hi' ? 'भेजा जा रहा है...' : 'Sending...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>{t.sendResetLink}</span>
                </div>
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center pt-4 border-t dark:border-gray-700">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              {t.backToLogin}
            </Link>
          </div>

          {/* Platform Info */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <span>🌾</span>
              <span>{t.smartFarming}</span>
              <span>🇮🇳</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
