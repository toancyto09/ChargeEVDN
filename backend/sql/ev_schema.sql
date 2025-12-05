-- ==============================================
-- ========== 1. ENUM DEFINITIONS =================
-- ==============================================

CREATE TYPE cong_trang_thai_enum AS ENUM ('trong', 'dang_su_dung', 'bao_tri');

CREATE TYPE dat_cho_status_enum AS ENUM 
('cho_xac_nhan', 'da_xac_nhan', 'dang_su_dung', 'hoan_thanh', 'huy');

CREATE TYPE nguon_huy_enum AS ENUM ('nguoi_dung', 'chu_so_huu', 'he_thong');

CREATE TYPE user_role_enum AS ENUM ('user', 'owner', 'admin');

CREATE TYPE gender_enum AS ENUM ('nam', 'nu', 'khac');

CREATE TYPE account_status_enum AS ENUM ('hoat_dong', 'khoa', 'cho_xac_thuc');

CREATE TYPE pay_status_enum AS ENUM ('pending', 'success', 'failed');

CREATE TYPE tram_duyet_enum AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE phien_status_enum AS ENUM 
('dang_sac', 'hoan_thanh', 'huy', 'loi', 'cho_xac_nhan');

CREATE TYPE nguon_khoi_tao_enum AS ENUM ('dat_cho', 'tu_dong');



-- ==============================================
-- ========== 2. TABLE DEFINITIONS ================
-- ==============================================


--------------------------------------------------
-- 1. loai_cong_sac
--------------------------------------------------
CREATE TABLE public.loai_cong_sac (
  id_loai_cong BIGSERIAL PRIMARY KEY,
  ma_cong VARCHAR(30) NOT NULL UNIQUE,
  mo_ta VARCHAR(100)
);


--------------------------------------------------
-- 2. doanh_nghiep
--------------------------------------------------
CREATE TABLE public.doanh_nghiep (
  id_doanh_nghiep BIGSERIAL PRIMARY KEY,
  id_chu_so_huu BIGINT,
  ten_doanh_nghiep VARCHAR(200) NOT NULL,
  dia_chi VARCHAR(255),
  email_lien_he VARCHAR(120) UNIQUE,
  so_dien_thoai VARCHAR(20),
  trang_thai VARCHAR(20) DEFAULT 'active',
  ngay_tao TIMESTAMPTZ DEFAULT NOW()
);


--------------------------------------------------
-- 3. nguoi_dung
--------------------------------------------------
CREATE TABLE public.nguoi_dung (
  id_nguoi_dung BIGSERIAL PRIMARY KEY,
  ho_ten VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  mat_khau VARCHAR(200),
  so_dien_thoai VARCHAR(20) UNIQUE,
  gioi_tinh gender_enum,
  ngay_sinh DATE,
  vai_tro user_role_enum NOT NULL,
  trang_thai account_status_enum DEFAULT 'hoat_dong' NOT NULL,
  ngay_tao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ma_xac_thuc VARCHAR(6),
  han_ma_xac_thuc TIMESTAMPTZ,
  id_tai_khoan_google VARCHAR(255),
  duong_dan_anh_dai_dien TEXT
);


