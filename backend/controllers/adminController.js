// controllers/adminController.js
import User from '../models/User.js';
import Farmer from '../models/Farmer.js';
import Buyer from '../models/Buyer.js';
import Feedback from '../models/Feedback.js';
import DiseaseDetection from '../models/DiseaseDetection.js';
import MarketPrice from '../models/MarketPrice.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { Helpers } from '../utils/helpers.js';

// Dashboard statistics with MongoDB aggregation
export const getDashboardStats = catchAsync(async (req, res, next) => {
  // Get date ranges
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Parallel aggregation queries for performance
  const [
    totalUsers,
    usersByRole,
    usersByState,
    recentRegistrations,
    feedbackStats,
    diseaseDetectionStats,
    marketPriceStats
  ] = await Promise.all([
    // Total users count
    User.countDocuments({ isActive: true }),

    // Users grouped by role
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // Farmers grouped by state for heat map data
    Farmer.aggregate([
      { $match: { isActive: true, 'farmLocation.state': { $exists: true } } },
      { 
        $group: { 
          _id: '$farmLocation.state', 
          count: { $sum: 1 },
          totalLandSize: { $sum: '$landSize' },
          avgLandSize: { $avg: '$landSize' }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]),

    // Recent registrations (last 30 days by day)
    User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: lastMonth },
          isActive: true 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),

    // Feedback statistics
    Feedback.aggregate([
      {
        $facet: {
          totalFeedback: [{ $count: 'count' }],
          averageRating: [
            { $match: { rating: { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
          ],
          feedbackByCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          recentFeedback: [
            { $match: { createdAt: { $gte: lastWeek } } },
            { $count: 'count' }
          ]
        }
      }
    ]),

    // Disease detection statistics
    DiseaseDetection.aggregate([
      {
        $facet: {
          totalDetections: [{ $count: 'count' }],
          detectionsByMonth: [
            { 
              $match: { 
                createdAt: { $gte: lastMonth } 
              } 
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            }
          ],
          topDiseases: [
            { $match: { 'detectionResults.diseaseName': { $exists: true } } },
            { 
              $group: { 
                _id: '$detectionResults.diseaseName', 
                count: { $sum: 1 },
                avgConfidence: { $avg: '$detectionResults.confidence' }
              } 
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]),

    // Market price trends
    MarketPrice.aggregate([
      {
        $facet: {
          recentPrices: [
            { $match: { date: { $gte: lastWeek } } },
            { $count: 'count' }
          ],
          pricesByState: [
            { 
              $group: { 
                _id: '$market.state', 
                avgPrice: { $avg: '$priceData.average' },
                count: { $sum: 1 }
              } 
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ])
  ]);

  // Format data for response
  const dashboardData = {
    overview: {
      totalUsers,
      totalFarmers: usersByRole.find(u => u._id === 'farmer')?.count || 0,
      totalBuyers: usersByRole.find(u => u._id === 'buyer')?.count || 0,
      totalAdmins: usersByRole.find(u => u._id === 'admin')?.count || 0
    },
    userDistribution: {
      byRole: usersByRole,
      byState: usersByState
    },
    registrationTrends: recentRegistrations.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      count: item.count
    })),
    feedback: {
      total: feedbackStats?.totalFeedback?.count || 0,
      averageRating: Math.round((feedbackStats?.averageRating?.avgRating || 0) * 10) / 10,
      byCategory: feedbackStats?.feedbackByCategory || [],
      recentCount: feedbackStats?.recentFeedback?.count || 0
    },
    diseaseDetection: {
      total: diseaseDetectionStats?.totalDetections?.count || 0,
      monthlyTrend: diseaseDetectionStats?.detectionsByMonth || [],
      topDiseases: diseaseDetectionStats?.topDiseases || []
    },
    marketData: {
      recentPriceUpdates: marketPriceStats?.recentPrices?.count || 0,
      pricesByState: marketPriceStats?.pricesByState || []
    }
  };

  ResponseHandler.success(res, dashboardData, 'Dashboard statistics retrieved successfully');
});

// Get all farmers with filtering and pagination
export const getAllFarmers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, state, district, sortBy = 'createdAt', order = 'desc' } = req.query;
  
  // Build filter query
  const filter = { isActive: true };
  if (state) filter['farmLocation.state'] = new RegExp(state, 'i');
  if (district) filter['farmLocation.district'] = new RegExp(district, 'i');

  // Pagination
  const pagination = Helpers.paginate(page, limit);
  
  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  // Execute queries in parallel
  const [farmers, totalFarmers] = await Promise.all([
    Farmer.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Farmer.countDocuments(filter)
  ]);

  // Add computed fields
  const enrichedFarmers = farmers.map(farmer => ({
    ...farmer,
    registrationAge: Math.floor((new Date() - new Date(farmer.createdAt)) / (1000 * 60 * 60 * 24)),
    totalSchemes: farmer.governmentSchemes?.length || 0
  }));

  ResponseHandler.paginated(
    res, 
    enrichedFarmers, 
    { 
      page: pagination.page, 
      limit: pagination.limit, 
      total: totalFarmers 
    }, 
    'Farmers retrieved successfully'
  );
});

// Get all buyers with filtering and pagination
export const getAllBuyers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, businessType, state, sortBy = 'createdAt', order = 'desc' } = req.query;
  
  // Build filter query
  const filter = { isActive: true };
  if (businessType) filter.businessType = businessType;
  if (state) filter['address.state'] = new RegExp(state, 'i');

  // Pagination
  const pagination = Helpers.paginate(page, limit);
  
  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  // Execute queries in parallel
  const [buyers, totalBuyers] = await Promise.all([
    Buyer.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Buyer.countDocuments(filter)
  ]);

  // Add computed fields
  const enrichedBuyers = buyers.map(buyer => ({
    ...buyer,
    registrationAge: Math.floor((new Date() - new Date(buyer.createdAt)) / (1000 * 60 * 60 * 24)),
    totalPurchases: buyer.purchaseHistory?.length || 0,
    totalPurchaseValue: buyer.purchaseHistory?.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0) || 0
  }));

  ResponseHandler.paginated(
    res, 
    enrichedBuyers, 
    { 
      page: pagination.page, 
      limit: pagination.limit, 
      total: totalBuyers 
    }, 
    'Buyers retrieved successfully'
  );
});

// Get comprehensive user analytics
export const getUserAnalytics = catchAsync(async (req, res, next) => {
  const { timeRange = '30d' } = req.query;
  
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

  const analytics = await User.aggregate([
    {
      $facet: {
        // User growth over time
        userGrowth: [
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              count: { $sum: 1 },
              farmers: {
                $sum: { $cond: [{ $eq: ['$role', 'farmer'] }, 1, 0] }
              },
              buyers: {
                $sum: { $cond: [{ $eq: ['$role', 'buyer'] }, 1, 0] }
              }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ],

        // User activity patterns
        activityPatterns: [
          { $match: { lastLogin: { $gte: startDate } } },
          {
            $group: {
              _id: {
                hour: { $hour: '$lastLogin' },
                dayOfWeek: { $dayOfWeek: '$lastLogin' }
              },
              count: { $sum: 1 }
            }
          }
        ],

        // Geographic distribution
        geoDistribution: [
          { $match: { role: 'farmer', isActive: true } },
          {
            $group: {
              _id: {
                state: '$farmLocation.state',
                district: '$farmLocation.district'
              },
              count: { $sum: 1 },
              totalLandSize: { $sum: '$landSize' }
            }
          },
          { $match: { '_id.state': { $ne: null } } },
          { $sort: { count: -1 } },
          { $limit: 50 }
        ],

        // User engagement metrics
        engagement: [
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              activeUsers: {
                $sum: { $cond: [{ $gte: ['$lastLogin', startDate] }, 1, 0] }
              },
              verifiedUsers: {
                $sum: { $cond: ['$isVerified', 1, 0] }
              }
            }
          }
        ]
      }
    }
  ]);

  const analyticsData = {
    timeRange,
    userGrowth: analytics.userGrowth.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      total: item.count,
      farmers: item.farmers,
      buyers: item.buyers
    })),
    activityPatterns: analytics.activityPatterns,
    geoDistribution: analytics.geoDistribution.map(item => ({
      state: item._id.state,
      district: item._id.district,
      userCount: item.count,
      totalLandSize: item.totalLandSize,
      avgLandSize: Math.round((item.totalLandSize / item.count) * 100) / 100
    })),
    engagement: analytics.engagement || { totalUsers: 0, activeUsers: 0, verifiedUsers: 0 }
  };

  ResponseHandler.success(res, analyticsData, 'User analytics retrieved successfully');
});

