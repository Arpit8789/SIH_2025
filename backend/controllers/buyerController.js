// controllers/buyerController.js
import User from '../models/User.js';
import Buyer from '../models/Buyer.js';
import Farmer from '../models/Farmer.js';
import Crop from '../models/Crop.js';
import MarketPrice from '../models/MarketPrice.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { Validators } from '../utils/validators.js';
import { Helpers } from '../utils/helpers.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';

// Get buyer profile with complete information
export const getBuyerProfile = catchAsync(async (req, res, next) => {
  const buyer = await Buyer.findById(req.user._id)
    .select('-password')
    .lean();

  if (!buyer) {
    throw new NotFoundError('Buyer profile not found');
  }

  // Calculate additional statistics
  const totalPurchases = buyer.purchaseHistory?.length || 0;
  const totalSpent = buyer.purchaseHistory?.reduce((sum, purchase) => 
    sum + (purchase.totalAmount || 0), 0) || 0;
  const avgPurchaseValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

  const enrichedProfile = {
    ...buyer,
    statistics: {
      totalPurchases,
      totalSpent: Math.round(totalSpent * 100) / 100,
      avgPurchaseValue: Math.round(avgPurchaseValue * 100) / 100,
      accountAge: Math.floor((new Date() - new Date(buyer.createdAt)) / (1000 * 60 * 60 * 24)),
      activePurchases: buyer.purchaseHistory?.filter(p => p.status === 'pending').length || 0
    }
  };

  ResponseHandler.success(res, enrichedProfile, 'Buyer profile retrieved successfully');
});

// Update buyer profile
export const updateBuyerProfile = catchAsync(async (req, res, next) => {
  const {
    name,
    phone,
    companyName,
    businessType,
    address,
    interestedCrops
  } = req.body;

  // Validate required fields
  const validation = Validators.validateFields(req.body, {
    name: { type: 'name', fieldName: 'Name' },
    phone: { type: 'phone' }
  });

  if (!validation.isValid) {
    throw new ValidationError('Profile validation failed', validation.errors);
  }

  // Validate business type
  const validBusinessTypes = ['retailer', 'wholesaler', 'processor', 'exporter'];
  if (businessType && !validBusinessTypes.includes(businessType)) {
    throw new ValidationError('Invalid business type', [
      { field: 'businessType', message: 'Business type must be one of: ' + validBusinessTypes.join(', ') }
    ]);
  }

  // Validate pincode if provided
  if (address?.pincode) {
    const pincodeValidation = Validators.validatePincode(address.pincode);
    if (!pincodeValidation.isValid) {
      throw new ValidationError('Invalid pincode', [
        { field: 'pincode', message: pincodeValidation.message }
      ]);
    }
  }

  // Prepare update data
  const updateData = {
    name: name?.trim(),
    phone: phone?.trim(),
    companyName: companyName?.trim(),
    businessType
  };

  // Handle address
  if (address) {
    updateData.address = {
      street: address.street?.trim(),
      city: address.city?.trim(),
      state: address.state?.trim(),
      pincode: address.pincode?.trim()
    };
  }

  // Handle interested crops
  if (interestedCrops && Array.isArray(interestedCrops)) {
    updateData.interestedCrops = interestedCrops.map(crop => crop.trim()).filter(Boolean);
  }

  // Handle profile image upload
  if (req.uploadedFile) {
    updateData.profileImage = `/uploads/profiles/${req.uploadedFile.filename}`;
  }

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const updatedBuyer = await Buyer.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  ResponseHandler.success(res, updatedBuyer, 'Profile updated successfully');
});

