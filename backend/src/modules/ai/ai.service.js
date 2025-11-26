/**
 * AI Service
 * Core AI recommendation engine logic
 */

import pool from '../../config/db.js';
import logger from '../../utils/logger.js';
import { calculateDistance, clamp01 } from '../../utils/helpers.js';
import {
  AI_WEIGHTS,
  SCORING,
  DEFAULTS,
  SOC_LEVELS,
  REASON_TEMPLATES,
} from './ai.constants.js';

/**
 * Get user's main vehicle with connector and battery info
 * @returns {Promise<Object>} Vehicle configuration
 */
async function getUserMainVehicle(userId) {
  // ✅ Support guest users with default vehicle config
  if (!userId) {
    logger.ai('Guest user - using default vehicle config');
    return DEFAULTS.VEHICLE;
  }

  const { rows } = await pool.query(
    `SELECT pt.*, lcs.ma_cong
     FROM phuong_tien pt
     JOIN loai_cong_sac lcs ON lcs.id_loai_cong = pt.id_loai_cong
     WHERE pt.id_nguoi_dung = $1 AND pt.trang_thai = 'active' AND pt.la_xe_chinh = true
     ORDER BY pt.ngay_tao DESC
     LIMIT 1`,
    [userId]
  );

  // If user has no vehicle, use default config
  if (!rows[0]) {
    logger.warn(`User ${userId} has no vehicle, using default config`);
    return {
      ma_cong: DEFAULTS.VEHICLE.CONNECTOR,
      dung_luong_pin_kwh: DEFAULTS.VEHICLE.BATTERY_KWH,
      cong_suat_sac_toi_da: DEFAULTS.VEHICLE.MAX_POWER,
    };
  }

  logger.ai('User vehicle loaded', {
    connector: rows[0].ma_cong,
    battery: rows[0].dung_luong_pin_kwh,
    maxPower: rows[0].cong_suat_sac_toi_da,
  });

  return rows[0];
}

/**
 * Get dynamic weights based on SOC level
 */
function getWeightsBySOC(soc) {
  if (soc < SOC_LEVELS.LOW) {
    return AI_WEIGHTS.LOW_SOC;
  }
  return AI_WEIGHTS.NORMAL;
}

/**
 * Calculate AI score for a station
 */
function calculateAIScore({
  distance,
  portMatch,
  priceScore,
  availableScore,
  chargeTimeMinutes,
  rating,
  userHistory,
  soc,
}) {
  // Get dynamic weights based on SOC
  const weights = getWeightsBySOC(soc);

  // Proximity score (exponential decay)
  const distanceDecay =
    soc < SOC_LEVELS.LOW ? SCORING.DISTANCE_DECAY_LOW : SCORING.DISTANCE_DECAY;
  const proximityScore = Math.exp(-distanceDecay * distance);

  // Charge time score (normalized to 0-1, inverted)
  const chargeTimeScore = 1 - clamp01(chargeTimeMinutes / 60);

  // Rating bonus
  const ratingBonus =
    rating >= SCORING.HIGH_RATING_THRESHOLD ? SCORING.HIGH_RATING_BONUS : 0;

  // User history bonus (logarithmic)
  const historyBonus = Math.min(
    Math.log(1 + (userHistory || 0)) * SCORING.HISTORY_MULTIPLIER,
    SCORING.HISTORY_MAX_BONUS
  );

  // Base score
  const baseScore =
    weights.DISTANCE * proximityScore +
    weights.PORT_MATCH * portMatch +
    weights.PRICE * priceScore +
    weights.AVAILABILITY * availableScore +
    weights.CHARGE_TIME * chargeTimeScore +
    ratingBonus +
    historyBonus;

  // Fast/slow charge bonus
  let multiplier = 1.0;
  if (chargeTimeMinutes < SCORING.FAST_CHARGE_THRESHOLD) {
    multiplier = SCORING.FAST_CHARGE_BONUS;
  } else if (chargeTimeMinutes > SCORING.SLOW_CHARGE_THRESHOLD) {
    multiplier = SCORING.SLOW_CHARGE_PENALTY;
  }

  return baseScore * multiplier;
}

/**
 * Generate recommendation reasons
 */
