// controllers/schemeController.js - ❌ MISSING
import GovernmentScheme from '../models/GovernmentScheme.js';
import Farmer from '../models/Farmer.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { Helpers } from '../utils/helpers.js';
import { NotFoundError } from '../utils/errorHandler.js';

// Get all government schemes
export const getAllSchemes = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    category,
    state,
    isActive = true,
    sortBy = 'popularity.rating',
    order = 'desc'
  } = req.query;

  const filter = { isActive };
  if (category) filter.category = category;
  if (state) filter['eligibility.states'] = { $in: [state] };

  const pagination = Helpers.paginate(page, limit);
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  const [schemes, totalSchemes, categories] = await Promise.all([
    GovernmentScheme.find(filter)
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    GovernmentScheme.countDocuments(filter),
    GovernmentScheme.distinct('category', { isActive: true })
  ]);

  const responseData = {
    schemes,
    filters: {
      availableCategories: categories,
      appliedFilters: { category, state, isActive }
    }
  };

  ResponseHandler.paginated(
    res,
    responseData,
    { page: pagination.page, limit: pagination.limit, total: totalSchemes },
    'Government schemes retrieved successfully'
  );
});

// Get scheme by ID
export const getSchemeById = catchAsync(async (req, res, next) => {
  const { schemeId } = req.params;

  const scheme = await GovernmentScheme.findById(schemeId).lean();
  
  if (!scheme) {
    throw new NotFoundError('Government scheme not found');
  }

  // Check eligibility if user is authenticated farmer
  let eligibilityStatus = null;
  if (req.user && req.user.role === 'farmer') {
    const farmer = await Farmer.findById(req.user._id);
    eligibilityStatus = checkSchemeEligibility(scheme, farmer);
  }

  const enrichedScheme = {
    ...scheme,
    eligibilityStatus,
    isEligible: eligibilityStatus?.eligible || null
  };

  ResponseHandler.success(res, enrichedScheme, 'Scheme details retrieved successfully');
});

// Get schemes by category
export const getSchemesByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const pagination = Helpers.paginate(page, limit);

  const [schemes, totalSchemes] = await Promise.all([
    GovernmentScheme.find({ 
      category, 
      isActive: true 
    })
      .sort({ 'popularity.rating': -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    GovernmentScheme.countDocuments({ category, isActive: true })
  ]);

  ResponseHandler.paginated(
    res,
    schemes,
    { page: pagination.page, limit: pagination.limit, total: totalSchemes },
    `Schemes in category '${category}' retrieved successfully`
  );
});

// Search schemes
export const searchSchemes = catchAsync(async (req, res, next) => {
  const {
    q: searchTerm,
    page = 1,
    limit = 20,
    category,
    state
  } = req.query;

  if (!searchTerm) {
    return ResponseHandler.validationError(res,
      [{ field: 'q', message: 'Search term is required' }]
    );
  }

  const searchQuery = {
    isActive: true,
    $or: [
      { schemeName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'benefits.nonMonetaryBenefits': { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  if (category) searchQuery.category = category;
  if (state) searchQuery['eligibility.states'] = { $in: [state] };

  const pagination = Helpers.paginate(page, limit);

  const [schemes, totalSchemes] = await Promise.all([
    GovernmentScheme.find(searchQuery)
      .sort({ 'popularity.rating': -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    GovernmentScheme.countDocuments(searchQuery)
  ]);

  ResponseHandler.paginated(
    res,
    schemes,
    { page: pagination.page, limit: pagination.limit, total: totalSchemes },
    `Search results for '${searchTerm}' retrieved successfully`
  );
});

// Get eligible schemes for current farmer
export const getEligibleSchemes = catchAsync(async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id);
  const { page = 1, limit = 20, category } = req.query;

  if (!farmer) {
    throw new NotFoundError('Farmer profile not found');
  }

  // Build eligibility filter
  const filter = {
    isActive: true,
    'timeline.isOngoing': true
  };

  if (category) filter.category = category;

  const pagination = Helpers.paginate(page, limit);

  const allSchemes = await GovernmentScheme.find(filter).lean();
  
  // Filter schemes based on farmer eligibility
  const eligibleSchemes = allSchemes.filter(scheme => {
    const eligibility = checkSchemeEligibility(scheme, farmer);
    return eligibility.eligible;
  });

  // Apply pagination to eligible schemes
  const paginatedSchemes = eligibleSchemes.slice(
    pagination.skip,
    pagination.skip + pagination.limit
  );

  // Add application status
  const schemesWithStatus = paginatedSchemes.map(scheme => ({
    ...scheme,
    hasApplied: farmer.governmentSchemes?.some(
      applied => applied.schemeId === scheme.schemeCode
    ),
    applicationStatus: farmer.governmentSchemes?.find(
      applied => applied.schemeId === scheme.schemeCode
    )?.status || null
  }));

  ResponseHandler.paginated(
    res,
    schemesWithStatus,
    { page: pagination.page, limit: pagination.limit, total: eligibleSchemes.length },
    'Eligible schemes retrieved successfully'
  );
});

// Get scheme application history
export const getApplicationHistory = catchAsync(async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id);
  
  if (!farmer || !farmer.governmentSchemes) {
    return ResponseHandler.success(res, [], 'No applications found');
  }

  const applications = farmer.governmentSchemes.map(app => ({
    ...app.toObject(),
    appliedDaysAgo: Math.floor((new Date() - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24))
  }));

  ResponseHandler.success(res, applications, 'Application history retrieved successfully');
});

// Get detailed scheme information
export const getSchemeDetails = catchAsync(async (req, res, next) => {
  const { schemeId } = req.params;

  const scheme = await GovernmentScheme.findById(schemeId).lean();
  
  if (!scheme) {
    throw new NotFoundError('Government scheme not found');
  }

  // Get related schemes (same category)
  const relatedSchemes = await GovernmentScheme.find({
    category: scheme.category,
    _id: { $ne: scheme._id },
    isActive: true
  })
    .limit(5)
    .select('schemeName category benefits.monetaryBenefit')
    .lean();

  ResponseHandler.success(res, {
    ...scheme,
    relatedSchemes
  }, 'Detailed scheme information retrieved successfully');
});

// Helper function to check scheme eligibility
const checkSchemeEligibility = (scheme, farmer) => {
  const eligibility = { eligible: true, reasons: [] };

  // Check land size eligibility
  if (scheme.eligibility.landSize) {
    const { min, max } = scheme.eligibility.landSize;
    if (min && farmer.landSize < min) {
      eligibility.eligible = false;
      eligibility.reasons.push(`Requires minimum ${min} acres of land`);
    }
    if (max && farmer.landSize > max) {
      eligibility.eligible = false;
      eligibility.reasons.push(`Requires maximum ${max} acres of land`);
    }
  }

  // Check state eligibility
  if (scheme.eligibility.states?.length > 0 && 
      !scheme.eligibility.states.includes(farmer.farmLocation?.state)) {
    eligibility.eligible = false;
    eligibility.reasons.push('Not available in your state');
  }

  // Check farmer type
  if (scheme.eligibility.farmerType && scheme.eligibility.farmerType !== 'all') {
    const farmerType = farmer.landSize <= 2 ? 'small' : 
                      farmer.landSize <= 4 ? 'marginal' : 
                      farmer.landSize <= 10 ? 'medium' : 'large';
    
    if (scheme.eligibility.farmerType !== farmerType) {
      eligibility.eligible = false;
      eligibility.reasons.push(`Only for ${scheme.eligibility.farmerType} farmers`);
    }
  }

  return eligibility;
};
