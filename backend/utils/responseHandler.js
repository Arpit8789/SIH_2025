// utils/responseHandler.js
// Standardized response handler for consistent API responses

export class ResponseHandler {
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(res, errors, message = 'Validation failed') {
    return this.error(res, message, 400, errors);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  static serverError(res, message = 'Internal server error') {
    return this.error(res, message, 500);
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(res, data, pagination, message = 'Data retrieved successfully') {
    const meta = {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      }
    };

    return this.success(res, data, message, 200, meta);
  }

  static downloadResponse(res, filePath, fileName) {
    return res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('File download error:', err);
        return this.error(res, 'File download failed', 500);
      }
    });
  }
}

// Response middleware to add helper methods to res object
export const responseMiddleware = (req, res, next) => {
  // Success responses
  res.successResponse = (data, message, statusCode, meta) => 
    ResponseHandler.success(res, data, message, statusCode, meta);

  res.errorResponse = (message, statusCode, errors) => 
    ResponseHandler.error(res, message, statusCode, errors);

  res.validationError = (errors, message) => 
    ResponseHandler.validationError(res, errors, message);

  res.notFound = (message) => 
    ResponseHandler.notFound(res, message);

  res.unauthorized = (message) => 
    ResponseHandler.unauthorized(res, message);

  res.forbidden = (message) => 
    ResponseHandler.forbidden(res, message);

  res.serverError = (message) => 
    ResponseHandler.serverError(res, message);

  res.created = (data, message) => 
    ResponseHandler.created(res, data, message);

  res.paginated = (data, pagination, message) => 
    ResponseHandler.paginated(res, data, pagination, message);

  next();
};
