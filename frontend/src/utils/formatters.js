// src/utils/formatters.js
// Data formatters specifically for backend API responses
import { dateHelpers, numberHelpers, stringHelpers } from './helpers';

export const formatters = {
  // Format user data from backend
  formatUser: (userData) => {
    if (!userData) return null;
    
    return {
      ...userData,
      name: stringHelpers.capitalize(userData.name || ''),
      phone: stringHelpers.formatPhone(userData.phone || ''),
      initials: stringHelpers.getInitials(userData.name || ''),
      registeredAt: dateHelpers.formatDate(userData.createdAt),
      isRecent: dateHelpers.isRecent(userData.createdAt),
    };
  },

  // Format farmer profile from backend
  formatFarmerProfile: (farmerData) => {
    if (!farmerData) return null;
    
    return {
      ...farmerData,
      landSizeDisplay: numberHelpers.formatLandSize(farmerData.landSize),
      experienceDisplay: `${farmerData.farmingExperience || 0} years`,
      locationDisplay: [
        farmerData.farmLocation?.village,
        farmerData.farmLocation?.district,
        farmerData.farmLocation?.state
      ].filter(Boolean).join(', '),
      cropsCount: farmerData.currentCrops?.length || 0,
      schemesCount: farmerData.governmentSchemes?.length || 0,
    };
  },

  // Format crop data from backend
  formatCrop: (cropData) => {
    if (!cropData) return null;
    
    return {
      ...cropData,
      categoryDisplay: stringHelpers.snakeToTitle(cropData.category || ''),
      seasonDisplay: stringHelpers.capitalize(cropData.season || ''),
      durationDisplay: `${cropData.growthDuration || 0} days`,
      marketPriceDisplay: cropData.currentMarketData ? 
        numberHelpers.formatCurrency(cropData.currentMarketData.averagePrice) : 'N/A',
    };
  },

  // Format market price data from backend
  formatMarketPrice: (priceData) => {
    if (!priceData) return null;
    
    const trend = priceData.trend || 'stable';
    const changePercent = priceData.changePercent || 0;
    
    return {
      ...priceData,
      averagePriceDisplay: numberHelpers.formatCurrency(priceData.priceData?.average || 0),
      minimumPriceDisplay: numberHelpers.formatCurrency(priceData.priceData?.minimum || 0),
      maximumPriceDisplay: numberHelpers.formatCurrency(priceData.priceData?.maximum || 0),
      trendDisplay: stringHelpers.capitalize(trend),
      changeDisplay: `${changePercent > 0 ? '+' : ''}${numberHelpers.formatPercentage(changePercent)}`,
      trendIcon: trend === 'rising' ? '📈' : trend === 'falling' ? '📉' : '➖',
      dateDisplay: dateHelpers.formatDate(priceData.date),
      isRecent: dateHelpers.isRecent(priceData.date),
    };
  },

  // Format weather data from backend
  formatWeatherData: (weatherData) => {
    if (!weatherData) return null;
    
    return {
      ...weatherData,
      temperatureDisplay: `${Math.round(weatherData.current?.temperature || 0)}°C`,
      humidityDisplay: `${weatherData.current?.humidity || 0}%`,
      windSpeedDisplay: `${weatherData.current?.windSpeed || 0} km/h`,
      conditionDisplay: stringHelpers.capitalize(weatherData.current?.condition?.description || ''),
      locationDisplay: weatherData.location?.name || 'Unknown Location',
      lastUpdatedDisplay: dateHelpers.formatRelativeTime(weatherData.lastUpdated),
    };
  },

  // Format weather alert from backend
  formatWeatherAlert: (alertData) => {
    if (!alertData) return null;
    
    return {
      ...alertData,
      severityDisplay: stringHelpers.capitalize(alertData.severity || ''),
      typeDisplay: stringHelpers.snakeToTitle(alertData.alertType || ''),
      validFromDisplay: dateHelpers.formatDateTime(alertData.validFrom),
      validUntilDisplay: dateHelpers.formatDateTime(alertData.validUntil),
      isActive: new Date(alertData.validUntil) > new Date(),
      timeRemaining: dateHelpers.formatRelativeTime(alertData.validUntil),
    };
  },

  // Format government scheme from backend
  formatGovernmentScheme: (schemeData) => {
    if (!schemeData) return null;
    
    return {
      ...schemeData,
      benefitDisplay: schemeData.benefits?.monetaryBenefit ? 
        numberHelpers.formatCurrency(schemeData.benefits.monetaryBenefit) : 'Non-monetary',
      categoryDisplay: stringHelpers.snakeToTitle(schemeData.category || ''),
      eligibilityDisplay: [
        schemeData.eligibility?.farmerType && `${schemeData.eligibility.farmerType} farmers`,
        schemeData.eligibility?.landSize && `${schemeData.eligibility.landSize.min}-${schemeData.eligibility.landSize.max} acres`,
        schemeData.eligibility?.states?.length && `Available in ${schemeData.eligibility.states.length} states`
      ].filter(Boolean).join(' • '),
      popularityDisplay: `${schemeData.popularity?.rating || 0}/5 stars`,
      deadlineDisplay: schemeData.timeline?.deadline ? 
        dateHelpers.formatDate(schemeData.timeline.deadline) : 'No deadline',
      isOngoing: schemeData.timeline?.isOngoing || false,
    };
  },

  // Format purchase order from backend
  formatPurchaseOrder: (orderData) => {
    if (!orderData) return null;
    
    return {
      ...orderData,
      totalAmountDisplay: numberHelpers.formatCurrency(orderData.totalAmount || 0),
      pricePerUnitDisplay: numberHelpers.formatCurrency(orderData.pricePerUnit || 0),
      quantityDisplay: `${numberHelpers.formatNumber(orderData.quantity || 0)} ${orderData.unit || 'units'}`,
      statusDisplay: stringHelpers.capitalize(orderData.status || ''),
      purchaseDateDisplay: dateHelpers.formatDate(orderData.purchaseDate),
      deliveryDateDisplay: orderData.deliveryDate ? 
        dateHelpers.formatDate(orderData.deliveryDate) : 'Not specified',
      orderAge: dateHelpers.formatRelativeTime(orderData.purchaseDate),
    };
  },

  // Format disease detection result from backend
  formatDiseaseDetection: (detectionData) => {
    if (!detectionData) return null;
    
    return {
      ...detectionData,
      diseaseNameDisplay: stringHelpers.capitalize(detectionData.detectionResults?.diseaseName || 'Unknown'),
      confidenceDisplay: numberHelpers.formatPercentage(detectionData.detectionResults?.confidence || 0),
      severityDisplay: stringHelpers.capitalize(detectionData.detectionResults?.severity || 'unknown'),
      statusDisplay: stringHelpers.capitalize(detectionData.status || ''),
      detectionDateDisplay: dateHelpers.formatDate(detectionData.detectionDate),
      cropNameDisplay: stringHelpers.capitalize(detectionData.cropName || ''),
      isRecent: dateHelpers.isRecent(detectionData.detectionDate),
      needsAttention: detectionData.followUpRequired || false,
    };
  },

  // Format feedback from backend
  formatFeedback: (feedbackData) => {
    if (!feedbackData) return null;
    
    return {
      ...feedbackData,
      ratingDisplay: `${'⭐'.repeat(feedbackData.rating || 0)} (${feedbackData.rating || 0}/5)`,
      categoryDisplay: stringHelpers.snakeToTitle(feedbackData.category || ''),
      statusDisplay: stringHelpers.capitalize(feedbackData.status || ''),
      submissionDateDisplay: dateHelpers.formatDate(feedbackData.createdAt),
      responseDisplay: feedbackData.adminResponse ? {
        message: feedbackData.adminResponse.message,
        respondedBy: feedbackData.adminResponse.respondedBy?.name || 'Admin',
        respondedAt: dateHelpers.formatDate(feedbackData.adminResponse.respondedAt),
      } : null,
      isAnswered: !!feedbackData.adminResponse,
    };
  },

  // Format pagination data from backend
  formatPagination: (paginationData) => {
    if (!paginationData) return null;
    
    const { page, limit, total } = paginationData;
    const totalPages = Math.ceil(total / limit);
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);
    
    return {
      ...paginationData,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      startItem,
      endItem,
      displayText: `${startItem}-${endItem} of ${numberHelpers.formatNumber(total)} items`,
    };
  },

  // Format analytics data from backend
  formatAnalytics: (analyticsData) => {
    if (!analyticsData) return null;
    
    return {
      ...analyticsData,
      formattedMetrics: Object.entries(analyticsData.metrics || {}).map(([key, value]) => ({
        key,
        label: stringHelpers.snakeToTitle(key),
        value: typeof value === 'number' ? numberHelpers.formatNumber(value) : value,
        displayValue: typeof value === 'number' && value > 1000 ? 
          numberHelpers.formatNumber(value) : value,
      })),
      periodDisplay: analyticsData.timeRange ? 
        `Last ${analyticsData.timeRange.replace('d', ' days').replace('m', ' months')}` : 'All time',
      lastUpdatedDisplay: dateHelpers.formatRelativeTime(analyticsData.lastUpdated),
    };
  },
};

export default formatters;
