# ChargeEVDN - Hệ thống quản lý trạm sạc xe điện

Dự án đồ án tốt nghiệp: Hệ thống tìm kiếm, đặt chỗ và quản lý trạm sạc xe điện.

## 🚀 Tech Stack

**Backend:**

- Node.js + Express (JavaScript)
- PostgreSQL
- JWT Authentication
- VNPAY Payment Integration

**Frontend:**

- React 18 + Vite
- Tailwind CSS + shadcn/ui
- Axios + React Router
- Zustand (State Management)

**DevOps:**

- Docker + Docker Compose
- PostgreSQL + pgAdmin

## 📁 Cấu trúc dự án

```
ChargeEVDN/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── user/        # User management
│   │   │   ├── station/     # Charging stations
│   │   │   ├── booking/     # Booking system
│   │   │   ├── payment/     # Payment processing
│   │   │   └── ...
│   │   ├── middlewares/     # Express middlewares
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   └── sql/                 # Database schema
├── frontend/                # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   └── stores/          # State management
└── docker/                  # Docker configuration
```

## 🛠️ Setup & Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd ChargeEVDN
```

### 2. Setup Backend

```bash
cd backend
npm install
cp env.example .env
# Chỉnh sửa file .env với thông tin database và API keys
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

### 4. Setup Database với Docker

```bash
# Khởi động PostgreSQL và pgAdmin
docker-compose up -d postgres pgadmin

# Truy cập pgAdmin: http://localhost:5050
# Email: admin@chargeevdn.local
# Password: admin123
```

### 5. Import Database Schema

```bash
# Kết nối vào PostgreSQL và chạy file schema
psql -h localhost -U postgres -d charge_evdn -f backend/sql/ev_schema.sql
```

## 🚀 Development

### Chạy Backend

```bash
cd backend
npm run dev
# Server chạy tại: http://localhost:8080
```

### Chạy Frontend

```bash
cd frontend
npm run dev
# Frontend chạy tại: http://localhost:5173
```

### Chạy cả hai cùng lúc

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## 🔧 Configuration

### Backend Environment Variables

Copy `backend/env.example` thành `backend/.env` và cập nhật:

```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/charge_evdn
JWT_SECRET=your_secret_key
VNPAY_TMN_CODE=your_vnpay_code
VNPAY_HASH_SECRET=your_vnpay_secret
```

### Frontend Environment Variables

Tạo `frontend/.env`:

```env
VITE_API_BASE=http://localhost:8080
```

## 📊 Database

Database gồm 13 bảng chính:

- `nguoi_dung` - Người dùng
- `doanh_nghiep` - Doanh nghiệp/chủ trạm
- `tram_sac` - Trạm sạc
- `cong_sac` - Cổng sạc
- `dat_cho` - Đặt chỗ
- `phien_sac` - Phiên sạc
- `thanh_toan` - Thanh toán
- `hoa_don` - Hóa đơn
- `danh_gia` - Đánh giá
- ... và các bảng khác

## 🎯 Features

### 👤 Người dùng xe điện

- ✅ Đăng ký/Đăng nhập
- ✅ Quản lý phương tiện
- ✅ Tìm kiếm trạm sạc
- ✅ Đặt chỗ trạm sạc
- ✅ Thanh toán VNPAY
- ✅ Xem lịch sử & hóa đơn
- ✅ Đánh giá trạm

### 🏢 Chủ trạm sạc (Owner)

- ✅ Quản lý trạm sạc
- ✅ Quản lý lịch đặt chỗ
- ✅ Xem phiên sạc
- ✅ Báo cáo doanh thu
- ✅ Quản lý đánh giá

### 🛡️ Admin

- ✅ Quản lý tài khoản
- ✅ Kiểm duyệt trạm mới
- ✅ Dashboard tổng quan
- ✅ Nhật ký hệ thống

### 👥 Khách vãng lai

- ✅ Xem bản đồ trạm
- ✅ Tạo phiên sạc (QR)
- ✅ Thanh toán
- ✅ Nhận hóa đơn

## 🔗 API Endpoints

```
/api/auth          # Authentication
/api/users         # User management
/api/stations      # Charging stations
/api/bookings      # Booking system
/api/sessions      # Charging sessions
/api/payments      # Payment processing
/api/reviews       # Reviews & ratings
```

## 📱 Screenshots

_TODO: Thêm screenshots khi hoàn thành UI_

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**[Your Name]**

- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

⚡ **ChargeEVDN** - Tương lai của việc sạc xe điện tại Việt Nam!
