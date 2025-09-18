// controllers/feedbackController.js - ❌ MISSING
import Feedback from '../models/Feedback.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { Validators } from '../utils/validators.js';
import { Helpers } from '../utils/helpers.js';
import { ValidationError, NotFoundError } from '../utils/errorHandler.js';

// Submit new feedback
export const submitFeedback = catchAsync(async (req, res, next) => {
  const {
    category,
    subject,
    message,
    rating,
    featureRating,
    deviceInfo,
    isPublic = false
  } = req.body;

  // Validate required fields
  if (!category || !subject || !message) {
    throw new ValidationError('Missing required fields', [
      { field: 'category', message: 'Category is required' },
      { field: 'subject', message: 'Subject is required' },
      { field: 'message', message: 'Message is required' }
    ]);
  }

  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    throw new ValidationError('Invalid rating', [
      { field: 'rating', message: 'Rating must be between 1 and 5' }
    ]);
  }

  const feedbackData = {
    userId: req.user._id,
    userRole: req.user.role,
    category,
    subject: subject.trim(),
    message: message.trim(),
    rating,
    featureRating,
    deviceInfo,
    location: {
      state: req.user.farmLocation?.state || req.user.address?.state,
      district: req.user.farmLocation?.district || req.user.address?.district
    },
    isPublic,
    screenshots: req.uploadedFiles?.map(file => `/uploads/documents/${file.filename}`) || []
  };

  const feedback = await Feedback.create(feedbackData);

  ResponseHandler.created(res, feedback, 'Feedback submitted successfully');
});

// Get user's feedback
export const getUserFeedback = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, category, status } = req.query;
  
  const filter = { userId: req.user._id };
  if (category) filter.category = category;
  if (status) filter.status = status;

  const pagination = Helpers.paginate(page, limit);
  
  const [feedback, totalFeedback] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('adminResponse.respondedBy', 'name')
      .lean(),
    Feedback.countDocuments(filter)
  ]);

  ResponseHandler.paginated(
    res,
    feedback,
    { page: pagination.page, limit: pagination.limit, total: totalFeedback },
    'Feedback retrieved successfully'
  );
});

// Get feedback by ID
export const getFeedbackById = catchAsync(async (req, res, next) => {
  const { feedbackId } = req.params;

  const feedback = await Feedback.findById(feedbackId)
    .populate('userId', 'name email role')
    .populate('adminResponse.respondedBy', 'name');

  if (!feedback) {
    throw new NotFoundError('Feedback not found');
  }

  ResponseHandler.success(res, feedback, 'Feedback retrieved successfully');
});

// Update feedback
export const updateFeedback = catchAsync(async (req, res, next) => {
  const { feedbackId } = req.params;
  const { subject, message, rating } = req.body;

  const feedback = await Feedback.findById(feedbackId);
  
  if (!feedback) {
    throw new NotFoundError('Feedback not found');
  }

  if (feedback.adminResponse) {
    throw new ValidationError('Cannot update feedback that has been responded to', []);
  }

  const updateData = {};
  if (subject) updateData.subject = subject.trim();
  if (message) updateData.message = message.trim();
  if (rating) updateData.rating = rating;

  const updatedFeedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    updateData,
    { new: true, runValidators: true }
  );

  ResponseHandler.success(res, updatedFeedback, 'Feedback updated successfully');
});

// Delete feedback
export const deleteFeedback = catchAsync(async (req, res, next) => {
  const { feedbackId } = req.params;

  const feedback = await Feedback.findById(feedbackId);
  
  if (!feedback) {
    throw new NotFoundError('Feedback not found');
  }

  if (feedback.adminResponse) {
    throw new ValidationError('Cannot delete feedback that has been responded to', []);
  }

  await Feedback.findByIdAndDelete(feedbackId);

  ResponseHandler.success(res, null, 'Feedback deleted successfully');
});