// Get feedback list with filtering
export const getFeedbackList = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    status, 
    priority, 
    rating,
    sortBy = 'createdAt',
    order = 'desc' 
  } = req.query;

  // Build filter query
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (rating) filter.rating = parseInt(rating);

  // Pagination
  const pagination = Helpers.paginate(page, limit);
  
  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  // Execute queries
  const [feedback, totalFeedback] = await Promise.all([
    Feedback.find(filter)
      .populate('userId', 'name email role')
      .populate('adminResponse.respondedBy', 'name')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Feedback.countDocuments(filter)
  ]);

  ResponseHandler.paginated(
    res,
    feedback,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: totalFeedback
    },
    'Feedback retrieved successfully'
  );
});

// Respond to feedback
export const respondToFeedback = catchAsync(async (req, res, next) => {
  const { feedbackId } = req.params;
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return ResponseHandler.validationError(res, 
      [{ field: 'message', message: 'Response message is required' }]
    );
  }

  const feedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    {
      adminResponse: {
        message: message.trim(),
        respondedBy: req.user._id,
        respondedAt: new Date()
      },
      status: 'resolved'
    },
    { new: true }
  ).populate('userId', 'name email role');

  if (!feedback) {
    return ResponseHandler.notFound(res, 'Feedback not found');
  }

  ResponseHandler.success(res, feedback, 'Response added successfully');
});

// Manage user (activate/deactivate)
export const manageUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { action } = req.body; // 'activate' or 'deactivate'

  if (!['activate', 'deactivate'].includes(action)) {
    return ResponseHandler.validationError(res,
      [{ field: 'action', message: 'Action must be either "activate" or "deactivate"' }]
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: action === 'activate' },
    { new: true }
  ).select('-password');

  if (!user) {
    return ResponseHandler.notFound(res, 'User not found');
  }

  ResponseHandler.success(
    res, 
    user, 
    `User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`
  );
});

// System health check
export const getSystemHealth = catchAsync(async (req, res, next) => {
  const healthData = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  };

  // Database connection check
  try {
    await User.findOne({}).limit(1);
    healthData.database = { status: 'connected', message: 'Database connection healthy' };
  } catch (error) {
    healthData.database = { status: 'error', message: 'Database connection failed' };
  }

  ResponseHandler.success(res, healthData, 'System health retrieved successfully');
});
