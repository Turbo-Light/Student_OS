import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Middleware to protect private routes via JWT verification.
 *          Extracts the Bearer token from the Authorization header,
 *          verifies it, and attaches the decoded user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header with Bearer scheme
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the raw token string (strip "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature and expiry against our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user record, excluding the hashed password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists.' });
      }

      next();
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

export { protect };
