// src/components/forms/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Camera, MapPin, Save, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, PriceInput } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ImageUploader from '@/components/common/ImageUploader';
import VoiceButton from '@/components/common/VoiceButton';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { validators } from '@/utils/validators';
import { farmerService } from '@/services/farmerService';
import { buyerService } from '@/services/buyerService';

const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { getCurrentPosition } = useGeolocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: null,
    // Common fields
    state: '',
    district: '',
    pincode: '',
    address: '',
    // Farmer specific fields
    farmSize: '',
    farmingExperience: '',
    primaryCrops: [],
    farmingType: '',
    irrigationType: '',
    soilType: '',
    coordinates: { latitude: null, longitude: null },
    // Buyer specific fields
    businessName: '',
    businessType: '',
    gstNumber: '',
    purchaseCapacity: '',
    preferredCrops: [],
    operatingRadius: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load user profile data from backend
  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      let profileData;
      if (user.role === 'farmer') {
        const response = await farmerService.getProfile();
        profileData = response.data;
      } else if (user.role === 'buyer') {
        const response = await buyerService.getProfile();
        profileData = response.data;
      }

      if (profileData) {
        setFormData({
          name: profileData.name || user.name || '',
          email: profileData.email || user.email || '',
          phone: profileData.phone || user.phone || '',
          profileImage: profileData.profileImage || null,
          state: profileData.location?.state || '',
          district: profileData.location?.district || '',
          pincode: profileData.location?.pincode || '',
          address: profileData.location?.address || '',
          // Farmer fields
          farmSize: profileData.farmDetails?.size || '',
          farmingExperience: profileData.farmDetails?.experience || '',
          primaryCrops: profileData.farmDetails?.primaryCrops || [],
          farmingType: profileData.farmDetails?.type || '',
          irrigationType: profileData.farmDetails?.irrigation || '',
          soilType: profileData.farmDetails?.soilType || '',
          coordinates: profileData.farmDetails?.coordinates || { latitude: null, longitude: null },
          // Buyer fields
          businessName: profileData.businessDetails?.name || '',
          businessType: profileData.businessDetails?.type || '',
          gstNumber: profileData.businessDetails?.gstNumber || '',
          purchaseCapacity: profileData.businessDetails?.purchaseCapacity || '',
          preferredCrops: profileData.businessDetails?.preferredCrops || [],
          operatingRadius: profileData.businessDetails?.operatingRadius || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

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

  const handleVoiceInput = (field, transcript) => {
    setFormData(prev => ({ ...prev, [field]: transcript }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (images) => {
    if (images.length > 0) {
      setFormData(prev => ({ ...prev, profileImage: images[0].url }));
    }
  };

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentPosition();
      if (location) {
        setFormData(prev => ({
          ...prev,
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }));
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validate form based on user role
    const commonValidation = {
      name: validators.validationRules.name,
      email: validators.validationRules.email,
      phone: validators.validationRules.phone,
      state: { required: 'State is required' },
      district: { required: 'District is required' }
    };

    let validationRules = commonValidation;

    if (user.role === 'farmer') {
      validationRules = {
        ...commonValidation,
        farmSize: validators.validationRules.landSize,
        farmingExperience: { 
          required: 'Farming experience is required',
          min: { value: 0, message: 'Experience cannot be negative' }
        }
      };
    } else if (user.role === 'buyer') {
      validationRules = {
        ...commonValidation,
        businessName: { required: 'Business name is required' },
        businessType: { required: 'Business type is required' }
      };
    }

    const validation = validators.validateForm(formData, validationRules);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data for backend API
      const profileUpdateData = {
        name: formData.name,
        phone: validators.normalizeAndValidatePhone(formData.phone).normalized,
        profileImage: formData.profileImage,
        location: {
          state: formData.state,
          district: formData.district,
          pincode: formData.pincode,
          address: formData.address
        }
      };

      if (user.role === 'farmer') {
        profileUpdateData.farmDetails = {
          size: parseFloat(formData.farmSize),
          experience: parseInt(formData.farmingExperience),
          primaryCrops: formData.primaryCrops,
          type: formData.farmingType,
          irrigation: formData.irrigationType,
          soilType: formData.soilType,
          coordinates: formData.coordinates
        };
      } else if (user.role === 'buyer') {
        profileUpdateData.businessDetails = {
          name: formData.businessName,
          type: formData.businessType,
          gstNumber: formData.gstNumber,
          purchaseCapacity: parseFloat(formData.purchaseCapacity),
          preferredCrops: formData.preferredCrops,
          operatingRadius: parseInt(formData.operatingRadius)
        };
      }

      // Call backend update API
      const result = await updateProfile(profileUpdateData);

      if (result.success) {
        setSuccessMessage(t('profile.updateSuccess'));
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setErrors({ general: error.message || t('profile.updateFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const cropOptions = [
    'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 
    'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Tea', 'Coffee'
  ];

  const farmingTypes = [
    { value: 'organic', label: t('profile.organic') },
    { value: 'conventional', label: t('profile.conventional') },
    { value: 'mixed', label: t('profile.mixed') }
  ];

  const irrigationTypes = [
    { value: 'drip', label: t('profile.drip') },
    { value: 'sprinkler', label: t('profile.sprinkler') },
    { value: 'flood', label: t('profile.flood') },
    { value: 'rainfed', label: t('profile.rainfed') }
  ];

  const soilTypes = [
    { value: 'alluvial', label: t('profile.alluvial') },
    { value: 'black', label: t('profile.black') },
    { value: 'red', label: t('profile.red') },
    { value: 'laterite', label: t('profile.laterite') },
    { value: 'mountain', label: t('profile.mountain') }
  ];

  const businessTypes = [
    { value: 'retailer', label: t('profile.retailer') },
    { value: 'wholesaler', label: t('profile.wholesaler') },
    { value: 'processor', label: t('profile.processor') },
    { value: 'exporter', label: t('profile.exporter') }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {t('profile.editProfile')}
          </CardTitle>
          <p className="text-muted-foreground">
            {t('profile.updateInformation')}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
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

            {/* Profile Image Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('profile.profileImage')}</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-ag flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <ImageUploader
                    onImageUpload={handleImageUpload}
                    maxFiles={1}
                    maxSizeInMB={5}
                    placeholder={t('profile.uploadProfileImage')}
                    existingImages={formData.profileImage ? [{ url: formData.profileImage, filename: 'profile.jpg' }] : []}
                  />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('profile.basicInformation')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('profile.fullName')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('profile.namePlaceholder')}
                      className={`pl-10 pr-12 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <VoiceButton
                        mode="listen"
                        onTranscript={(text) => handleVoiceInput('name', text)}
                        size="sm"
                        variant="ghost"
                      />
                    </div>
                  </div>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('profile.email')} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true} // Email typically can't be changed
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('profile.emailCannotChange')}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('profile.phone')} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('profile.role')}
                  </label>
                  <div className="pt-2">
                    <Badge variant="outline" className="capitalize">
                      {user?.role === 'farmer' ? '👨‍🌾' : '🛒'} {t(`roles.${user?.role}`)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('profile.locationInformation')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('profile.state')} *
                  </label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => handleSelectChange('state', value)}
                  >
                    <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('profile.selectState')} />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('profile.district')} *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder={t('profile.districtPlaceholder')}
                      className={`pl-10 pr-12 ${errors.district ? 'border-red-500' : ''}`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <VoiceButton
                        mode="listen"
                        onTranscript={(text) => handleVoiceInput('district', text)}
                        size="sm"
                        variant="ghost"
                      />
                    </div>
                  </div>
                  {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('profile.pincode')}
                  </label>
                  <Input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="110001"
                    className={errors.pincode ? 'border-red-500' : ''}
                  />
                  {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('profile.coordinates')}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={isLoadingLocation}
                      className="flex-shrink-0"
                    >
                      {isLoadingLocation ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="mr-2 h-4 w-4" />
                      )}
                      {t('profile.getLocation')}
                    </Button>
                    {formData.coordinates.latitude && (
                      <div className="text-xs text-muted-foreground flex items-center">
                        📍 {formData.coordinates.latitude.toFixed(6)}, {formData.coordinates.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('profile.address')}
                </label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('profile.addressPlaceholder')}
                  rows={3}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
            </div>

            {/* Role-specific sections */}
            {user?.role === 'farmer' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('profile.farmingInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.farmSize')} * (acres)
                    </label>
                    <Input
                      name="farmSize"
                      type="number"
                      step="0.1"
                      value={formData.farmSize}
                      onChange={handleChange}
                      placeholder="10.5"
                      className={errors.farmSize ? 'border-red-500' : ''}
                    />
                    {errors.farmSize && <p className="text-sm text-red-500">{errors.farmSize}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.experience')} * (years)
                    </label>
                    <Input
                      name="farmingExperience"
                      type="number"
                      value={formData.farmingExperience}
                      onChange={handleChange}
                      placeholder="15"
                      className={errors.farmingExperience ? 'border-red-500' : ''}
                    />
                    {errors.farmingExperience && <p className="text-sm text-red-500">{errors.farmingExperience}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.farmingType')}
                    </label>
                    <Select
                      value={formData.farmingType}
                      onValueChange={(value) => handleSelectChange('farmingType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectFarmingType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {farmingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.irrigationType')}
                    </label>
                    <Select
                      value={formData.irrigationType}
                      onValueChange={(value) => handleSelectChange('irrigationType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectIrrigation')} />
                      </SelectTrigger>
                      <SelectContent>
                        {irrigationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.soilType')}
                    </label>
                    <Select
                      value={formData.soilType}
                      onValueChange={(value) => handleSelectChange('soilType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectSoilType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'buyer' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('profile.businessInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.businessName')} *
                    </label>
                    <Input
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder={t('profile.businessNamePlaceholder')}
                      className={errors.businessName ? 'border-red-500' : ''}
                    />
                    {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.businessType')} *
                    </label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => handleSelectChange('businessType', value)}
                    >
                      <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('profile.selectBusinessType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.businessType && <p className="text-sm text-red-500">{errors.businessType}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.gstNumber')}
                    </label>
                    <Input
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                      className={errors.gstNumber ? 'border-red-500' : ''}
                    />
                    {errors.gstNumber && <p className="text-sm text-red-500">{errors.gstNumber}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('profile.purchaseCapacity')} (tons/month)
                    </label>
                    <Input
                      name="purchaseCapacity"
                      type="number"
                      value={formData.purchaseCapacity}
                      onChange={handleChange}
                      placeholder="100"
                      className={errors.purchaseCapacity ? 'border-red-500' : ''}
                    />
                    {errors.purchaseCapacity && <p className="text-sm text-red-500">{errors.purchaseCapacity}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                className="px-8 h-11" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {t('profile.saveChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
