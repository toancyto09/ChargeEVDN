import ratingService from './rating.service.js';

/**
 * Rating Controller
 * Handles HTTP requests for rating management
 */
class RatingController {
  /**
   * Create a new rating
   * POST /api/ratings
   */
  async createRating(req, res) {
    try {
      // Support multiple token formats
      const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
      
      if (!userId) {
        console.error('❌ No userId in token:', req.user);
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid token'
        });
      }

      const ratingData = req.body;

      // Validate required fields
      const required = ['id_dat_cho', 'id_tram', 'diem_so'];
      for (const field of required) {
        if (!ratingData[field]) {
          return res.status(400).json({
            success: false,
            message: `Thiếu trường bắt buộc: ${field}`
          });
        }
      }

      const rating = await ratingService.createRating(userId, ratingData);

      res.status(201).json({
        success: true,
        message: 'Đánh giá thành công!',
        data: rating
      });
    } catch (error) {
      console.error('❌ Error creating rating:', error);

      // Business logic errors (400)
      const businessErrors = [
        'Không tìm thấy booking',
        'không có quyền',
        'Chỉ có thể đánh giá',
        'đã đánh giá',
        'phải từ 1 đến 5'
      ];

      if (businessErrors.some(msg => error.message.includes(msg))) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi tạo đánh giá',
        error: error.message
      });
    }
  }

  /**
   * Get ratings for a station
   * GET /api/ratings/station/:id
   */
  async getStationRatings(req, res) {
    try {
      const stationId = req.params.id;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const ratings = await ratingService.getStationRatings(stationId, {
        limit,
        offset
      });

      const average = await ratingService.getStationAverageRating(stationId);

      res.json({
        success: true,
        data: {
          ratings,
          summary: average
        }
      });
    } catch (error) {
      console.error('❌ Error getting station ratings:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy đánh giá',
        error: error.message
      });
    }
  }

  /**
   * Get average rating for a station
   * GET /api/ratings/station/:id/average
   */
  async getStationAverage(req, res) {
    try {
      const stationId = req.params.id;
      const average = await ratingService.getStationAverageRating(stationId);

      res.json({
        success: true,
        data: average
      });
    } catch (error) {
      console.error('❌ Error getting station average:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy điểm trung bình',
        error: error.message
      });
    }
  }

  /**
   * Get user's ratings
   * GET /api/ratings/my
   */
  async getMyRatings(req, res) {
    try {
      const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const ratings = await ratingService.getUserRatings(userId, {
        limit,
        offset
      });

      res.json({
        success: true,
        data: ratings
      });
    } catch (error) {
      console.error('❌ Error getting user ratings:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy lịch sử đánh giá',
        error: error.message
      });
    }
  }

  /**
   * Check if user can rate a booking
   * GET /api/ratings/can-rate/:bookingId
   */
  async canRateBooking(req, res) {
    try {
      const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
      const bookingId = req.params.bookingId;

      const result = await ratingService.canRateBooking(userId, bookingId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('❌ Error checking can rate:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể kiểm tra quyền đánh giá',
        error: error.message
      });
    }
  }
}

export default new RatingController();

