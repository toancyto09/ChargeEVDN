# 📧 ADMIN REJECT STATION - EMAIL NOTIFICATION

**Feature:** Admin từ chối duyệt trạm → Gửi email thông báo lý do cho Owner

**Ngày implement:** 02/01/2026

---

## ✅ **ĐÃ IMPLEMENT:**

### **1. Backend Service (`admin.station.service.js`)**

**Function:** `rejectStation(stationId, adminId, reason)`

**Flow:**
```javascript
1. BEGIN Transaction
2. UPDATE tram_sac
   ├─ trang_thai_duyet = 'rejected'
   ├─ id_nguoi_duyet = adminId
   ├─ ngay_duyet = NOW()
   └─ ly_do_tu_choi = reason
3. Query owner email:
   ├─ email
   ├─ ho_ten
   ├─ ten_tram
   └─ ten_doanh_nghiep
4. COMMIT Transaction
5. Send email (async, non-blocking)
   └─ sendStationRejectionEmail(...)
```

**Key Points:**
- ✅ Transaction an toàn (BEGIN/COMMIT/ROLLBACK)
- ✅ Email gửi async (không block response)
- ✅ Error handling riêng cho email (không fail rejection nếu email lỗi)
- ✅ Dynamic import emailService (tránh circular dependency)

---

### **2. Email Template (`emailService.js`)**

**Function:** `sendStationRejectionEmail(email, name, stationName, businessName, reason)`

**Email Content:**
```
Subject: ❌ Yêu cầu duyệt trạm sạc bị từ chối - ChargeEVDN

Body:
├─ Header: Logo ChargeEVDN
├─ Greeting: "Xin chào {name}"
├─ Station Info:
│   ├─ Tên trạm: {stationName}
│   ├─ Doanh nghiệp: {businessName}
│   └─ Ngày từ chối: {date}
├─ Rejection Box (Red):
│   └─ Lý do: {reason}
├─ Next Steps (Blue):
│   ├─ 1. Xem lại thông tin
│   ├─ 2. Chỉnh sửa
│   ├─ 3. Đăng nhập hệ thống
│   ├─ 4. Cập nhật trạm
│   └─ 5. Gửi lại yêu cầu (auto)
└─ Footer: Contact info
```

**Template Features:**
- 📱 Responsive design
- 🎨 Professional styling (giống OTP email)
- 🔴 Red highlight cho rejection
- 🔵 Blue highlight cho next steps
- ✉️ Both HTML và plain text versions

---

## 🔧 **DATABASE SCHEMA (ĐÃ CÓ SẴN)**

```sql
-- Table: tram_sac
trang_thai_duyet  VARCHAR    -- 'pending', 'approved', 'rejected'
id_nguoi_duyet    INTEGER    -- Admin ID
ngay_duyet        TIMESTAMP  -- Approval/rejection date
ly_do_tu_choi     TEXT       -- Rejection reason
```

**→ KHÔNG CẦN MIGRATION!** Schema đã đủ!

---

## 📋 **API ENDPOINT (ĐÃ CÓ)**

```javascript
POST /api/admin/stations/:id/reject

Headers:
  Authorization: Bearer {admin_token}

Body:
{
  "reason": "Thiếu giấy phép kinh doanh điện năng"
}

Response (Success):
{
  "success": true,
  "message": "Từ chối trạm sạc thành công",
  "data": {
    "id_tram": 123,
    "ten_tram": "Trạm VinFast Hải Châu",
    "trang_thai_duyet": "rejected",
    "ly_do_tu_choi": "Thiếu giấy phép...",
    "ngay_duyet": "2026-01-02T08:00:00Z"
  }
}

Email:
✅ Sent to owner async
📧 To: owner@example.com
```

---

## 🧪 **TEST SCENARIOS:**