function generateReasons({
  distance,
  availableConnectors,
  totalConnectors,
  chargeTimeMinutes,
  price,
  minPrice,
  maxPrice,
  rating,
  userHistory,
}) {
  const reasons = [];

  // Distance
  if (distance < 2) {
    reasons.push(REASON_TEMPLATES.NEAR(distance));
  }

  // Available connectors
  if (availableConnectors > 0) {
    reasons.push(
      REASON_TEMPLATES.AVAILABLE(availableConnectors, totalConnectors)
    );
  }

  // Fast charging
  if (chargeTimeMinutes < SCORING.FAST_CHARGE_THRESHOLD) {
    reasons.push(REASON_TEMPLATES.FAST_CHARGE(SCORING.FAST_CHARGE_THRESHOLD));
  }

  // Good price (in bottom 25% of price range)
  if (price < minPrice + (maxPrice - minPrice) * 0.25) {
    reasons.push(REASON_TEMPLATES.GOOD_PRICE(price));
  }

  // High rating
  if (rating >= SCORING.HIGH_RATING_THRESHOLD) {
    reasons.push(REASON_TEMPLATES.HIGH_RATING(rating.toFixed(1)));
  }

  // User history
  if (userHistory > 0) {
    reasons.push(REASON_TEMPLATES.HISTORY());
  }

  return reasons;
}

/**
 * Get AI Recommendations
 */