// Search farmers based on location, crops, and other criteria
export const searchFarmers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    state,
    district,
    cropName,
    minLandSize,
    maxLandSize,
    soilType,
    farmingType,
    sortBy = 'farmingExperience',
    order = 'desc'
  } = req.query;

  // Build search filter
  const filter = {
    isActive: true,
    isVerified: true
  };

  // Location filters
  if (state) {
    filter['farmLocation.state'] = new RegExp(state, 'i');
  }
  if (district) {
    filter['farmLocation.district'] = new RegExp(district, 'i');
  }

  // Crop filter
  if (cropName) {
    filter.currentCrops = { $in: [new RegExp(cropName, 'i')] };
  }

  // Land size filters
  if (minLandSize || maxLandSize) {
    filter.landSize = {};
    if (minLandSize) filter.landSize.$gte = parseFloat(minLandSize);
    if (maxLandSize) filter.landSize.$lte = parseFloat(maxLandSize);
  }

  // Soil type filter
  if (soilType) {
    filter.soilType = soilType;
  }

  // Farming type filter
  if (farmingType) {
    filter.farmingType = farmingType;
  }

  const pagination = Helpers.paginate(page, limit);
  
  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  // Execute search
  const [farmers, totalFarmers] = await Promise.all([
    Farmer.find(filter)
      .select('-password -governmentSchemes')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Farmer.countDocuments(filter)
  ]);

  // Enrich farmer data with additional information
  const enrichedFarmers = await Promise.all(
    farmers.map(async (farmer) => {
      // Get current market prices for farmer's crops
      const cropPrices = await MarketPrice.find({
        cropName: { $in: farmer.currentCrops || [] },
        'market.state': farmer.farmLocation?.state,
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ date: -1 })
      .limit(farmer.currentCrops?.length || 0)
      .lean();

      return {
        ...farmer,
        distance: calculateDistance(farmer, req.user), // If buyer has location
        currentCropPrices: cropPrices.map(price => ({
          cropName: price.cropName,
          averagePrice: price.priceData.average,
          lastUpdated: price.date
        })),
        contactInfo: {
          // Only show limited contact info for privacy
          phone: farmer.phone ? farmer.phone.substring(0, 6) + 'XXXX' : null,
          email: farmer.email ? farmer.email.substring(0, 3) + '***@***.com' : null
        }
      };
    })
  );

  ResponseHandler.paginated(
    res,
    enrichedFarmers,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: totalFarmers
    },
    'Farmers search results retrieved successfully'
  );
});

// Helper function to calculate distance between buyer and farmer
const calculateDistance = (farmer, buyer) => {
  if (!farmer.farmLocation?.coordinates || !buyer.address) {
    return null;
  }
  
  // This would use actual coordinates if available
  // For now, return a placeholder or use Helpers.calculateDistance
  return null;
};