### **Scenario 1: Reject với lý do hợp lệ**
```javascript
POST /api/admin/stations/123/reject
Body: { "reason": "Thiếu hồ sơ pháp lý" }

Expected:
✅ Status updated to 'rejected'
✅ ly_do_tu_choi saved
✅ Email sent to owner
✅ Log: "✅ Rejection email sent to: owner@example.com"
```

### **Scenario 2: Reject không có lý do**
```javascript
POST /api/admin/stations/123/reject
Body: { "reason": "" }

Expected:
❌ HTTP 400
❌ Message: "Vui lòng nhập lý do từ chối"
```

### **Scenario 3: Email fail (network issue)**
```javascript
POST /api/admin/stations/123/reject
Body: { "reason": "Valid reason" }
Email service: DOWN

Expected:
✅ Status still updated to 'rejected' (transaction committed)
✅ Response HTTP 200
⚠️ Log: "❌ Failed to send rejection email: ..."
```

---

## 💡 **DESIGN DECISIONS:**

### **1. Email Async (Non-blocking)**
```javascript
// ✅ GOOD: Don't wait for email
import('emailService').then(sendEmail).catch(log)
return station;  // Return immediately

// ❌ BAD: Wait for email
await sendEmail();  // Block response
return station;
```

**Rationale:** 
- Rejection should succeed even if email fails
- Email delivery is not critical for data consistency
- Better UX (faster response)

---

### **2. Transaction Safety**
```javascript
BEGIN
  UPDATE station -> rejected
  QUERY owner email
COMMIT  // ← Commit BEFORE sending email

// Then send email (outside transaction)
```

**Rationale:**
- Email send có thể mất 1-2 giây
- Không hold transaction lock quá lâu
- Transaction chỉ cho DB operations

---

### **3. Reason Required**
```javascript
if (!reason || reason.trim() === '') {
  throw new Error('Vui lòng nhập lý do từ chối');
}
```

**Rationale:**
- UX tốt hơn cho owner
- Trách nhiệm với quyết định
- Track lịch sử qua ly_do_tu_choi

---

## 📊 **LOGS & MONITORING:**

```bash
# Success case:
✅ Rejection email sent: msg_abc123
📧 To: owner@business.com

# Email fail case:
❌ Failed to send rejection email: SMTP connection timeout

# Validation fail:
❌ Error: Vui lòng nhập lý do từ chối
```

---

## 🎯 **INTEGRATION POINTS:**

### **Admin Frontend (Existing):**
```javascript
// Admin UI có button "Từ chối"
async function handleReject(stationId) {
  const reason = prompt('Nhập lý do từ chối:');
  if (!reason) return;
  
  await api.post(`/api/admin/stations/${stationId}/reject`, {
    reason
  });
  
  toast.success('Đã từ chối trạm sạc');
  refreshList();
}
```

### **Owner Frontend (Existing):**
```javascript
// Owner xem station list
// Status badge: 
<Badge color="error">Bị từ chối</Badge>

// Click vào → Show ly_do_tu_choi
<Alert severity="error">
  <strong>Lý do:</strong> {station.ly_do_tu_choi}
</Alert>
```

---

## 🚀 **DEPLOYMENT CHECKLIST:**

- [x] Code implemented
- [x] Email template created
- [x] Transaction safe
- [x] Error handling
- [x] Logs added
- [ ] Test email send (manual)
- [ ] Test with real Gmail SMTP
- [ ] Update admin UI (if needed)
- [ ] Update owner UI (if needed)

---

## 📝 **NOTES:**

1. **Email Config:** Cần setup `EMAIL_USER` và `EMAIL_PASSWORD` trong `.env`
2. **Gmail:** Dùng App Password, không phải password thường
3. **Async:** Email fail KHÔNG làm reject fail
4. **Loop:** Owner có thể edit → resubmit → auto gửi lại admin

---

**Status:** ✅ HOÀN THÀNH  
**Impact:** HIGH (UX improvement for owners)  
**Risk:** LOW (graceful degradation if email fails)
