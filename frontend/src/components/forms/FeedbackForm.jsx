// src/components/forms/FeedbackForm.jsx
import React, { useState } from 'react';
import { Star, Send, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import VoiceButton from '@/components/common/VoiceButton';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { validators } from '@/utils/validators';
import { cn } from '@/lib/utils';

const FeedbackForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    category: '',
    rating: 0,
    subject: '',
    message: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { user } = useAuth();
  const { t } = useLanguage();

  const feedbackCategories = [
    { value: 'feature_request', label: t('feedback.featureRequest') },
    { value: 'bug_report', label: t('feedback.bugReport') },
    { value: 'user_experience', label: t('feedback.userExperience') },
    { value: 'weather_service', label: t('feedback.weatherService') },
    { value: 'market_data', label: t('feedback.marketData') },
    { value: 'ai_assistant', label: t('feedback.aiAssistant') },
    { value: 'mobile_app', label: t('feedback.mobileApp') },
    { value: 'general', label: t('feedback.general') }
  ];

  // Initialize with user data if available
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const handleVoiceInput = (field, transcript) => {
    setFormData(prev => ({ ...prev, [field]: transcript }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validate form
    const validationRules = {
      category: { required: 'Please select a feedback category' },
      rating: { 
        required: 'Please provide a rating',
        min: { value: 1, message: 'Rating must be at least 1 star' }
      },
      subject: { 
        required: 'Subject is required',
        minLength: { value: 10, message: 'Subject must be at least 10 characters' }
      },
      message: { 
        required: 'Message is required',
        minLength: { value: 20, message: 'Message must be at least 20 characters' }
      }
    };

    // Add email validation if user is not logged in
    if (!user) {
      validationRules.email = validators.validationRules.email;
    }

    const validation = validators.validateForm(formData, validationRules);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      // Prepare feedback data for backend API
      const feedbackData = {
        category: formData.category,
        rating: formData.rating,
        subject: formData.subject,
        message: formData.message,
        userInfo: {
          userId: user?.id || null,
          email: formData.email,
          phone: formData.phone,
          userAgent: navigator.userAgent,
          currentUrl: window.location.href,
          timestamp: new Date().toISOString()
        }
      };

      // Submit to backend API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('krishi_token')}` })
        },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(t('feedback.submitSuccess'));
        
        // Reset form
        setFormData({
          category: '',
          rating: 0,
          subject: '',
          message: '',
          email: user?.email || '',
          phone: user?.phone || ''
        });

        // Call success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(result);
        }

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result.message || 'Feedback submission failed');
      }
    } catch (error) {
      setErrors({ 
        general: error.message || t('feedback.submitFailed') 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (index) => {
    if (index <= formData.rating) {
      if (formData.rating <= 2) return 'text-red-500';
      if (formData.rating <= 3) return 'text-yellow-500';
      return 'text-green-500';
    }
    return 'text-gray-300';
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: t('feedback.veryPoor'),
      2: t('feedback.poor'),
      3: t('feedback.average'),
      4: t('feedback.good'),
      5: t('feedback.excellent')
    };
    return labels[rating] || '';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          {t('feedback.title')}
        </CardTitle>
        <p className="text-muted-foreground">
          {t('feedback.subtitle')}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {successMessage && (
            <Alert variant="success">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* General Error */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('feedback.category')} *
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('feedback.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {feedbackCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('feedback.rating')} *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className={cn(
                    "p-1 hover:scale-110 transition-transform",
                    getRatingColor(star)
                  )}
                >
                  <Star 
                    className={cn(
                      "h-8 w-8",
                      star <= formData.rating ? "fill-current" : ""
                    )} 
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {getRatingLabel(formData.rating)}
                </span>
              )}
            </div>
            {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('feedback.subject')} *
            </label>
            <div className="relative">
              <Input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t('feedback.subjectPlaceholder')}
                className={`pr-12 ${errors.subject ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <VoiceButton
                  mode="listen"
                  onTranscript={(text) => handleVoiceInput('subject', text)}
                  size="sm"
                  variant="ghost"
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.subject && <span className="text-red-500">{errors.subject}</span>}
              <span>{formData.subject.length}/100</span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('feedback.message')} *
            </label>
            <div className="relative">
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t('feedback.messagePlaceholder')}
                rows={6}
                className={`pr-12 ${errors.message ? 'border-red-500' : ''}`}
                maxLength={1000}
              />
              <div className="absolute right-2 top-2">
                <VoiceButton
                  mode="listen"
                  onTranscript={(text) => handleVoiceInput('message', text)}
                  size="sm"
                  variant="ghost"
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.message && <span className="text-red-500">{errors.message}</span>}
              <span>{formData.message.length}/1000</span>
            </div>
          </div>

          {/* Contact Information - Show if user is not logged in */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('feedback.email')} *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('feedback.emailPlaceholder')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('feedback.phone')}
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              className="px-8 h-11" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              {t('feedback.submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