// Get available crops from all farmers
export const getAvailableCrops = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    state, 
    season, 
    priceRange,
    sortBy = 'averagePrice',
    order = 'asc'
  } = req.query;

  // Build aggregation pipeline
  const pipeline = [
    // Match active verified farmers
    {
      $match: {
        isActive: true,
        isVerified: true,
        currentCrops: { $exists: true, $ne: [] }
      }
    },
    // Filter by state if provided
    ...(state ? [{
      $match: { 'farmLocation.state': new RegExp(state, 'i') }
    }] : []),
    // Unwind current crops
    { $unwind: '$currentCrops' },
    // Group by crop to get farmer count and aggregate data
    {
      $group: {
        _id: '$currentCrops',
        farmerCount: { $sum: 1 },
        totalLandSize: { $sum: '$landSize' },
        avgLandSize: { $avg: '$landSize' },
        states: { $addToSet: '$farmLocation.state' },
        districts: { $addToSet: '$farmLocation.district' },
        soilTypes: { $addToSet: '$soilType' },
        farmingTypes: { $addToSet: '$farmingType' },
        farmers: { 
          $push: { 
            id: '$_id',
            name: '$name',
            location: '$farmLocation',
            landSize: '$landSize',
            experience: '$farmingExperience'
          }
        }
      }
    },
    // Lookup crop details
    {
      $lookup: {
        from: 'crops',
        localField: '_id',
        foreignField: 'name',
        as: 'cropDetails'
      }
    },
    // Add crop details
    {
      $addFields: {
        cropInfo: { $arrayElemAt: ['$cropDetails', 0] },
        cropName: '$_id'
      }
    },
    // Filter by category if provided
    ...(category ? [{
      $match: { 'cropInfo.category': category }
    }] : []),
    // Filter by season if provided
    ...(season ? [{
      $match: { 'cropInfo.season': season }
    }] : [])
  ];

  // Execute aggregation
  const availableCrops = await Farmer.aggregate(pipeline);

  // Get market prices for these crops
  const cropNames = availableCrops.map(crop => crop.cropName);
  const recentPrices = await MarketPrice.find({
    cropName: { $in: cropNames },
    date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  }).sort({ date: -1 });

  // Create price map
  const priceMap = {};
  recentPrices.forEach(price => {
    if (!priceMap[price.cropName]) {
      priceMap[price.cropName] = {
        averagePrice: price.priceData.average,
        priceRange: {
          min: price.priceData.minimum,
          max: price.priceData.maximum
        },
        trend: price.trend || 'stable',
        lastUpdated: price.date
      };
    }
  });

  // Enrich crop data with pricing
  let enrichedCrops = availableCrops.map(crop => ({
    cropName: crop.cropName,
    category: crop.cropInfo?.category || 'Unknown',
    season: crop.cropInfo?.season || 'Unknown',
    farmerCount: crop.farmerCount,
    totalAvailableLand: Math.round(crop.totalLandSize * 100) / 100,
    averageLandPerFarmer: Math.round(crop.avgLandSize * 100) / 100,
    availableStates: crop.states.filter(Boolean),
    availableDistricts: crop.districts.filter(Boolean),
    soilTypes: crop.soilTypes.filter(Boolean),
    farmingTypes: crop.farmingTypes.filter(Boolean),
    marketData: priceMap[crop.cropName] || null,
    growthDuration: crop.cropInfo?.growthDuration || null,
    nutritionalValue: crop.cropInfo?.nutritionalValue || null,
    topFarmers: crop.farmers.slice(0, 5) // Top 5 farmers for this crop
  }));

  // Filter by price range if provided
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
    enrichedCrops = enrichedCrops.filter(crop => {
      if (!crop.marketData) return true;
      const price = crop.marketData.averagePrice;
      return price >= minPrice && price <= maxPrice;
    });
  }

  // Sort crops
  enrichedCrops.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'averagePrice':
        aValue = a.marketData?.averagePrice || 0;
        bValue = b.marketData?.averagePrice || 0;
        break;
      case 'farmerCount':
        aValue = a.farmerCount;
        bValue = b.farmerCount;
        break;
      case 'totalAvailableLand':
        aValue = a.totalAvailableLand;
        bValue = b.totalAvailableLand;
        break;
      default:
        aValue = a.cropName;
        bValue = b.cropName;
    }
    
    if (order === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  // Apply pagination
  const pagination = Helpers.paginate(page, limit);
  const paginatedCrops = enrichedCrops.slice(pagination.skip, pagination.skip + pagination.limit);

  ResponseHandler.paginated(
    res,
    paginatedCrops,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: enrichedCrops.length
    },
    'Available crops retrieved successfully'
  );
});

