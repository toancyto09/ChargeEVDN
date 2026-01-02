import nodemailer from 'nodemailer';

// Configure Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App password
  },
});

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: {
      name: 'ChargeEVDN',
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: '🔐 Mã OTP đặt lại mật khẩu - ChargeEVDN',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f5f5f5;
          }
          .card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #388E3C;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #388E3C;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
          }
          .otp-box {
            background: linear-gradient(135deg, #388E3C 0%, #4CAF50 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            text-align: center;
            padding: 25px;
            border-radius: 10px;
            letter-spacing: 10px;
            margin: 30px 0;
            box-shadow: 0 4px 15px rgba(56, 142, 60, 0.3);
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .steps {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .steps ol {
            margin: 0;
            padding-left: 20px;
          }
          .steps li {
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #388E3C;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">⚡ ChargeEVDN</div>
              <div class="subtitle">Hệ thống quản lý trạm sạc xe điện</div>
            </div>
            
            <h2 style="color: #388E3C;">Xin chào ${name}!</h2>
            
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            
            <p style="font-weight: bold; font-size: 16px;">Mã OTP của bạn là:</p>
            
            <div class="otp-box">${otp}</div>
            
            <div class="warning">
              <strong>⚠️ Lưu ý quan trọng:</strong>
              <ul>
                <li>Mã này có hiệu lực trong <strong>10 phút</strong></li>
                <li><strong>KHÔNG</strong> chia sẻ mã này với bất kỳ ai</li>
                <li>ChargeEVDN sẽ không bao giờ hỏi mã OTP qua điện thoại</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
              </ul>
            </div>
            
            <div class="steps">
              <p><strong>📋 Các bước đặt lại mật khẩu:</strong></p>
              <ol>
                <li>Truy cập trang đặt lại mật khẩu ChargeEVDN</li>
                <li>Nhập email: <strong>${email}</strong></li>
                <li>Nhập mã OTP: <strong>${otp}</strong></li>
                <li>Tạo mật khẩu mới (tối thiểu 6 ký tự)</li>
                <li>Xác nhận và hoàn tất</li>
              </ol>
            </div>
            
            <p>Nếu bạn gặp vấn đề, vui lòng liên hệ bộ phận hỗ trợ qua email hoặc hotline.</p>
            
            <p style="margin-top: 30px;">
              Trân trọng,<br>
              <strong style="color: #388E3C;">Đội ngũ ChargeEVDN</strong>
            </p>
            
            <div class="footer">
              <p>📧 Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>📞 Hotline: 1900-xxxx | 🌐 Website: chargeevdn.com</p>
              <p style="margin-top: 10px;">&copy; 2025 ChargeEVDN. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Xin chào ${name},

Mã OTP để đặt lại mật khẩu của bạn là: ${otp}

Mã này có hiệu lực trong 10 phút.

Các bước:
1. Truy cập trang đặt lại mật khẩu
2. Nhập email: ${email}
3. Nhập mã OTP: ${otp}
4. Tạo mật khẩu mới

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ ChargeEVDN
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    console.log('📧 To:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw new Error('Không thể gửi email');
  }
};

/**
 * Send station rejection email
 */
export const sendStationRejectionEmail = async (email, name, stationName, businessName, reason) => {
  const mailOptions = {
    from: {
      name: 'ChargeEVDN',
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: '❌ Yêu cầu duyệt trạm sạc bị từ chối - ChargeEVDN',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f5f5f5;
          }
          .card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #d32f2f;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #388E3C;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
          }
          .rejection-box {
            background: #ffebee;
            border-left: 4px solid #d32f2f;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .rejection-box h3 {
            color: #d32f2f;
            margin-top: 0;
          }
          .station-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .station-info p {
            margin: 5px 0;
          }
          .next-steps {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .next-steps ol {
            margin: 10px 0;
            padding-left: 20px;
          }
          .next-steps li {
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #388E3C;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">⚡ ChargeEVDN</div>
              <div class="subtitle">Hệ thống quản lý trạm sạc xe điện</div>
            </div>
            
            <h2 style="color: #d32f2f;">Xin chào ${name},</h2>
            
            <p>Chúng tôi rất tiếc phải thông báo rằng yêu cầu duyệt trạm sạc của bạn chưa được chấp thuận.</p>
            
            <div class="station-info">
              <p><strong>📍 Tên trạm:</strong> ${stationName}</p>
              <p><strong>🏢 Doanh nghiệp:</strong> ${businessName}</p>
              <p><strong>📅 Ngày từ chối:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            
            <div class="rejection-box">
              <h3>❌ Lý do từ chối:</h3>
              <p style="font-size: 15px; line-height: 1.8;">
                ${reason}
              </p>
            </div>
            
            <div class="next-steps">
              <h4 style="color: #2196f3; margin-top: 0;">📋 Các bước tiếp theo:</h4>
              <ol>
                <li>Xem lại thông tin trạm sạc theo lý do từ chối ở trên</li>
                <li>Chỉnh sửa/bổ sung thông tin cần thiết</li>
                <li>Đăng nhập vào hệ thống ChargeEVDN</li>
                <li>Cập nhật lại thông tin trạm sạc</li>
                <li>Yêu cầu duyệt lại sẽ được gửi tự động</li>
              </ol>
            </div>
            
            <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
            
            <p style="margin-top: 30px;">
              Trân trọng,<br>
              <strong style="color: #388E3C;">Đội ngũ ChargeEVDN</strong>
            </p>
            
            <div class="footer">
              <p>📧 Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>📞 Hotline: 1900-xxxx | 🌐 Website: chargeevdn.com</p>
              <p style="margin-top: 10px;">&copy; 2026 ChargeEVDN. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Xin chào ${name},

Yêu cầu duyệt trạm sạc "${stationName}" của doanh nghiệp ${businessName} chưa được chấp thuận.

LÝ DO TỪ CHỐI:
${reason}

CÁC BƯỚC TIẾP THEO:
1. Xem lại thông tin trạm theo lý do từ chối
2. Chỉnh sửa/bổ sung thông tin cần thiết
3. Đăng nhập vào hệ thống ChargeEVDN
4. Cập nhật lại thông tin trạm
5. Gửi lại yêu cầu duyệt

Nếu cần hỗ trợ, vui lòng liên hệ hotline: 1900-xxxx

Trân trọng,
Đội ngũ ChargeEVDN
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Station rejection email sent:', info.messageId);
    console.log('📧 To:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw new Error('Không thể gửi email');
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP ready');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP error:', error.message);
    return false;
  }
};
