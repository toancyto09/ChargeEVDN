import ownerRatingService from './owner.rating.service.js';

/**
 * Owner Rating Controller
 * Handle HTTP requests for owner rating management
 */
class OwnerRatingController {
  /**
   * Get all ratings for owner's stations
   * GET /api/owner/ratings
   */
  async getRatings(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      
      const filters = {
        stationId: req.query.station_id,
        minRating: req.query.min_rating,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
      };

      const result = await ownerRatingService.getOwnerRatings(userId, filters);

      res.status(200).json({
        success: true,
        data: result.ratings,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.ratings.length < result.total,
        },
      });
    } catch (error) {
      console.error('Get owner ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách đánh giá',
        error: error.message,
      });
    }
  }

  /**
   * Get rating statistics
   * GET /api/owner/ratings/stats
   */
  async getStats(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      
      const filters = {
        stationId: req.query.station_id,
      };

      const stats = await ownerRatingService.getRatingStats(userId, filters);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get rating stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy thống kê đánh giá',
        error: error.message,
      });
    }
  }

  /**
   * Get rating detail
   * GET /api/owner/ratings/:id
   */
  async getRatingDetail(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;

      // Validate rating ID
      const ratingId = parseInt(id);
      if (isNaN(ratingId) || ratingId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID đánh giá không hợp lệ',
        });
      }

      const rating = await ownerRatingService.getRatingDetail(
        ratingId,
        userId
      );

      res.status(200).json({
        success: true,
        data: rating,
      });
    } catch (error) {
      console.error('Get rating detail error:', error);
      
      if (error.message.includes('Không tìm thấy')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Không thể lấy chi tiết đánh giá',
        error: error.message,
      });
    }
  }
}

export default new OwnerRatingController();
