import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';

/**
 * Configure Passport with Google OAuth Strategy
 */
export const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id_nguoi_dung);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query(
        'SELECT id_nguoi_dung, ho_ten, email, vai_tro, trang_thai FROM nguoi_dung WHERE id_nguoi_dung = $1',
        [id]
      );
      done(null, result.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy (only if credentials are provided)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails[0].value;
            const googleId = profile.id;
            const hoTen = profile.displayName;
            const avatar = profile.photos[0]?.value;

            // Check if user exists
            let result = await pool.query(
              'SELECT id_nguoi_dung, ho_ten, email, vai_tro, trang_thai, google_id FROM nguoi_dung WHERE email = $1',
              [email]
            );

            let user;

            if (result.rows.length > 0) {
              // User exists
              user = result.rows[0];

              // Update google_id if not set
              if (!user.google_id) {
                await pool.query(
                  'UPDATE nguoi_dung SET google_id = $1, avatar_url = $2 WHERE id_nguoi_dung = $3',
                  [googleId, avatar, user.id_nguoi_dung]
                );
                user.google_id = googleId;
              }

              // Check if account is locked
              if (user.trang_thai === 'khoa') {
                return done(null, false, {
                  message:
                    'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
                });
              }
            } else {
              // Create new user
              const insertResult = await pool.query(
                `INSERT INTO nguoi_dung (ho_ten, email, google_id, avatar_url, vai_tro, trang_thai) 
               VALUES ($1, $2, $3, $4, $5, $6) 
               RETURNING id_nguoi_dung, ho_ten, email, vai_tro, trang_thai, google_id`,
                [hoTen, email, googleId, avatar, 'user', 'hoat_dong']
              );
              user = insertResult.rows[0];

              // Log activity
              await pool.query(
                `INSERT INTO nhat_ky_he_thong (id_nguoi_dung, hanh_dong, chi_tiet) 
               VALUES ($1, $2, $3)`,
                [
                  user.id_nguoi_dung,
                  'google_register',
                  JSON.stringify({ email, provider: 'google' }),
                ]
              );
            }

            // Log login activity
            await pool.query(
              `INSERT INTO nhat_ky_he_thong (id_nguoi_dung, hanh_dong, chi_tiet) 
             VALUES ($1, $2, $3)`,
              [
                user.id_nguoi_dung,
                'google_login',
                JSON.stringify({ email, provider: 'google' }),
              ]
            );

            return done(null, user);
          } catch (error) {
            console.error('❌ Google OAuth error:', error);
            return done(error, null);
          }
        }
      )
    );
    console.log('✅ Google OAuth strategy configured');
  } else {
    console.warn(
      '⚠️  Google OAuth credentials not found. Google login will be disabled.'
    );
  }
};

export default passport;
