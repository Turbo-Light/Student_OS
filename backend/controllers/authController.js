import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
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
};

/**
 * @desc    Authenticate an existing user & return a token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const authUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic field validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  // Find user by email — include the password field which is not selected by default
  const user = await User.findOne({ email });

  // Verify user exists and entered password matches the hashed password in the database
  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
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
    res.status(401).json({ message: 'Invalid email or password.' });
  }
};

/**
 * @desc    Get authenticated user's profile
 * @route   GET /api/auth/profile
 * @access  Private (requires valid JWT via protect middleware)
 */
const getUserProfile = async (req, res) => {
  // req.user is populated by the protect middleware
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
};

export { registerUser, authUser, getUserProfile };
