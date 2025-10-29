/**
 * Mock data cho các trạm sạc xe điện tại Đà Nẵng
 * Sẽ được thay thế bằng API calls trong production
 */

export const mockStations = [
  {
    id: 1,
    name: 'Trạm Sạc Cao Thắng',
    address: '48 Cao Thắng, Thanh Bình, Hải Châu, Đà Nẵng',
    position: [16.0775118, 108.2127375],
    provider: 'VinFast',
    status: 'available', // available, busy, maintenance, offline
    connectors: [
      { type: 'CCS2', power: 50, available: 2, total: 4 },
      { type: 'Type 2', power: 22, available: 1, total: 2 },
    ],
    price: 4500, // VNĐ/kWh
    rating: 4.8,
    reviews: 120,
    openHours: '24/7',
    amenities: ['wifi', 'parking', 'cafe', 'restroom'],
    distance: 0.5, // km
    image: '/images/stations/cao-thang.jpg',
  },
  {
    id: 2,
    name: 'Trạm Sạc Vincom Đà Nẵng',
    address: '910-912 Ngô Quyền, An Hải Bắc, Sơn Trà, Đà Nẵng',
    position: [16.0599, 108.2295],
    provider: 'VinFast',
    status: 'busy',
    connectors: [
      { type: 'CCS2', power: 60, available: 0, total: 3 },
      { type: 'Type 2', power: 22, available: 1, total: 3 },
    ],
    price: 5000,
    rating: 4.6,
    reviews: 85,
    openHours: '08:00 - 22:00',
    amenities: ['wifi', 'parking', 'shopping', 'restroom'],
    distance: 2.5,
    image: '/images/stations/vincom.jpg',
  },
  {
    id: 3,
    name: 'Trạm Sạc Lotte Mart',
    address: '6 Nại Nam, Hòa Cường Bắc, Hải Châu, Đà Nẵng',
    position: [16.0472, 108.2087],
    provider: 'EVN',
    status: 'available',
    connectors: [
      { type: 'Type 2', power: 22, available: 3, total: 4 },
      { type: 'CHAdeMO', power: 50, available: 1, total: 2 },
    ],
    price: 4800,
    rating: 4.5,
    reviews: 67,
    openHours: '07:00 - 23:00',
    amenities: ['wifi', 'parking', 'shopping', 'food'],
    distance: 3.2,
    image: '/images/stations/lotte.jpg',
  },
  {
    id: 4,
    name: 'Trạm Sạc Sân Bay Đà Nẵng',
    address: 'Sân bay quốc tế Đà Nẵng, Hòa Thuận Tây, Hải Châu',
    position: [16.0439, 108.1986],
    provider: 'ACV',
    status: 'available',
    connectors: [
      { type: 'CCS2', power: 100, available: 2, total: 2 },
      { type: 'Type 2', power: 22, available: 2, total: 2 },
    ],
    price: 5500,
    rating: 4.7,
    reviews: 95,
    openHours: '24/7',
    amenities: ['wifi', 'parking', 'restroom', 'lounge'],
    distance: 4.1,
    image: '/images/stations/airport.jpg',
  },
  {
    id: 5,
    name: 'Trạm Sạc BigC Đà Nẵng',
    address: '255-257 Hùng Vương, Vĩnh Trung, Thanh Khê, Đà Nẵng',
    position: [16.0697, 108.1917],
    provider: 'EVN',
    status: 'available',
    connectors: [{ type: 'Type 2', power: 22, available: 4, total: 5 }],
    price: 4200,
    rating: 4.4,
    reviews: 52,
    openHours: '08:00 - 22:00',
    amenities: ['wifi', 'parking', 'shopping', 'food'],
    distance: 4.8,
    image: '/images/stations/bigc.jpg',
  },
  {
    id: 6,
    name: 'Trạm Sạc Phạm Văn Đồng',
    address: '123 Phạm Văn Đồng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng',
    position: [16.0717, 108.1567],
    provider: 'VinFast',
    status: 'available',
    connectors: [{ type: 'CCS2', power: 50, available: 3, total: 4 }],
    price: 4600,
    rating: 4.3,
    reviews: 38,
    openHours: '24/7',
    amenities: ['wifi', 'parking'],
    distance: 5.5,
    image: '/images/stations/pham-van-dong.jpg',
  },
  {
    id: 7,
    name: 'Trạm Sạc Nguyễn Tất Thành',
    address: '456 Nguyễn Tất Thành, Thanh Bình, Hải Châu, Đà Nẵng',
    position: [16.065, 108.241],
    provider: 'Shell',
    status: 'maintenance',
    connectors: [
      { type: 'CCS2', power: 150, available: 0, total: 2 },
      { type: 'Type 2', power: 43, available: 0, total: 2 },
    ],
    price: 6000,
    rating: 4.9,
    reviews: 145,
    openHours: 'Tạm đóng',
    amenities: ['wifi', 'parking', 'cafe', 'restroom', 'shop'],
    distance: 2.8,
    image: '/images/stations/ntt.jpg',
  },
  {
    id: 8,
    name: 'Trạm Sạc Ngũ Hành Sơn',
    address: 'Đường Huyền Trân Công Chúa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
    position: [16.0006, 108.2587],
    provider: 'EVN',
    status: 'available',
    connectors: [
      { type: 'Type 2', power: 22, available: 2, total: 3 },
      { type: 'CHAdeMO', power: 50, available: 1, total: 1 },
    ],
    price: 4700,
    rating: 4.5,
    reviews: 78,
    openHours: '06:00 - 20:00',
    amenities: ['parking', 'restroom'],
    distance: 6.2,
    image: '/images/stations/ngu-hanh-son.jpg',
  },
  {
    id: 9,
    name: 'Trạm Sạc Mỹ An',
    address: 'Võ Nguyên Giáp, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng',
    position: [16.0255, 108.2494],
    provider: 'VinFast',
    status: 'busy',
    connectors: [
      { type: 'CCS2', power: 50, available: 1, total: 4 },
      { type: 'Type 2', power: 22, available: 0, total: 2 },
    ],
    price: 5200,
    rating: 4.7,
    reviews: 92,
    openHours: '24/7',
    amenities: ['wifi', 'parking', 'beach', 'cafe'],
    distance: 3.5,
    image: '/images/stations/my-an.jpg',
  },
  {
    id: 10,
    name: 'Trạm Sạc Indochina Riverside',
    address: '74 Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng',
    position: [16.0678, 108.223],
    provider: 'VinFast',
    status: 'available',
    connectors: [
      { type: 'CCS2', power: 60, available: 2, total: 3 },
      { type: 'Type 2', power: 22, available: 2, total: 2 },
    ],
    price: 5300,
    rating: 4.8,
    reviews: 110,
    openHours: '24/7',
    amenities: ['wifi', 'parking', 'hotel', 'restaurant', 'restroom'],
    distance: 1.2,
    image: '/images/stations/indochina.jpg',
  },
  {
    id: 11,
    name: 'Trạm Sạc Hòa Khánh',
    address: 'Lê Văn Hiến, Hòa Khánh Nam, Liên Chiểu, Đà Nẵng',
    position: [16.0583, 108.1667],
    provider: 'EVN',
    status: 'available',
    connectors: [{ type: 'Type 2', power: 22, available: 5, total: 6 }],
    price: 4100,
    rating: 4.2,
    reviews: 45,
    openHours: '24/7',
    amenities: ['parking'],
    distance: 7.1,
    image: '/images/stations/hoa-khanh.jpg',
  },
  {
    id: 12,
    name: 'Trạm Sạc Cầu Rồng',
    address: 'Cầu Rồng, Hải Châu, Đà Nẵng',
    position: [16.0609, 108.2272],
    provider: 'VinFast',
    status: 'available',
    connectors: [
      { type: 'CCS2', power: 50, available: 3, total: 4 },
      { type: 'Type 2', power: 22, available: 2, total: 2 },
    ],
    price: 4900,
    rating: 4.6,
    reviews: 88,
    openHours: '24/7',
    amenities: ['wifi', 'parking', 'scenic'],
    distance: 2.1,
    image: '/images/stations/cau-rong.jpg',
  },
  {
    id: 13,
    name: 'Trạm Sạc Lê Duẩn',
    address: '234 Lê Duẩn, Tân Chính, Thanh Khê, Đà Nẵng',
    position: [16.061, 108.201],
    provider: 'Shell',
    status: 'available',
    connectors: [
      { type: 'CCS2', power: 100, available: 1, total: 2 },
      { type: 'Type 2', power: 22, available: 1, total: 2 },
    ],
    price: 5800,
    rating: 4.7,
    reviews: 73,
    openHours: '24/7',
    amenities: ['wifi', 'parking', 'shop', 'restroom'],
    distance: 3.8,
    image: '/images/stations/le-duan.jpg',
  },
  {
    id: 14,
    name: 'Trạm Sạc Xuân Hà',
    address: 'Nguyễn Văn Linh, Hòa Xuân, Cẩm Lệ, Đà Nẵng',
    position: [16.015, 108.175],
    provider: 'EVN',
    status: 'offline',
    connectors: [{ type: 'Type 2', power: 22, available: 0, total: 4 }],
    price: 4300,
    rating: 3.9,
    reviews: 28,
    openHours: 'Tạm đóng',
    amenities: ['parking'],
    distance: 8.5,
    image: '/images/stations/xuan-ha.jpg',
  },
  {
    id: 15,
    name: 'Trạm Sạc Hòa Minh',
    address: 'Tôn Đức Thắng, Hòa Minh, Liên Chiểu, Đà Nẵng',
    position: [16.0267, 108.145],
    provider: 'VinFast',
    status: 'available',
    connectors: [{ type: 'CCS2', power: 50, available: 4, total: 4 }],
    price: 4400,
    rating: 4.4,
    reviews: 56,
    openHours: '24/7',
    amenities: ['wifi', 'parking'],
    distance: 9.2,
    image: '/images/stations/hoa-minh.jpg',
  },
];

