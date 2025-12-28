import adminAnalyticsService from './admin.analytics.service.js';

/**
 * Admin Analytics Controller
 * Handle HTTP requests for analytics endpoints
 */
class AdminAnalyticsController {
  /**
   * GET /api/admin/analytics/overview
   * Get overview statistics
   */
  async getOverview(req, res, next) {
    try {
      const stats = await adminAnalyticsService.getOverviewStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/analytics/revenue
   * Get revenue chart data
   */
  async getRevenueChart(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      // Default to last 30 days if not provided
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const data = await adminAnalyticsService.getRevenueChart(start, end);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/analytics/users
   * Get user growth chart data
   */
  async getUserGrowthChart(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const data = await adminAnalyticsService.getUserGrowthChart(start, end);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/analytics/sessions
   * Get sessions chart data
   */
  async getSessionsChart(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const data = await adminAnalyticsService.getSessionsChart(start, end);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/analytics/top-stations
   * Get top performing stations
   */
  async getTopStations(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const data = await adminAnalyticsService.getTopStations(parseInt(limit));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/analytics/booking-status
   * Get booking status distribution
   */
  async getBookingStatus(req, res, next) {
    try {
      const data = await adminAnalyticsService.getBookingStatusDistribution();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/analytics/recent-transactions
   * Get recent transactions
   */
  async getRecentTransactions(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const data = await adminAnalyticsService.getRecentTransactions(parseInt(limit));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/analytics/revenue-by-business
   * Get revenue breakdown by business
   */
  async getRevenueByBusiness(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const data = await adminAnalyticsService.getRevenueByBusiness(parseInt(limit));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminAnalyticsController();
