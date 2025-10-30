/**
 * Station Service
 * Business logic for station-related operations
 */

import pool from '../../config/db.js';
import logger from '../../utils/logger.js';
import { calculateDistance } from '../../utils/helpers.js';

/**
 * Get Stations with Filtering
 */
export async function getStations(params = {}) {
  const {
    lat,
    lng,
    radius = 20,
    maxPrice = 10000,
    minRating = 0,
    connector,
    status,
  } = params;

  try {
    logger.debug('Get Stations Request', params);

    const query = `
      SELECT
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi,
        ts.kinh_do,
        ts.vi_do,
        COALESCE(hsg.gia_kwh, 0) as gia_kwh,
        COALESCE(AVG(dg.diem_so), 0) as diem_trung_binh,
        COUNT(DISTINCT dg.id_danh_gia) as so_danh_gia,
        ARRAY_AGG(DISTINCT lcs.ma_cong) FILTER (WHERE lcs.ma_cong IS NOT NULL) as loai_cong,
        COUNT(cs.id_cong_sac) as tong_cong,
        COUNT(CASE WHEN cs.trang_thai = 'trong' THEN 1 END) as cong_trong,
        COALESCE(hsg.phi_cho_phut, 0) as phi_cho_phut
      FROM tram_sac ts
        LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
        LEFT JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
        LEFT JOIN lich_su_gia_tram hsg 
               ON hsg.id_tram = ts.id_tram
              AND hsg.hieu_luc_tu <= NOW()
              AND (hsg.hieu_luc_den IS NULL OR hsg.hieu_luc_den >= NOW())
              AND hsg.trang_thai='active'
        LEFT JOIN danh_gia dg ON dg.id_tram = ts.id_tram
      WHERE ts.trang_thai_duyet = 'approved'
    `;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Filter by connector type
    if (connector) {
      conditions.push(`lcs.ma_cong = $${paramIndex++}`);
      values.push(connector);
    }

    // Filter by max price
    if (maxPrice) {
      conditions.push(`COALESCE(hsg.gia_kwh, 0) <= $${paramIndex++}`);
      values.push(maxPrice);
    }

    const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';

    const fullQuery = `
      ${query}
      ${whereClause}
      GROUP BY ts.id_tram, ts.ten_tram, ts.dia_chi, ts.kinh_do, ts.vi_do, hsg.gia_kwh, hsg.phi_cho_phut
      HAVING COUNT(cs.id_cong_sac) > 0
    `;

    logger.query(fullQuery, values);

    const result = await pool.query(fullQuery, values);
    let stations = result.rows;

    logger.success(`Found ${stations.length} stations`);

    // Calculate distance and filter by radius if lat/lng provided
    if (lat && lng) {
      stations = stations
        .map((station) => {
          const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            station.vi_do,
            station.kinh_do
          );
          // Use Vietnamese field name to match frontend transform
          return {
            ...station,
            khoang_cach_km: parseFloat(distance.toFixed(2)),
          };
        })
        .filter((station) => station.khoang_cach_km <= parseFloat(radius));

      logger.debug(`Filtered to ${stations.length} stations within ${radius}km`);

      // Sort by distance
      stations.sort((a, b) => (a.khoang_cach_km || 0) - (b.khoang_cach_km || 0));
    }

    // Filter by minimum rating
    if (minRating > 0) {
      stations = stations.filter((s) => s.diem_trung_binh >= parseFloat(minRating));
      logger.debug(`Filtered to ${stations.length} stations with rating >= ${minRating}`);
    }

    return stations;
  } catch (error) {
    logger.error('Get Stations Error', error);
    throw error;
  }
}

/**
 * Get Station by ID
 */
export async function getStationById(id) {
  try {
    logger.debug(`Get Station by ID: ${id}`);

    const query = `
      SELECT
        ts.*,
        COALESCE(hsg.gia_kwh, 0) as gia_kwh,
        COALESCE(AVG(dg.diem_so), 0) as diem_trung_binh,
        COUNT(DISTINCT dg.id_danh_gia) as so_danh_gia,
        COUNT(cs.id_cong_sac) as tong_cong,
        COUNT(CASE WHEN cs.trang_thai = 'trong' THEN 1 END) as cong_trong
      FROM tram_sac ts
        LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
        LEFT JOIN lich_su_gia_tram hsg 
               ON hsg.id_tram = ts.id_tram
              AND hsg.hieu_luc_tu <= NOW()
              AND (hsg.hieu_luc_den IS NULL OR hsg.hieu_luc_den >= NOW())
              AND hsg.trang_thai='active'
        LEFT JOIN danh_gia dg ON dg.id_tram = ts.id_tram
      WHERE ts.id_tram = $1
      GROUP BY ts.id_tram, hsg.gia_kwh
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    logger.error(`Get Station ${id} Error`, error);
    throw error;
  }
}