--------------------------------------------------
-- 4. tram_sac
--------------------------------------------------
CREATE TABLE public.tram_sac (
  id_tram BIGSERIAL PRIMARY KEY,
  id_doanh_nghiep BIGINT NOT NULL,
  ten_tram VARCHAR(150) NOT NULL,
  dia_chi VARCHAR(255) NOT NULL,
  kinh_do NUMERIC(10,6) NOT NULL,
  vi_do NUMERIC(10,6) NOT NULL,
  trang_thai_duyet tram_duyet_enum DEFAULT 'pending' NOT NULL,
  id_nguoi_duyet BIGINT,
  ly_do_tu_choi TEXT,
  ngay_duyet TIMESTAMPTZ,
  phut_den_tre INTEGER DEFAULT 5 NOT NULL,
  ngay_tao TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


--------------------------------------------------
-- 5. cong_sac
--------------------------------------------------
CREATE TABLE public.cong_sac (
  id_cong_sac BIGSERIAL PRIMARY KEY,
  id_tram BIGINT NOT NULL,
  ma_cong_tram VARCHAR(50) NOT NULL,
  id_loai_cong BIGINT NOT NULL,
  cong_suat_kwh NUMERIC(6,2) NOT NULL,
  trang_thai cong_trang_thai_enum DEFAULT 'trong' NOT NULL,
  ngay_tao TIMESTAMPTZ DEFAULT NOW()
);


--------------------------------------------------
-- 6. phuong_tien
--------------------------------------------------
CREATE TABLE public.phuong_tien (
  id_phuong_tien BIGSERIAL PRIMARY KEY,
  id_nguoi_dung BIGINT NOT NULL,
  id_loai_cong BIGINT NOT NULL,
  hang_xe VARCHAR(80) NOT NULL,
  dong_xe VARCHAR(120),
  dung_luong_pin_kwh NUMERIC(6,2),
  ngay_tao TIMESTAMPTZ DEFAULT NOW(),
  bien_so VARCHAR(20),
  mau_xe VARCHAR(50),
  nam_san_xuat INTEGER,
  cong_suat_sac_toi_da NUMERIC(6,2),
  trang_thai VARCHAR(20) DEFAULT 'active' NOT NULL,
  la_xe_chinh BOOLEAN DEFAULT TRUE NOT NULL,
  ngay_cap_nhat TIMESTAMPTZ DEFAULT NOW(),
  soc_hien_tai INTEGER DEFAULT 100,
  cap_nhat_soc TIMESTAMPTZ DEFAULT NOW()
);


--------------------------------------------------
-- 7. dat_cho
--------------------------------------------------
CREATE TABLE public.dat_cho (
  id_dat_cho BIGSERIAL PRIMARY KEY,
  id_nguoi_dung BIGINT NOT NULL,
  id_phuong_tien BIGINT NOT NULL,
  id_cong_sac BIGINT NOT NULL,
  thoi_gian_bat_dau TIMESTAMPTZ NOT NULL,
  thoi_gian_ket_thuc TIMESTAMPTZ NOT NULL,
  het_han TIMESTAMPTZ NOT NULL,
  trang_thai dat_cho_status_enum DEFAULT 'cho_xac_nhan' NOT NULL,
  uoc_tinh_kwh NUMERIC(10,3),
  uoc_tinh_chi_phi NUMERIC(12,2),
  ma_xac_nhan VARCHAR(50) NOT NULL UNIQUE,
  id_nguoi_huy BIGINT,
  nguon_huy nguon_huy_enum,
  ngay_tao TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


--------------------------------------------------
-- 8. phien_sac
--------------------------------------------------
CREATE TABLE public.phien_sac (
  id_phien_sac BIGSERIAL PRIMARY KEY,
  id_dat_cho BIGINT,
  id_cong_sac BIGINT NOT NULL,
  thoi_gian_bat_dau TIMESTAMPTZ,
  thoi_gian_ket_thuc TIMESTAMPTZ,
  soc_truoc INTEGER,
  soc_sau INTEGER,
  dien_nang_kwh NUMERIC(10,3),
  don_gia_kwh NUMERIC(12,2),
  phi_cho_phut NUMERIC(12,4) DEFAULT 0,
  so_phut_cho INTEGER,
  nguon_khoi_tao nguon_khoi_tao_enum DEFAULT 'dat_cho' NOT NULL,
  trang_thai phien_status_enum
);


--------------------------------------------------
-- 9. danh_gia
--------------------------------------------------
CREATE TABLE public.danh_gia (
  id_danh_gia BIGSERIAL PRIMARY KEY,
  id_tram BIGINT NOT NULL,
  id_nguoi_dung BIGINT NOT NULL,
  id_dat_cho BIGINT NOT NULL,
  diem_so INTEGER NOT NULL,
  nhan_xet TEXT,
  ngay_tao TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


--------------------------------------------------
-- 10. thanh_toan (UPDATED: Support both booking and session payments)
--------------------------------------------------
CREATE TABLE public.thanh_toan (
  id_thanh_toan BIGSERIAL PRIMARY KEY,
  id_dat_cho BIGINT,              -- Legacy: booking-based payment (nullable)
  id_phien_sac BIGINT,             -- New: session-based payment
  so_tien NUMERIC(12,2),
  phuong_thuc VARCHAR(20) DEFAULT 'VNPAY' NOT NULL,
  trang_thai pay_status_enum DEFAULT 'pending' NOT NULL,
  ma_giao_dich VARCHAR(64),
  ngay_thanh_toan TIMESTAMPTZ,
  ngay_tao TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_payment_source CHECK (
    (id_dat_cho IS NOT NULL AND id_phien_sac IS NULL) OR 
    (id_dat_cho IS NULL AND id_phien_sac IS NOT NULL)
  )
);


--------------------------------------------------
-- 11. hoa_don
--------------------------------------------------
CREATE TABLE public.hoa_don (
  id_hoa_don BIGSERIAL PRIMARY KEY,
  id_thanh_toan BIGINT NOT NULL UNIQUE,
  so_hoa_don VARCHAR(50) UNIQUE,
  duong_dan_pdf VARCHAR(255),
  thong_tin_khach_sac JSONB,
  ngay_phat_hanh TIMESTAMPTZ
);


--------------------------------------------------
-- 12. nhat_ky_he_thong
--------------------------------------------------
CREATE TABLE public.nhat_ky_he_thong (
  id_nhat_ky BIGSERIAL PRIMARY KEY,
  id_nguoi_dung BIGINT,
  hanh_dong VARCHAR(50) NOT NULL,
  chi_tiet JSONB,
  ngay_tao TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


--------------------------------------------------
-- 13. lich_su_gia_tram
--------------------------------------------------
CREATE TABLE public.lich_su_gia_tram (
  id_gia BIGSERIAL PRIMARY KEY,
  id_tram BIGINT NOT NULL,
  gia_kwh NUMERIC(12,2) NOT NULL,
  phi_cho_phut NUMERIC(12,4) DEFAULT 0 NOT NULL,
  hieu_luc_tu TIMESTAMPTZ NOT NULL,
  hieu_luc_den TIMESTAMPTZ,
  trang_thai VARCHAR(20) DEFAULT 'active'
);



-- ==============================================
-- ========== 3. FOREIGN KEYS ====================
-- ==============================================

ALTER TABLE doanh_nghiep 
  ADD CONSTRAINT fk_doanh_nghiep_chu_so_huu FOREIGN KEY (id_chu_so_huu) REFERENCES nguoi_dung(id_nguoi_dung);

ALTER TABLE tram_sac 
  ADD CONSTRAINT fk_tram_sac_doanh_nghiep FOREIGN KEY (id_doanh_nghiep) REFERENCES doanh_nghiep(id_doanh_nghiep);

ALTER TABLE tram_sac 
  ADD CONSTRAINT fk_tram_sac_nguoi_duyet FOREIGN KEY (id_nguoi_duyet) REFERENCES nguoi_dung(id_nguoi_dung);

ALTER TABLE cong_sac 
  ADD CONSTRAINT fk_cong_sac_tram FOREIGN KEY (id_tram) REFERENCES tram_sac(id_tram);

ALTER TABLE cong_sac 
  ADD CONSTRAINT fk_cong_sac_loai_cong FOREIGN KEY (id_loai_cong) REFERENCES loai_cong_sac(id_loai_cong);

ALTER TABLE phuong_tien 
  ADD CONSTRAINT fk_phuong_tien_user FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id_nguoi_dung);

ALTER TABLE phuong_tien 
  ADD CONSTRAINT fk_phuong_tien_loai_cong FOREIGN KEY (id_loai_cong) REFERENCES loai_cong_sac(id_loai_cong);

ALTER TABLE dat_cho 
  ADD CONSTRAINT fk_dat_cho_user FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id_nguoi_dung);

ALTER TABLE dat_cho 
  ADD CONSTRAINT fk_dat_cho_phuong_tien FOREIGN KEY (id_phuong_tien) REFERENCES phuong_tien(id_phuong_tien);

ALTER TABLE dat_cho 
  ADD CONSTRAINT fk_dat_cho_cong_sac FOREIGN KEY (id_cong_sac) REFERENCES cong_sac(id_cong_sac);

ALTER TABLE dat_cho 
  ADD CONSTRAINT fk_dat_cho_nguoi_huy FOREIGN KEY (id_nguoi_huy) REFERENCES nguoi_dung(id_nguoi_dung);

ALTER TABLE phien_sac 
  ADD CONSTRAINT fk_phien_sac_dat_cho FOREIGN KEY (id_dat_cho) REFERENCES dat_cho(id_dat_cho);

ALTER TABLE phien_sac 
  ADD CONSTRAINT fk_phien_sac_cong_sac FOREIGN KEY (id_cong_sac) REFERENCES cong_sac(id_cong_sac);

ALTER TABLE danh_gia 
  ADD CONSTRAINT fk_danh_gia_tram FOREIGN KEY (id_tram) REFERENCES tram_sac(id_tram);

ALTER TABLE danh_gia 
  ADD CONSTRAINT fk_danh_gia_user FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id_nguoi_dung);

ALTER TABLE danh_gia 
  ADD CONSTRAINT fk_danh_gia_dat_cho FOREIGN KEY (id_dat_cho) REFERENCES dat_cho(id_dat_cho);

ALTER TABLE thanh_toan 
  ADD CONSTRAINT fk_thanh_toan_dat_cho FOREIGN KEY (id_dat_cho) REFERENCES dat_cho(id_dat_cho);

ALTER TABLE thanh_toan 
  ADD CONSTRAINT fk_thanh_toan_phien_sac FOREIGN KEY (id_phien_sac) REFERENCES phien_sac(id_phien_sac);

ALTER TABLE hoa_don 
  ADD CONSTRAINT fk_hoa_don_thanh_toan FOREIGN KEY (id_thanh_toan) REFERENCES thanh_toan(id_thanh_toan);

ALTER TABLE nhat_ky_he_thong 
  ADD CONSTRAINT fk_nhat_ky_user FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id_nguoi_dung);

ALTER TABLE lich_su_gia_tram
  ADD CONSTRAINT fk_lich_su_gia_tram_tram FOREIGN KEY (id_tram) REFERENCES tram_sac(id_tram);



-- ==============================================
-- ========== 4. INDEXES ========================
-- ==============================================

-- Index for session-based payment lookups
CREATE INDEX idx_thanh_toan_phien_sac ON thanh_toan(id_phien_sac) WHERE id_phien_sac IS NOT NULL;

-- Index for booking-based payment lookups
CREATE INDEX idx_thanh_toan_dat_cho ON thanh_toan(id_dat_cho) WHERE id_dat_cho IS NOT NULL;

-- Index for pending payments
CREATE INDEX idx_thanh_toan_pending ON thanh_toan(trang_thai) WHERE trang_thai = 'pending';



-- ==============================================
-- ========== DONE – 13 TABLES CREATED ===========
-- ==============================================

-- PAYMENT FLOW NOTES:
-- - OLD FLOW (booking-based): User pays BEFORE charging
--   → id_dat_cho is set, id_phien_sac is NULL
-- - NEW FLOW (session-based): User pays AFTER charging
--   → id_phien_sac is set, id_dat_cho is NULL