export const getAIRecommendations = async ({
  userId,
  userLat,
  userLng,
  soc = DEFAULTS.SOC,
  maxPrice = DEFAULTS.MAX_PRICE,
  minRating = DEFAULTS.MIN_RATING,
  radiusKm = DEFAULTS.RADIUS,
  limit = DEFAULTS.LIMIT,
}) => {
  try {
    logger.ai('AI Recommendations Request', {
      userId,
      userLat,
      userLng,
      soc,
      maxPrice,
      radiusKm,
      limit,
    });

    // 1. Get user's vehicle (or default)
    const vehicle = await getUserMainVehicle(userId);
    console.log('✅ AI SERVICE: User vehicle connector:', vehicle.ma_cong);

    // 2. Query suitable stations
    const sql = `
      SELECT
        ts.id_tram, ts.ten_tram, ts.dia_chi, ts.kinh_do, ts.vi_do,
        COALESCE(hsg.gia_kwh, 0) as gia_kwh,
        COALESCE(AVG(dg.diem_so), 0) as diem_trung_binh,
        ARRAY_AGG(DISTINCT lcs.ma_cong) FILTER (WHERE lcs.ma_cong IS NOT NULL) as loai_cong,
        ARRAY_AGG(cs.cong_suat_kwh) FILTER (WHERE cs.cong_suat_kwh IS NOT NULL) as cong_suat_list,
        COUNT(cs.id_cong_sac) as tong_cong,
        COUNT(CASE WHEN cs.trang_thai = 'trong' THEN 1 END) as cong_trong
      FROM tram_sac ts
        LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
        LEFT JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
        LEFT JOIN lich_su_gia_tram hsg ON hsg.id_tram = ts.id_tram 
          AND hsg.hieu_luc_tu <= NOW() 
          AND (hsg.hieu_luc_den IS NULL OR hsg.hieu_luc_den >= NOW()) 
          AND hsg.trang_thai='active'
        LEFT JOIN danh_gia dg ON dg.id_tram = ts.id_tram
      WHERE ts.trang_thai_duyet = 'approved'
        AND ($1::text IS NULL OR lcs.ma_cong = $1)
        AND (hsg.gia_kwh IS NULL OR hsg.gia_kwh <= $2)
      GROUP BY ts.id_tram, ts.ten_tram, ts.dia_chi, ts.kinh_do, ts.vi_do, hsg.gia_kwh
      HAVING COUNT(cs.id_cong_sac) > 0
    `;

    console.log('🔵 AI SERVICE: Executing query with params:', {
      connector: vehicle.ma_cong,
      maxPrice,
      radiusKm,
    });
    
    const result = await pool.query(sql, [vehicle.ma_cong, maxPrice]);
    let stations = result.rows;

    console.log('✅ AI SERVICE: Query result - Found', stations.length, 'candidate stations');
    if (stations.length > 0) {
      console.log('✅ AI SERVICE: First station sample:', stations[0]);
    }
    logger.ai(`Found ${stations.length} candidate stations`);

    // 2.5. Hard cap radius when battery is critically low
    if (soc < SOC_LEVELS.CRITICAL) {
      // SOC < 10%: chỉ tìm trong 5km
      const maxDistanceKm = 5;
      stations = stations.filter((s) => {
        const dist = calculateDistance(userLat, userLng, s.vi_do, s.kinh_do);
        return dist <= maxDistanceKm;
      });
      logger.ai(`Critical battery (${soc}%) - limiting to ${maxDistanceKm}km: ${stations.length} stations`);
    } else if (soc < SOC_LEVELS.LOW) {
      // SOC < 20%: chỉ tìm trong 10km
      const maxDistanceKm = 10;
      stations = stations.filter((s) => {
        const dist = calculateDistance(userLat, userLng, s.vi_do, s.kinh_do);
        return dist <= maxDistanceKm;
      });
      logger.ai(`Low battery (${soc}%) - limiting to ${maxDistanceKm}km: ${stations.length} stations`);
    }

    // 3. Calculate price range for normalization
    const prices = stations.map((s) => parseFloat(s.gia_kwh || 0));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPriceActual = prices.length > 0 ? Math.max(...prices) : maxPrice;

    // 4. Score each station
    console.log('🔵 AI SERVICE: Scoring', stations.length, 'stations...');
    
    stations = stations
      .map((station) => {
        // Distance
        const distance = calculateDistance(
          userLat,
          userLng,
          station.vi_do,
          station.kinh_do
        );

        // Port compatibility (filter incompatible stations)
        const portMatch = station.loai_cong?.includes(vehicle.ma_cong) ? 1 : 0;
        
        if (!portMatch) {
          console.log(`⚠️ AI SERVICE: Station "${station.ten_tram}" filtered out - connector mismatch. Has: [${station.loai_cong}], Need: ${vehicle.ma_cong}`);
          return null;
        }

        // Price score (normalized)
        const priceNorm =
          maxPriceActual > minPrice
            ? (station.gia_kwh - minPrice) / (maxPriceActual - minPrice)
            : 0;
        const priceScore = 1 - clamp01(priceNorm);

        // Availability score
        const availableScore =
          station.cong_trong / Math.max(1, station.tong_cong);

        // Charging time calculation
        const maxStationPower = Math.max(
          ...(station.cong_suat_list || []).map(Number)
        );
        const usablePower = Math.min(
          vehicle.cong_suat_sac_toi_da || DEFAULTS.VEHICLE.MAX_POWER,
          maxStationPower || DEFAULTS.VEHICLE.MAX_POWER
        );
        const needEnergy =
          (vehicle.dung_luong_pin_kwh || DEFAULTS.VEHICLE.BATTERY_KWH) *
          (1 - soc / 100);
        const chargeTimeMinutes =
          usablePower > 0 && needEnergy > 0
            ? (needEnergy / (usablePower * SCORING.CHARGING_EFFICIENCY)) * 60
            : 9999;

        // AI Score
        const ai_score = calculateAIScore({
          distance,
          portMatch,
          priceScore,
          availableScore,
          chargeTimeMinutes,
          rating: station.diem_trung_binh,
          userHistory: 0, // TODO: implement user history tracking
          soc,
        });

        // Generate reasons
        const reasons = generateReasons({
          distance,
          availableConnectors: station.cong_trong,
          totalConnectors: station.tong_cong,
          chargeTimeMinutes,
          price: station.gia_kwh,
          minPrice,
          maxPrice: maxPriceActual,
          rating: station.diem_trung_binh,
          userHistory: 0,
        });

        return {
          ...station,
          khoang_cach_km: distance,
          ai_score: Number(ai_score.toFixed(4)),
          chargeTimeMinutes: Math.round(chargeTimeMinutes),
          reasons,
        };
      })
      .filter(Boolean);

    // 5. Filter by rating and radius (for normal battery only)
    if (minRating > 0) {
      stations = stations.filter((s) => s.diem_trung_binh >= minRating);
    }
    // Apply user-defined radius filter ONLY for normal battery
    // (Low battery already filtered by hard cap at step 2.5)
    if (radiusKm > 0 && soc >= SOC_LEVELS.LOW) {
      stations = stations.filter((s) => s.khoang_cach_km <= radiusKm);
    }

    console.log(`✅ AI SERVICE: Filtered to ${stations.length} stations after rating/radius filters`);
    logger.ai(`Filtered to ${stations.length} stations after rating/radius filters`);

    // 6. Sort by AI score and limit
    stations = stations.sort((a, b) => b.ai_score - a.ai_score).slice(0, limit);

    console.log(`✅ AI SERVICE: Returning ${stations.length} AI recommendations`);
    logger.ai(`Returning ${stations.length} AI recommendations`);

    return {
      success: true,
      data: stations,
      metadata: {
        vehicleUsed: {
          connector: vehicle.ma_cong,
          batteryKwh:
            vehicle.dung_luong_pin_kwh || DEFAULTS.VEHICLE.BATTERY_KWH,
          maxPower: vehicle.cong_suat_sac_toi_da || DEFAULTS.VEHICLE.MAX_POWER,
        },
        soc,
        totalCandidates: result.rows.length,
        filteredResults: stations.length,
      },
    };
  } catch (error) {
    logger.error('AI Recommendations Error', error);
    throw error;
  }
};