/**
 * Get stations filtered by criteria
 */
export function filterStations(stations, filters) {
  return stations.filter((station) => {
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'available' && station.status !== 'available') {
        return false;
      }
    }

    // Filter by connector type
    if (filters.connectorType && filters.connectorType !== 'all') {
      const hasConnector = station.connectors.some(
        (c) => c.type === filters.connectorType
      );
      if (!hasConnector) return false;
    }

    // Filter by price
    if (filters.maxPrice) {
      if (station.price > filters.maxPrice) return false;
    }

    // Filter by distance
    if (filters.maxDistance) {
      if (station.distance > filters.maxDistance) return false;
    }

    // Filter by provider
    if (filters.provider && filters.provider !== 'all') {
      if (station.provider !== filters.provider) return false;
    }

    return true;
  });
}

/**
 * Sort stations by criteria
 */
export function sortStations(stations, sortBy) {
  const sorted = [...stations];

  switch (sortBy) {
    case 'distance':
      return sorted.sort((a, b) => a.distance - b.distance);
    case 'price':
      return sorted.sort((a, b) => a.price - b.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'availability':
      return sorted.sort((a, b) => {
        const aAvailable = a.connectors.reduce(
          (sum, c) => sum + c.available,
          0
        );
        const bAvailable = b.connectors.reduce(
          (sum, c) => sum + c.available,
          0
        );
        return bAvailable - aAvailable;
      });
    default:
      return sorted;
  }
}

/**
 * Get AI recommended stations (top 3)
 * Based on: distance, price, availability, rating
 */
export function getAIRecommendations(stations, userPreferences = {}) {
  const scored = stations
    .filter((s) => s.status === 'available')
    .map((station) => {
      let score = 0;

      // Distance score (closer is better, max 30 points)
      const distanceScore = Math.max(0, 30 - station.distance * 3);
      score += distanceScore;

      // Price score (cheaper is better, max 25 points)
      const priceScore = Math.max(0, 25 - (station.price - 4000) / 100);
      score += priceScore;

      // Availability score (more slots available, max 25 points)
      const availableSlots = station.connectors.reduce(
        (sum, c) => sum + c.available,
        0
      );
      score += Math.min(25, availableSlots * 5);

      // Rating score (max 20 points)
      score += station.rating * 4;

      // Bonus for preferred connector type
      if (userPreferences.connectorType) {
        const hasPreferredConnector = station.connectors.some(
          (c) => c.type === userPreferences.connectorType
        );
        if (hasPreferredConnector) score += 10;
      }

      return { ...station, aiScore: score };
    });

  // Sort by AI score and return top 3
  return scored.sort((a, b) => b.aiScore - a.aiScore).slice(0, 3);
}
