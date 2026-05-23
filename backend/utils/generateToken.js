import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token for the given user ID.
 * @param {string} id - The MongoDB ObjectId of the authenticated user.
 * @returns {string} Signed JWT string valid for the duration set in JWT_EXPIRE.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export default generateToken;
