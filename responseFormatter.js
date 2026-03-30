/**
 * Standardized response formatter for API payloads
 */
const successResponse = (res, data, message = "Success", meta = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta
  });
};

module.exports = {
  successResponse
};