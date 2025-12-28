import auditLogService from '../services/auditLog.service.js';

/**
 * Audit Log Middleware
 * Automatically log certain actions
 */

/**
 * Log action helper
 * @param {string} action - Action type
 * @param {object} details - Additional details
 */
export const logAction = (action, details = {}) => {
  return async (req, res, next) => {
    try {
      // Store original json method
      const originalJson = res.json;

      // Override json method to log after successful response
      res.json = function (data) {
        // Only log if response is successful
        if (data.success !== false && res.statusCode < 400) {
          const userId = req.user?.id_nguoi_dung || req.user?.userId || req.user?.id || null;
          
          // Merge details with params/body
          const logDetails = {
            ...details,
            params: req.params,
            query: req.query,
            body: sanitizeBody(req.body),
            response_status: res.statusCode,
          };

          // Log asynchronously (don't wait)
          auditLogService.createLog({
            userId,
            action,
            details: logDetails,
            req,
          }).catch(err => console.error('Audit log error:', err));
        }

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      // Don't break the flow if logging fails
      next();
    }
  };
};

/**
 * Sanitize request body to remove sensitive data
 * @param {object} body 
 * @returns {object}
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['mat_khau', 'password', 'currentPassword', 'newPassword', 'token'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
}

/**
 * Common audit log middleware for different actions
 */
export const auditLog = {
  // Auth actions
  login: logAction('login'),
  logout: logAction('logout'),
  register: logAction('register'),
  passwordChange: logAction('password_change'),

  // User management
  userCreate: logAction('user_create'),
  userUpdate: logAction('user_update'),
  userDelete: logAction('user_delete'),
  userStatusChange: logAction('user_status_change'),
  userRoleChange: logAction('user_role_change'),

  // Station management
  stationCreate: logAction('station_create'),
  stationApprove: logAction('station_approve'),
  stationReject: logAction('station_reject'),
  stationUpdate: logAction('station_update'),
  stationDelete: logAction('station_delete'),

  // Business management
  businessCreate: logAction('business_create'),
  businessApprove: logAction('business_approve'),
  businessReject: logAction('business_reject'),
  businessUpdate: logAction('business_update'),

  // Booking actions
  bookingCreate: logAction('booking_create'),
  bookingCancel: logAction('booking_cancel'),
  bookingConfirm: logAction('booking_confirm'),

  // Payment actions
  paymentCreate: logAction('payment_create'),
  paymentSuccess: logAction('payment_success'),
  paymentFailed: logAction('payment_failed'),

  // Session actions
  sessionStart: logAction('session_start'),
  sessionEnd: logAction('session_end'),
  sessionCancel: logAction('session_cancel'),

  // Generic action logger
  custom: (action) => logAction(action),
};
