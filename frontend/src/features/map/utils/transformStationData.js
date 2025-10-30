/**
 * Transform station data from API response to frontend format
 * Maps Vietnamese database field names to English frontend field names
 */
export const transformStationData = (apiStation) => {
  if (!apiStation) return null;

  // Determine status based on available ports
  let status = 'offline';
  if (apiStation.cong_trong > 0) {
    const availabilityRatio = apiStation.cong_trong / apiStation.tong_cong;
    if (availabilityRatio > 0.5) {
      status = 'available';
    } else if (availabilityRatio > 0) {
      status = 'busy';
    }
  }

  // Transform connector types to frontend format
  const connectors = [];
  if (apiStation.loai_cong && Array.isArray(apiStation.loai_cong)) {
    apiStation.loai_cong.forEach((type) => {
      connectors.push({
        type: type,
        power: 50, // Default power, can be enhanced later
        available: Math.floor(apiStation.cong_trong / apiStation.loai_cong.length),
        total: Math.floor(apiStation.tong_cong / apiStation.loai_cong.length),
      });
    });
  }

  // If no connectors, create a default one
  if (connectors.length === 0) {
    connectors.push({
      type: 'Type2',
      power: 50,
      available: apiStation.cong_trong || 0,
      total: apiStation.tong_cong || 0,
    });
  }

  return {
    // IDs
    id: apiStation.id_tram,
    id_tram: apiStation.id_tram,

    // Basic info
    name: apiStation.ten_tram,
    ten_tram: apiStation.ten_tram,
    address: apiStation.dia_chi,
    dia_chi: apiStation.dia_chi,

    // Location
    position: [apiStation.vi_do, apiStation.kinh_do],
    lat: apiStation.vi_do,
    lng: apiStation.kinh_do,
    vi_do: apiStation.vi_do,
    kinh_do: apiStation.kinh_do,

    // Distance - ✅ FIX: Safe toFixed with null check
    distance: apiStation.khoang_cach_km != null
      ? parseFloat(Number(apiStation.khoang_cach_km).toFixed(1))
      : 0,
    khoang_cach_km: apiStation.khoang_cach_km,

    // Pricing
    price: parseFloat(apiStation.gia_kwh || 0),
    gia_kwh: apiStation.gia_kwh,
    phi_cho_phut: apiStation.phi_cho_phut,

    // Availability
    status: status,
    trang_thai: status,
    connectors: connectors,
    loai_cong: apiStation.loai_cong,
    tong_cong: apiStation.tong_cong,
    cong_trong: apiStation.cong_trong,
    availableConnectors: apiStation.cong_trong || 0,
    totalConnectors: apiStation.tong_cong || 0,

    // Rating - ✅ FIX: Safe toFixed with default value
    rating: apiStation.diem_trung_binh != null
      ? parseFloat(Number(apiStation.diem_trung_binh).toFixed(1))
      : 0,
    diem_trung_binh: apiStation.diem_trung_binh,
    reviews: apiStation.so_danh_gia || 0,
    so_danh_gia: apiStation.so_danh_gia,

    // AI Score (if available)
    ai_score: apiStation.ai_score,
    ai_breakdown: apiStation.ai_breakdown,
    reasons: apiStation.reasons || [],

    // User history
    user_history: apiStation.user_history || 0,

    // Default values for missing fields
    openHours: '24/7', // Can be enhanced later with real data
    provider: 'ChargeEVDN',
  };
};

/**
 * Transform array of stations
 */
export const transformStationsArray = (apiStations) => {
  if (!Array.isArray(apiStations)) return [];
  return apiStations.map(transformStationData).filter(Boolean);
};

