const { StatusCodes } = require("http-status-codes");

/**
 * Standard API Response Builder
 */

/**
 * Format and send a standardized success response
 * @param {import("express").Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message="Success"]
 * @param {any} [options.data=null]
 * @param {Object} [options.meta=null]
 * @param {Object} [options.extra={}] - Additional top-level fields for backward compatibility
 */
const sendSuccess = (
  res,
  {
    statusCode = StatusCodes.OK,
    message = "Success",
    data = null,
    meta = undefined,
    extra = {},
  } = {}
) => {
  const payload = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...extra,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Helper to send 201 Created response
 */
const sendCreated = (res, { message = "Resource created successfully", data = null, extra = {} } = {}) => {
  return sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message,
    data,
    extra,
  });
};

/**
 * Helper to send paginated or list response
 */
const sendList = (
  res,
  {
    items = [],
    message = "Records retrieved successfully",
    meta = {},
    extra = {},
  } = {}
) => {
  return sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message,
    data: items,
    meta: {
      count: items.length,
      ...meta,
    },
    extra: {
      count: items.length,
      ...extra,
    },
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendList,
};
