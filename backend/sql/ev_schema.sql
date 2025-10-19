-- ChargeEVDN Database Schema
-- Hệ thống quản lý trạm sạc xe điện
-- 
-- Hướng dẫn sử dụng:
-- 1. Tạo database: CREATE DATABASE charge_evdn;
-- 2. Kết nối vào database: \c charge_evdn;
-- 3. Chạy file này: \i path/to/ev_schema.sql
-- 
-- Hoặc copy toàn bộ nội dung SQL từ yêu cầu ban đầu vào đây

-- TODO: Paste your complete 13-table SQL schema here
-- Bao gồm các bảng:
-- - nguoi_dung (users)
-- - doanh_nghiep (companies) 
-- - tram_sac (charging stations)
-- - loai_cong_sac (connector types)
-- - cong_sac (charging connectors)
-- - lich_su_gia_tram (station pricing history)
-- - phuong_tien (vehicles)
-- - dat_cho (bookings)
-- - phien_sac (charging sessions)
-- - thanh_toan (payments)
-- - hoa_don (invoices)
-- - danh_gia (reviews)
-- - nhat_ky_he_thong (system logs)

-- Placeholder example:
/*
DROP TABLE IF EXISTS nguoi_dung CASCADE;
CREATE TABLE nguoi_dung (
  id_nguoi_dung bigserial PRIMARY KEY,
  ho_ten varchar(100) NOT NULL,
  email varchar(120) NOT NULL UNIQUE,
  mat_khau varchar(200) NOT NULL,
  so_dien_thoai varchar(20) UNIQUE,
  vai_tro user_role_enum NOT NULL,
  trang_thai account_status_enum NOT NULL DEFAULT 'hoat_dong',
  ngay_tao timestamptz NOT NULL DEFAULT now()
);
*/

-- Ghi chú: Copy schema SQL đầy đủ từ yêu cầu ban đầu vào đây
