/**
 * Auth Google Service
 * Business logic for Google OAuth authentication
 */

import pool from '../../config/db.js';
import logger from '../../utils/logger.js';
import { USER_STATUS, USER_ROLES } from './auth.constants.js';

/**
 * Find or create user from Google profile
 * Called by Passport Google Strategy
 * @param {Object} profile - Google profile data
 * @returns {Object} User data
 */
export const findOrCreateGoogleUser = async (profile) => {
  const { id: google_id, emails, displayName, photos } = profile;
  const email = emails[0].value;
  const avatar_url = photos?.[0]?.value || null;

  try {
    // Check if user exists (by email or google_id)
    const existingUser = await pool.query(
      'SELECT * FROM nguoi_dung WHERE email = $1 OR google_id = $2',
      [email, google_id]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      // Update Google ID if not set
      if (!user.google_id) {
        await pool.query(
          'UPDATE nguoi_dung SET google_id = $1, anh_dai_dien = $2 WHERE id_nguoi_dung = $3',
          [google_id, avatar_url, user.id_nguoi_dung]
        );

        logger.info(`Updated Google ID for user: ${email}`);
      }

      return user;
    }

    // Create new user with Google data
    const newUser = await pool.query(
      `INSERT INTO nguoi_dung (ho_ten, email, google_id, anh_dai_dien, vai_tro, trang_thai)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        displayName,
        email,
        google_id,
        avatar_url,
        USER_ROLES.USER,
        USER_STATUS.ACTIVE,
      ]
    );

    logger.info(`New user created via Google OAuth: ${email}`);

    return newUser.rows[0];
  } catch (error) {
    logger.error('Error in findOrCreateGoogleUser:', error);
    throw error;
  }
};

/**
 * Link Google account to existing user
 * @param {number} userId - Existing user ID
 * @param {string} googleId - Google ID
 * @param {string} avatarUrl - Avatar URL from Google
 * @returns {Object} Updated user data
 */
export const linkGoogleAccount = async (userId, googleId, avatarUrl) => {
  const result = await pool.query(
    'UPDATE nguoi_dung SET google_id = $1, anh_dai_dien = $2 WHERE id_nguoi_dung = $3 RETURNING *',
    [googleId, avatarUrl, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  logger.info(`Google account linked for user ID: ${userId}`);

  return result.rows[0];
};

/**
 * Unlink Google account from user
 * @param {number} userId - User ID
 * @returns {Object} Updated user data
 */
export const unlinkGoogleAccount = async (userId) => {
  const result = await pool.query(
    'UPDATE nguoi_dung SET google_id = NULL WHERE id_nguoi_dung = $1 RETURNING *',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  logger.info(`Google account unlinked for user ID: ${userId}`);

  return result.rows[0];
};

