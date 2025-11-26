/**
 * AI Module Constants
 * Configuration values specific to AI recommendation engine
 */

// ============================
// AI WEIGHTS CONFIGURATION
// ============================
export const AI_WEIGHTS = {
  // Normal SOC (>= 20%)
  NORMAL: {
    DISTANCE: 0.4,
    PORT_MATCH: 0.15,
    PRICE: 0.15,
    AVAILABILITY: 0.15,
    CHARGE_TIME: 0.15,
  },

  // Low SOC (< 20%)
  LOW_SOC: {
    DISTANCE: 0.75, // Ưu tiên cực mạnh trạm gần khi pin thấp
    PORT_MATCH: 0.15,
    PRICE: 0.03, // Gần như không quan tâm giá khi khẩn cấp
    AVAILABILITY: 0.07, // Giảm ưu tiên availability
    CHARGE_TIME: 0.0, // Bỏ qua charge time, chỉ cần gần!
  },
};

// ============================
// SCORING PARAMETERS
// ============================
export const SCORING = {
  // Distance exponential decay factor
  DISTANCE_DECAY: 0.25,
  // Stronger distance penalty when battery is low
  DISTANCE_DECAY_LOW: 1.2, // Penalty mạnh hơn cho trạm xa khi pin thấp

  // Charge time thresholds (minutes)
  FAST_CHARGE_THRESHOLD: 30,
  SLOW_CHARGE_THRESHOLD: 120,

  // Fast/slow charge multipliers
  FAST_CHARGE_BONUS: 1.1,
  SLOW_CHARGE_PENALTY: 0.85,

  // Rating bonus threshold
  HIGH_RATING_THRESHOLD: 4.7,
  HIGH_RATING_BONUS: 0.05,

  // User history bonus (logarithmic scale)
  HISTORY_MULTIPLIER: 0.02,
  HISTORY_MAX_BONUS: 0.05,

  // Charging efficiency (battery → actual charge)
  CHARGING_EFFICIENCY: 0.9,
};

// ============================
// DEFAULT VALUES
// ============================
export const DEFAULTS = {
  // Default vehicle configuration for guest users
  VEHICLE: {
    CONNECTOR: 'Type 2', // Changed from CCS2 to match database
    BATTERY_KWH: 60,
    MAX_POWER: 50,
  },

  // Default AI request parameters
  SOC: 50,
  MAX_PRICE: 10000,
  RADIUS: 20,
  LIMIT: 10,
  MIN_RATING: 0,
};

// ============================
// SOC LEVELS
// ============================
export const SOC_LEVELS = {
  CRITICAL: 10, // Below 10% - extremely low
  LOW: 20, // Below 20% - low battery
  NORMAL: 20, // Above 20% - normal
};

// ============================
// REASON TEMPLATES
// ============================
export const REASON_TEMPLATES = {
  NEAR: (distance) => `📍 Gần bạn (${distance.toFixed(1)}km)`,
  COMPATIBLE: (count) => `⚡ Có ${count} cổng sạc phù hợp`,
  FAST_CHARGE: (minutes) => `⏱️ Sạc dự kiến <${minutes} phút`,
  GOOD_PRICE: (price) => `💰 Giá tốt (${price.toLocaleString()}đ/kWh)`,
  HIGH_RATING: (rating) => `⭐ Đánh giá cao ${rating}/5`,
  HISTORY: () => `📜 Đã từng đặt chỗ tại trạm này`,
  AVAILABLE: (available, total) => `🔌 ${available}/${total} cổng trống`,
};

// ============================
// VALIDATION RULES
// ============================
export const VALIDATION = {
  SOC_MIN: 0,
  SOC_MAX: 100,
  PRICE_MIN: 0,
  PRICE_MAX: 100000,
  RADIUS_MIN: 1,
  RADIUS_MAX: 100,
  LIMIT_MIN: 1,
  LIMIT_MAX: 50,
};
