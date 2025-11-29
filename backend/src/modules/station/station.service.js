/**
 * Station Service
 * Business logic for station-related operations
 */

import { pool } from '../../config/db.js';
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
    console.log('🔵 BACKEND STATION SERVICE: Get Stations Request', params);
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

    console.log('🔵 BACKEND STATION SERVICE: Executing query...');
    console.log('🔵 BACKEND STATION SERVICE: Full query:', fullQuery);
    console.log('🔵 BACKEND STATION SERVICE: Query values:', values);
    
    const result = await pool.query(fullQuery, values);
    let stations = result.rows;

    console.log('✅ BACKEND STATION SERVICE: Query result - Found', stations.length, 'stations');
    if (stations.length > 0) {
      console.log('✅ BACKEND STATION SERVICE: First station sample:', stations[0]);
    } else {
      console.log('⚠️ BACKEND STATION SERVICE: No stations found in database query!');
    }
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

      console.log(`✅ BACKEND STATION SERVICE: Filtered to ${stations.length} stations within ${radius}km`);
      logger.debug(`Filtered to ${stations.length} stations within ${radius}km`);

      // Sort by distance
      stations.sort((a, b) => (a.khoang_cach_km || 0) - (b.khoang_cach_km || 0));
    }

    // Filter by minimum rating
    if (minRating > 0) {
      stations = stations.filter((s) => s.diem_trung_binh >= parseFloat(minRating));
      console.log(`✅ BACKEND STATION SERVICE: Filtered to ${stations.length} stations with rating >= ${minRating}`);
      logger.debug(`Filtered to ${stations.length} stations with rating >= ${minRating}`);
    }

    console.log('✅ BACKEND STATION SERVICE: Final result - Returning', stations.length, 'stations');
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

/**
 * Get Station Detail (Full information)
 */
export async function getStationDetail(id) {
  try {
    logger.debug(`Get Station Detail: ${id}`);

    // Main station info (only existing columns in schema)
    const stationQuery = `
      SELECT
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi,
        ts.kinh_do,
        ts.vi_do,
        COALESCE(AVG(dg.diem_so), 0) as diem_trung_binh,
        COUNT(DISTINCT dg.id_danh_gia) as so_danh_gia,
        COALESCE(hsg.gia_kwh, 0) as gia_kwh,
        COALESCE(hsg.phi_cho_phut, 0) as phi_cho_phut
      FROM tram_sac ts
        LEFT JOIN lich_su_gia_tram hsg 
               ON hsg.id_tram = ts.id_tram
              AND hsg.hieu_luc_tu <= NOW()
              AND (hsg.hieu_luc_den IS NULL OR hsg.hieu_luc_den >= NOW())
              AND hsg.trang_thai='active'
        LEFT JOIN danh_gia dg ON dg.id_tram = ts.id_tram
      WHERE ts.id_tram = $1
      GROUP BY ts.id_tram, hsg.gia_kwh, hsg.phi_cho_phut
    `;

    const stationResult = await pool.query(stationQuery, [id]);

    if (stationResult.rows.length === 0) {
      return null;
    }

    const station = stationResult.rows[0];

    // Get connectors with details (only existing columns)
    const connectorsQuery = `
      SELECT
        lcs.ma_cong as loai_cong,
        lcs.mo_ta,
        cs.cong_suat_kwh,
        COUNT(cs.id_cong_sac) as tong_cong,
        COUNT(CASE WHEN cs.trang_thai = 'trong' THEN 1 END) as cong_trong,
        COUNT(CASE WHEN cs.trang_thai = 'dang_su_dung' THEN 1 END) as dang_su_dung,
        COUNT(CASE WHEN cs.trang_thai = 'bao_tri' THEN 1 END) as bao_tri,
        MIN(CASE WHEN cs.trang_thai = 'trong' THEN cs.id_cong_sac END) as id_cong_sac
      FROM cong_sac cs
        JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      WHERE cs.id_tram = $1
      GROUP BY lcs.ma_cong, lcs.mo_ta, cs.cong_suat_kwh
      ORDER BY cs.cong_suat_kwh DESC
    `;

    const connectorsResult = await pool.query(connectorsQuery, [id]);

    // Get images (if hinh_anh table exists)
    const imagesQuery = `
      SELECT url_hinh_anh
      FROM hinh_anh
      WHERE id_doi_tuong = $1 AND loai_doi_tuong = 'station'
      ORDER BY thu_tu
    `;

    let images = [];
    try {
      const imagesResult = await pool.query(imagesQuery, [id]);
      images = imagesResult.rows.map((row) => row.url_hinh_anh);
    } catch (err) {
      // If hinh_anh table doesn't exist, just skip
      logger.debug('Images table not found or error fetching images');
    }

    return {
      ...station,
      connectors: connectorsResult.rows,
      images,
    };
  } catch (error) {
    logger.error(`Get Station Detail ${id} Error`, error);
    throw error;
  }
}