// Create purchase order
export const createPurchaseOrder = catchAsync(async (req, res, next) => {
  const {
    farmerId,
    cropName,
    quantity,
    pricePerUnit,
    deliveryDate,
    deliveryAddress,
    notes
  } = req.body;

  // Validate required fields
  if (!farmerId || !cropName || !quantity || !pricePerUnit) {
    throw new ValidationError('Missing required fields', [
      { field: 'farmerId', message: 'Farmer ID is required' },
      { field: 'cropName', message: 'Crop name is required' },
      { field: 'quantity', message: 'Quantity is required' },
      { field: 'pricePerUnit', message: 'Price per unit is required' }
    ]);
  }

  // Validate farmer exists and has the requested crop
  const farmer = await Farmer.findById(farmerId);
  if (!farmer) {
    throw new NotFoundError('Farmer not found');
  }

  if (!farmer.currentCrops || !farmer.currentCrops.includes(cropName)) {
    throw new ValidationError('Farmer does not grow this crop', [
      { field: 'cropName', message: `Farmer does not grow ${cropName}` }
    ]);
  }

  // Validate numeric values
  const parsedQuantity = parseFloat(quantity);
  const parsedPricePerUnit = parseFloat(pricePerUnit);

  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    throw new ValidationError('Invalid quantity', [
      { field: 'quantity', message: 'Quantity must be a positive number' }
    ]);
  }

  if (isNaN(parsedPricePerUnit) || parsedPricePerUnit <= 0) {
    throw new ValidationError('Invalid price', [
      { field: 'pricePerUnit', message: 'Price per unit must be a positive number' }
    ]);
  }

  // Validate delivery date
  if (deliveryDate) {
    const parsedDeliveryDate = new Date(deliveryDate);
    if (isNaN(parsedDeliveryDate.getTime()) || parsedDeliveryDate <= new Date()) {
      throw new ValidationError('Invalid delivery date', [
        { field: 'deliveryDate', message: 'Delivery date must be in the future' }
      ]);
    }
  }

  // Calculate total amount
  const totalAmount = parsedQuantity * parsedPricePerUnit;

  // Create purchase order record
  const purchaseOrder = {
    farmerId,
    cropName: cropName.trim(),
    quantity: parsedQuantity,
    pricePerUnit: parsedPricePerUnit,
    totalAmount: Math.round(totalAmount * 100) / 100,
    purchaseDate: new Date(),
    status: 'pending',
    deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
    deliveryAddress: deliveryAddress?.trim(),
    notes: notes?.trim()
  };

  // Add to buyer's purchase history
  const updatedBuyer = await Buyer.findByIdAndUpdate(
    req.user._id,
    { $push: { purchaseHistory: purchaseOrder } },
    { new: true }
  ).select('purchaseHistory');

  // Get the newly created purchase order
  const newPurchaseOrder = updatedBuyer.purchaseHistory[updatedBuyer.purchaseHistory.length - 1];

  // Update buyer's credit rating based on purchase history
  const totalPurchases = updatedBuyer.purchaseHistory.length;
  const totalValue = updatedBuyer.purchaseHistory.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  
  let newCreditRating = 3; // Default
  if (totalPurchases >= 10 && totalValue >= 50000) {
    newCreditRating = 5;
  } else if (totalPurchases >= 5 && totalValue >= 20000) {
    newCreditRating = 4;
  } else if (totalPurchases >= 2 && totalValue >= 5000) {
    newCreditRating = 3;
  }

  await Buyer.findByIdAndUpdate(req.user._id, { creditRating: newCreditRating });

  // Populate farmer details for response
  const populatedOrder = await Buyer.populate(newPurchaseOrder, {
    path: 'farmerId',
    select: 'name farmLocation phone email'
  });

  ResponseHandler.created(res, {
    ...populatedOrder.toObject(),
    orderNumber: `PO-${Date.now()}-${newPurchaseOrder._id.toString().slice(-4).toUpperCase()}`
  }, 'Purchase order created successfully');
});

// Get purchase history
export const getPurchaseHistory = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    cropName,
    fromDate,
    toDate,
    sortBy = 'purchaseDate',
    order = 'desc'
  } = req.query;

  const buyer = await Buyer.findById(req.user._id);
  if (!buyer) {
    throw new NotFoundError('Buyer profile not found');
  }

  let purchaseHistory = buyer.purchaseHistory || [];

  // Apply filters
  if (status) {
    purchaseHistory = purchaseHistory.filter(purchase => purchase.status === status);
  }

  if (cropName) {
    purchaseHistory = purchaseHistory.filter(purchase => 
      purchase.cropName.toLowerCase().includes(cropName.toLowerCase())
    );
  }

  if (fromDate) {
    const from = new Date(fromDate);
    purchaseHistory = purchaseHistory.filter(purchase => 
      new Date(purchase.purchaseDate) >= from
    );
  }

  if (toDate) {
    const to = new Date(toDate);
    purchaseHistory = purchaseHistory.filter(purchase => 
      new Date(purchase.purchaseDate) <= to
    );
  }

  // Sort
  purchaseHistory.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'purchaseDate':
        aValue = new Date(a.purchaseDate);
        bValue = new Date(b.purchaseDate);
        break;
      case 'totalAmount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        aValue = a.cropName;
        bValue = b.cropName;
    }
    
    if (order === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  // Pagination
  const pagination = Helpers.paginate(page, limit);
  const paginatedHistory = purchaseHistory.slice(
    pagination.skip, 
    pagination.skip + pagination.limit
  );

  // Populate farmer details
  const populatedHistory = await Promise.all(
    paginatedHistory.map(async (purchase) => {
      const farmer = await Farmer.findById(purchase.farmerId)
        .select('name farmLocation phone email')
        .lean();
      
      return {
        ...purchase.toObject(),
        farmer,
        orderNumber: `PO-${new Date(purchase.purchaseDate).getTime()}-${purchase._id.toString().slice(-4).toUpperCase()}`
      };
    })
  );

  // Calculate summary statistics
  const summary = {
    totalOrders: purchaseHistory.length,
    totalSpent: Math.round(purchaseHistory.reduce((sum, p) => sum + p.totalAmount, 0) * 100) / 100,
    avgOrderValue: purchaseHistory.length > 0 ? 
      Math.round((purchaseHistory.reduce((sum, p) => sum + p.totalAmount, 0) / purchaseHistory.length) * 100) / 100 : 0,
    statusBreakdown: {
      pending: purchaseHistory.filter(p => p.status === 'pending').length,
      completed: purchaseHistory.filter(p => p.status === 'completed').length,
      cancelled: purchaseHistory.filter(p => p.status === 'cancelled').length
    }
  };

  ResponseHandler.paginated(
    res,
    { purchases: populatedHistory, summary },
    {
      page: pagination.page,
      limit: pagination.limit,
      total: purchaseHistory.length
    },
    'Purchase history retrieved successfully'
  );
});

