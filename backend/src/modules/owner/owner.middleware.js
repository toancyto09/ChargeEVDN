/**
 * Owner Middleware
 * Role authorization for owner routes
 */

export const checkOwnerRole = (req, res, next) => {
  if (req.user.vai_tro !== 'owner' && req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ chủ sở hữu trạm mới có quyền truy cập'
    });
  }
  next();
};

