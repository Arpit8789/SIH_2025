// src/components/forms/FeedbackForm.jsx - ENHANCED RESPONSIVE VERSION
import React, { useState } from 'react';
import { 
  Star, 
  Send, 
  Loader2, 
  MessageCircle, 
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Mic,
  Camera,
  Paperclip,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
    phone: '',
    priority: 'medium',
    attachments: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { user } = useAuth();
  const { currentLanguage } = useLanguage();

  const feedbackCategories = [
    { 
      value: 'feature_request', 
      label: currentLanguage === 'hi' ? 'नई सुविधा का अनुरोध' : 'Feature Request',
      icon: '💡',
      description: currentLanguage === 'hi' ? 'नई सुविधाओं के लिए सुझाव' : 'Suggestions for new features'
    },
    { 
      value: 'bug_report', 
      label: currentLanguage === 'hi' ? 'बग रिपोर्ट' : 'Bug Report',
      icon: '🐛',
      description: currentLanguage === 'hi' ? 'तकनीकी समस्याओं की रिपोर्ट' : 'Report technical issues'
    },
    { 
      value: 'user_experience', 
      label: currentLanguage === 'hi' ? 'उपयोगकर्ता अनुभव' : 'User Experience',
      icon: '👤',
      description: currentLanguage === 'hi' ? 'ऐप के उपयोग में सुधार' : 'App usability improvements'
    },
    { 
      value: 'weather_service', 
      label: currentLanguage === 'hi' ? 'मौसम सेवा' : 'Weather Service',
      icon: '🌤️',
      description: currentLanguage === 'hi' ? 'मौसम की जानकारी से संबंधित' : 'Weather information related'
    },
    { 
      value: 'market_data', 
      label: currentLanguage === 'hi' ? 'बाजार डेटा' : 'Market Data',
      icon: '📊',
      description: currentLanguage === 'hi' ? 'बाजार भाव और डेटा' : 'Market prices and data'
    },
    { 
      value: 'ai_assistant', 
      label: currentLanguage === 'hi' ? 'AI सहायक' : 'AI Assistant',
      icon: '🤖',
      description: currentLanguage === 'hi' ? 'AI चैटबॉट और सहायता' : 'AI chatbot and assistance'
    },
    { 
      value: 'mobile_app', 
      label: currentLanguage === 'hi' ? 'मोबाइल ऐप' : 'Mobile App',
      icon: '📱',
      description: currentLanguage === 'hi' ? 'मोबाइल एप्लिकेशन' : 'Mobile application'
    },
    { 
      value: 'general', 
      label: currentLanguage === 'hi' ? 'सामान्य' : 'General',
      icon: '💬',
      description: currentLanguage === 'hi' ? 'अन्य सुझाव और टिप्पणियां' : 'Other suggestions and comments'
    }
  ];

  const priorityLevels = [
    { value: 'low', label: currentLanguage === 'hi' ? 'कम' : 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: currentLanguage === 'hi' ? 'मध्यम' : 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: currentLanguage === 'hi' ? 'उच्च' : 'High', color: 'bg-red-100 text-red-800' }
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

  const getFormProgress = () => {
    const fields = ['category', 'rating', 'subject', 'message'];
    const filledFields = fields.filter(field => {
      if (field === 'rating') return formData[field] > 0;
      return formData[field].trim() !== '';
    });
    return (filledFields.length / fields.length) * 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validate form
    const validationRules = {
      category: { required: currentLanguage === 'hi' ? 'कृपया फीडबैक श्रेणी चुनें' : 'Please select a feedback category' },
      rating: { 
        required: currentLanguage === 'hi' ? 'कृपया रेटिंग दें' : 'Please provide a rating',
        min: { value: 1, message: currentLanguage === 'hi' ? 'रेटिंग कम से कम 1 स्टार होनी चाहिए' : 'Rating must be at least 1 star' }
      },
      subject: { 
        required: currentLanguage === 'hi' ? 'विषय आवश्यक है' : 'Subject is required',
        minLength: { value: 10, message: currentLanguage === 'hi' ? 'विषय कम से कम 10 अक्षर का होना चाहिए' : 'Subject must be at least 10 characters' }
      },
      message: { 
        required: currentLanguage === 'hi' ? 'संदेश आवश्यक है' : 'Message is required',
        minLength: { value: 20, message: currentLanguage === 'hi' ? 'संदेश कम से कम 20 अक्षर का होना चाहिए' : 'Message must be at least 20 characters' }
      }
    };

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
      const feedbackData = {
        category: formData.category,
        rating: formData.rating,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        userInfo: {
          userId: user?.id || null,
          email: formData.email,
          phone: formData.phone,
          userAgent: navigator.userAgent,
          currentUrl: window.location.href,
          timestamp: new Date().toISOString()
        }
      };

      // Simulate API call (replace with actual API endpoint)
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessage(
        currentLanguage === 'hi' 
          ? 'आपका फीडबैक सफलतापूर्वक सबमिट हो गया है! हम जल्द ही आपसे संपर्क करेंगे।'
          : 'Your feedback has been submitted successfully! We will get back to you soon.'
      );
      
      // Reset form
      setFormData({
        category: '',
        rating: 0,
        subject: '',
        message: '',
        email: user?.email || '',
        phone: user?.phone || '',
        priority: 'medium',
        attachments: []
      });

      if (onSubmitSuccess) {
        onSubmitSuccess({ success: true });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrors({ 
        general: error.message || (currentLanguage === 'hi' ? 'फीडबैक सबमिट करने में त्रुटि' : 'Feedback submission failed')
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
    return 'text-gray-300 dark:text-gray-600';
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: currentLanguage === 'hi' ? 'बहुत खराब' : 'Very Poor',
      2: currentLanguage === 'hi' ? 'खराब' : 'Poor',
      3: currentLanguage === 'hi' ? 'औसत' : 'Average',
      4: currentLanguage === 'hi' ? 'अच्छा' : 'Good',
      5: currentLanguage === 'hi' ? 'उत्कृष्ट' : 'Excellent'
    };
    return labels[rating] || '';
  };

  const selectedCategory = feedbackCategories.find(cat => cat.value === formData.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 py-4 px-4 sm:py-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4 shadow-lg">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-2">
            {currentLanguage === 'hi' ? 'आपका फीडबैक' : 'Your Feedback'}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {currentLanguage === 'hi' 
              ? 'आपकी राय हमारे लिए महत्वपूर्ण है। कृपया अपना अनुभव साझा करें।'
              : 'Your opinion matters to us. Please share your experience with us.'
            }
          </p>
        </div>

        <Card className="w-full shadow-xl border-green-200 dark:border-green-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                {currentLanguage === 'hi' ? 'फीडबैक फॉर्म' : 'Feedback Form'}
              </CardTitle>
              
              {/* User Info */}
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-600 text-white">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.name}</span>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentLanguage === 'hi' ? 'प्रगति' : 'Progress'}</span>
                <span>{Math.round(getFormProgress())}%</span>
              </div>
              <Progress value={getFormProgress()} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Success Message */}
              {successMessage && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-400">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Category Selection */}
              <div className="space-y-4">
                <label className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  {currentLanguage === 'hi' ? 'फीडबैक श्रेणी' : 'Feedback Category'} *
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {feedbackCategories.map((category) => (
                    <div
                      key={category.value}
                      onClick={() => handleSelectChange('category', category.value)}
                      className={cn(
                        "p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                        formData.category === category.value
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                      )}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{category.icon}</div>
                        <h3 className="font-medium text-sm">{category.label}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              {/* Rating Section */}
              <div className="space-y-4">
                <label className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {currentLanguage === 'hi' ? 'आपकी रेटिंग' : 'Your Rating'} *
                </label>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className={cn(
                            "p-1 sm:p-2 hover:scale-110 transition-all duration-200 rounded-full",
                            getRatingColor(star)
                          )}
                        >
                          <Star 
                            className={cn(
                              "h-6 w-6 sm:h-8 sm:w-8",
                              star <= formData.rating ? "fill-current" : ""
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                    {formData.rating > 0 && (
                      <div className="text-center">
                        <p className="text-lg sm:text-xl font-semibold text-foreground">
                          {getRatingLabel(formData.rating)}
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          {formData.rating >= 4 ? (
                            <ThumbsUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <ThumbsDown className="h-5 w-5 text-orange-600" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {formData.rating}/5 {currentLanguage === 'hi' ? 'स्टार' : 'stars'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-semibold text-foreground">
                  {currentLanguage === 'hi' ? 'विषय' : 'Subject'} *
                </label>
                <div className="relative">
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={currentLanguage === 'hi' ? 'संक्षेप में अपनी समस्या या सुझाव बताएं...' : 'Briefly describe your issue or suggestion...'}
                    className={cn(
                      "pr-12 h-12 text-base border-green-200 focus:border-green-400 dark:border-green-700",
                      errors.subject && 'border-red-500'
                    )}
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
                  <span className="ml-auto">{formData.subject.length}/100</span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-semibold text-foreground">
                  {currentLanguage === 'hi' ? 'विस्तृत संदेश' : 'Detailed Message'} *
                </label>
                <div className="relative">
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={currentLanguage === 'hi' 
                      ? 'कृपया विस्तार से बताएं कि आप क्या कहना चाहते हैं। आपका अनुभव, सुझाव या समस्या के बारे में जानकारी दें...'
                      : 'Please provide detailed information about your experience, suggestions, or issues. The more specific you are, the better we can help...'
                    }
                    rows={6}
                    className={cn(
                      "pr-12 text-base border-green-200 focus:border-green-400 dark:border-green-700 resize-none",
                      errors.message && 'border-red-500'
                    )}
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
                  <span className="ml-auto">{formData.message.length}/1000</span>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-semibold text-foreground">
                  {currentLanguage === 'hi' ? 'प्राथमिकता' : 'Priority'}
                </label>
                <div className="flex gap-2 sm:gap-3">
                  {priorityLevels.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => handleSelectChange('priority', priority.value)}
                      className={cn(
                        "px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium",
                        formData.priority === priority.value
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                      )}
                    >
                      <Badge variant="outline" className={priority.color}>
                        {priority.label}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information - Show if user is not logged in */}
              {!user && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    {currentLanguage === 'hi' ? 'संपर्क जानकारी' : 'Contact Information'}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3 text-blue-600" />
                        {currentLanguage === 'hi' ? 'ईमेल' : 'Email'} *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={currentLanguage === 'hi' ? 'आपका ईमेल पता' : 'your.email@example.com'}
                        className={cn(
                          "h-12 border-blue-200 focus:border-blue-400",
                          errors.email && 'border-red-500'
                        )}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3 text-blue-600" />
                        {currentLanguage === 'hi' ? 'फोन नंबर' : 'Phone Number'}
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className={cn(
                          "h-12 border-blue-200 focus:border-blue-400",
                          errors.phone && 'border-red-500'
                        )}
                      />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {currentLanguage === 'hi' 
                        ? 'हम 24-48 घंटों में जवाब देने की कोशिश करते हैं'
                        : 'We try to respond within 24-48 hours'
                      }
                    </span>
                  </div>
                  {selectedCategory && (
                    <div className="flex items-center gap-2">
                      <span>{selectedCategory.icon}</span>
                      <span>{currentLanguage === 'hi' ? 'श्रेणी:' : 'Category:'} {selectedCategory.label}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto px-6 sm:px-8 h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  <Send className="mr-2 h-5 w-5" />
                  {currentLanguage === 'hi' ? 'फीडबैक सबमिट करें' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-blue-800 dark:text-blue-400">
                {currentLanguage === 'hi' ? 'तुरंत सहायता चाहिए?' : 'Need Immediate Help?'}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {currentLanguage === 'hi' 
                  ? 'आपातकालीन सहायता के लिए हमारे हेल्प सेंटर पर जाएं या सीधे हमसे संपर्क करें।'
                  : 'Visit our help center for emergency assistance or contact us directly.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  {currentLanguage === 'hi' ? 'हेल्प सेंटर' : 'Help Center'}
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  {currentLanguage === 'hi' ? 'लाइव चैट' : 'Live Chat'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackForm;