// Get market trends and analysis
export const getMarketTrends = catchAsync(async (req, res, next) => {
  const { cropName, state, timeRange = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Build aggregation pipeline
  const matchStage = {
    date: { $gte: startDate }
  };

  if (cropName) {
    matchStage.cropName = new RegExp(cropName, 'i');
  }

  if (state) {
    matchStage['market.state'] = new RegExp(state, 'i');
  }

  const marketTrends = await MarketPrice.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          cropName: '$cropName',
          date: {
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$date' 
            }
          }
        },
        avgPrice: { $avg: '$priceData.average' },
        minPrice: { $min: '$priceData.minimum' },
        maxPrice: { $max: '$priceData.maximum' },
        marketCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.cropName',
        priceHistory: {
          $push: {
            date: '$_id.date',
            avgPrice: '$avgPrice',
            minPrice: '$minPrice',
            maxPrice: '$maxPrice',
            marketCount: '$marketCount'
          }
        },
        overallAvgPrice: { $avg: '$avgPrice' },
        overallMinPrice: { $min: '$minPrice' },
        overallMaxPrice: { $max: '$maxPrice' }
      }
    },
    {
      $addFields: {
        cropName: '$_id',
        trend: {
          $let: {
            vars: {
              sortedPrices: {
                $sortArray: {
                  input: '$priceHistory',
                  sortBy: { date: 1 }
                }
              }
            },
            in: {
              $cond: {
                if: { $gte: [{ $size: '$$sortedPrices' }, 2] },
                then: {
                  $let: {
                    vars: {
                      firstPrice: { $arrayElemAt: ['$$sortedPrices.avgPrice', 0] },
                      lastPrice: { $arrayElemAt: ['$$sortedPrices.avgPrice', -1] }
                    },
                    in: {
                      $cond: {
                        if: { $gt: ['$$lastPrice', { $multiply: ['$$firstPrice', 1.05] }] },
                        then: 'rising',
                        else: {
                          $cond: {
                            if: { $lt: ['$$lastPrice', { $multiply: ['$$firstPrice', 0.95] }] },
                            then: 'falling',
                            else: 'stable'
                          }
                        }
                      }
                    }
                  }
                },
                else: 'stable'
              }
            }
          }
        }
      }
    },
    { $sort: { overallAvgPrice: -1 } }
  ]);

  // Get top performing crops by volume and price
  const topCropsByVolume = await Farmer.aggregate([
    { $match: { isActive: true, currentCrops: { $exists: true, $ne: [] } } },
    { $unwind: '$currentCrops' },
    {
      $group: {
        _id: '$currentCrops',
        totalFarmers: { $sum: 1 },
        totalLandSize: { $sum: '$landSize' }
      }
    },
    { $sort: { totalLandSize: -1 } },
    { $limit: 10 }
  ]);

  const responseData = {
    timeRange,
    marketTrends: marketTrends.map(trend => ({
      ...trend,
      priceHistory: trend.priceHistory.sort((a, b) => new Date(a.date) - new Date(b.date))
    })),
    topCropsByVolume: topCropsByVolume.map(crop => ({
      cropName: crop._id,
      totalFarmers: crop.totalFarmers,
      totalLandSize: Math.round(crop.totalLandSize * 100) / 100
    })),
    analysisDate: new Date().toISOString()
  };

  ResponseHandler.success(res, responseData, 'Market trends retrieved successfully');
});
