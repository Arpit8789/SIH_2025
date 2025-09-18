// src/components/forms/OTPForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';

const OTPForm = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const { verifyOTP } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from navigation state (from register)
  const userData = location.state;
  const userEmail = userData?.email || '';
  const userName = userData?.name || '';

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePaste();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 6);
      
      if (digits.length === 6) {
        const newOtp = digits.split('');
        setOtp(newOtp);
        // Focus the last input
        inputRefs.current[5]?.focus();
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError(t('auth.otpIncomplete'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call backend OTP verification API
      const result = await verifyOTP({
        email: userEmail,
        otp: otpString
      });

      if (result.success) {
        // Navigate to dashboard based on user role
        const dashboardRoute = result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        navigate(dashboardRoute);
      }
    } catch (error) {
      setError(error.message || t('auth.otpVerificationFailed'));
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError('');

    try {
      // Call backend resend OTP API
      const result = await authService.resendOTP(userEmail);
      
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError(error.message || t('auth.resendFailed'));
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-ag rounded-lg flex items-center justify-center">
            <CheckCircle className="text-white h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {t('auth.verifyOTP')}
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm">
          {t('auth.otpSentTo')}{' '}
          <span className="font-medium text-foreground">{userEmail}</span>
        </p>
        {userName && (
          <p className="text-center text-sm text-primary">
            {t('auth.welcomeUser', { name: userName })}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  "w-12 h-12 text-center text-lg font-semibold",
                  digit ? "border-primary" : "",
                  error ? "border-red-500" : ""
                )}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11" 
            disabled={isLoading || !isOtpComplete}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.verifyAndContinue')}
          </Button>

          {/* Resend OTP */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('auth.didntReceiveOTP')}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="text-primary hover:text-primary/80"
            >
              {isResending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {canResend 
                ? t('auth.resendOTP')
                : `${t('auth.resendIn')} ${formatTime(countdown)}`
              }
            </Button>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth/login')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.backToLogin')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OTPForm;
