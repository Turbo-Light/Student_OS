import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic field validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with that email already exists.' });
    }

    // Create the new user — password is hashed by the pre-save hook in User.js
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data. User could not be created.' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message || 'Registration failed.' });
  }
};

/**
 * @desc    Authenticate an existing user & return a token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic field validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find user by email — include the password field which is not selected by default
    const user = await User.findOne({ email });

    // Verify user exists and entered password matches the hashed password in the database
    if (user && (await user.matchPassword(password))) {
      // If user has MFA enabled, verify TOTP token
      if (user.isMfaActive) {
        const { totpToken } = req.body;
        if (!totpToken) {
          return res.status(401).json({
            message: 'MFA token required. Please provide your TOTP token.',
            mfaRequired: true,
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.mfaSecret,
          encoding: 'base32',
          token: totpToken,
          window: 1,
        });

        if (!verified) {
          return res.status(401).json({
            message: 'Invalid MFA token. Authentication failed.',
            mfaRequired: true,
          });
        }
      }

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isMfaActive: user.isMfaActive,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during authentication.' });
  }
};

const loginUser = authUser;

/**
 * @desc    Generate TOTP MFA secret and QR code for authenticated user
 * @route   POST /api/auth/mfa/generate
 * @access  Private
 */
const generateMFA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: 'AI Student OS' });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.mfaSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauth_url: secret.otpauth_url,
    });
  } catch (error) {
    console.error('generateMFA error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate MFA secret.' });
  }
};

/**
 * @desc    Verify TOTP token and activate MFA for user
 * @route   POST /api/auth/mfa/verify
 * @access  Private
 */
const verifyMFA = async (req, res) => {
  try {
    const { totpToken } = req.body;

    if (!totpToken) {
      return res.status(400).json({ message: 'totpToken is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ message: 'MFA setup has not been initiated for this user.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: totpToken,
      window: 1,
    });

    if (verified) {
      user.isMfaActive = true;
      await user.save();
      return res.status(200).json({
        message: 'MFA successfully verified and activated.',
        isMfaActive: true,
      });
    } else {
      return res.status(400).json({ message: 'Invalid TOTP token.' });
    }
  } catch (error) {
    console.error('verifyMFA error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify MFA token.' });
  }
};

/**
 * @desc    Get authenticated user's profile
 * @route   GET /api/auth/profile
 * @access  Private (requires valid JWT via protect middleware)
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching profile.' });
  }
};

export { registerUser, authUser, loginUser, getUserProfile, generateMFA, verifyMFA };
