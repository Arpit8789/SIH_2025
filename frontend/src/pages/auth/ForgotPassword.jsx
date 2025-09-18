// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { authService } from '@/services/authService';
import { validators } from '@/utils/validators';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email
    const validation = validators.validateForm({ email }, {
      email: validators.validationRules.email
    });

    if (!validation.isValid) {
      setError(validation.errors.email);
      setIsLoading(false);
      return;
    }

    try {
      // Call backend forgot password API
      const response = await authService.forgotPassword({ email });
      
      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError(error.message || t('auth.resetFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('auth.emailSent')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('auth.resetEmailSent', { email })}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t('auth.checkEmailInstructions')}
          </p>
          <Link to="/auth/login">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.backToLogin')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-ag rounded-lg flex items-center justify-center">
            <Mail className="text-white h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {t('auth.forgotPassword')}
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm">
          {t('auth.forgotPasswordSubtitle')}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.sendResetLink')}
          </Button>

          <div className="text-center">
            <Link to="/auth/login" className="text-sm text-primary hover:underline">
              <ArrowLeft className="inline mr-1 h-3 w-3" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
