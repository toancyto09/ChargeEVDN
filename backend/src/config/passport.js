import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';
import { findOrCreateGoogleUser } from '../modules/auth/auth.google.service.js';
import logger from '../utils/logger.js';

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
            // Use auth.google.service to find or create user
            const user = await findOrCreateGoogleUser(profile);

            // Check if account is locked
            if (user.trang_thai === 'khoa') {
              return done(null, false, {
                message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
              });
            }

            // Log login activity
            await pool.query(
              `INSERT INTO nhat_ky_he_thong (id_nguoi_dung, hanh_dong, chi_tiet) 
               VALUES ($1, $2, $3)`,
              [
                user.id_nguoi_dung,
                'google_login',
                JSON.stringify({ email: user.email, provider: 'google' }),
              ]
            );

            return done(null, user);
          } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error, null);
          }
        }
      )
    );
    logger.info('Google OAuth strategy configured');
  } else {
    logger.warn('Google OAuth credentials not found. Google login will be disabled.');
  }
};

export default passport;
