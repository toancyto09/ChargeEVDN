/**
 * Vehicle Module Constants
 * Định nghĩa các hằng số cho module quản lý phương tiện
 */

export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const VALIDATION_RULES = {
  HANG_XE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 80,
  },
  DONG_XE: {
    MAX_LENGTH: 120,
  },
  BIEN_SO: {
    MAX_LENGTH: 20,
    PATTERN: /^[0-9]{2}[A-Z]{1,2}[-\s]?[0-9]{4,5}$/i, // VD: 51F-12345
  },
  MAU_XE: {
    MAX_LENGTH: 50,
  },
  NAM_SAN_XUAT: {
    MIN: 1990,
    MAX: new Date().getFullYear() + 1,
  },
  DUNG_LUONG_PIN: {
    MIN: 10, // kWh
    MAX: 200, // kWh
  },
  CONG_SUAT_SAC: {
    MIN: 3, // kW
    MAX: 350, // kW
  },
  SOC: {
    MIN: 0,
    MAX: 100,
  },
};

export const ERROR_MESSAGES = {
  VEHICLE_NOT_FOUND: 'Không tìm thấy phương tiện',
  UNAUTHORIZED: 'Bạn không có quyền truy cập phương tiện này',
  INVALID_CONNECTOR_TYPE: 'Loại cổng sạc không hợp lệ',
  INVALID_BIEN_SO: 'Biển số xe không hợp lệ',
  INVALID_NAM_SAN_XUAT: `Năm sản xuất phải từ ${VALIDATION_RULES.NAM_SAN_XUAT.MIN} đến ${VALIDATION_RULES.NAM_SAN_XUAT.MAX}`,
  INVALID_DUNG_LUONG_PIN: `Dung lượng pin phải từ ${VALIDATION_RULES.DUNG_LUONG_PIN.MIN} đến ${VALIDATION_RULES.DUNG_LUONG_PIN.MAX} kWh`,
  INVALID_SOC: `SOC phải từ ${VALIDATION_RULES.SOC.MIN} đến ${VALIDATION_RULES.SOC.MAX}%`,
  CANNOT_DELETE_MAIN_VEHICLE: 'Không thể xóa xe chính. Vui lòng đặt xe khác làm xe chính trước.',
  MAIN_VEHICLE_ALREADY_EXISTS: 'Đã có xe chính. Vui lòng bỏ đặt xe chính hiện tại trước.',
};

export const SUCCESS_MESSAGES = {
  VEHICLE_CREATED: 'Thêm phương tiện thành công',
  VEHICLE_UPDATED: 'Cập nhật phương tiện thành công',
  VEHICLE_DELETED: 'Xóa phương tiện thành công',
  SOC_UPDATED: 'Cập nhật mức pin thành công',
  MAIN_VEHICLE_SET: 'Đã đặt làm xe chính',
};

// Danh sách hãng xe phổ biến
export const POPULAR_BRANDS = [
  'VinFast',
  'Tesla',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Hyundai',
  'Kia',
  'Nissan',
  'BYD',
  'Porsche',
  'Volvo',
  'Polestar',
  'MG',
  'Khác',
];

// Màu xe phổ biến
export const POPULAR_COLORS = [
  'Trắng',
  'Đen',
  'Xám',
  'Bạc',
  'Đỏ',
  'Xanh dương',
  'Xanh lá',
  'Vàng',
  'Nâu',
  'Khác',
];

