const { sendResponse } = require('../utils/response');
const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join(', ');
    return sendResponse(res, 400, false, null, `Validation failed: ${message}`);
  }

  // Handle generic JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendResponse(res, 401, false, null, "Your session looks invalid. Please log in again.");
  }
  if (err.name === 'TokenExpiredError') {
    return sendResponse(res, 401, false, null, "Your session expired. Time to log in again.");
  }

  // Fallback generic error
  return sendResponse(res, 500, false, null, err.message || "Something went wrong on our end.");
};

module.exports = { errorHandler };
