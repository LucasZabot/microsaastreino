const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    birth_date,
    gender,
    height,
    weight,
    fitness_level,
    goals,
    injuries
  } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    birth_date,
    gender,
    height,
    weight,
    fitness_level,
    goals,
    injuries,
    verification_token: crypto.randomBytes(32).toString('hex')
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          fitness_level: user.fitness_level,
          is_premium: user.is_premium
        },
        token: generateToken(user.id)
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid user data'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ where: { email } });

  if (user && (await user.validatePassword(password))) {
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          fitness_level: user.fitness_level,
          is_premium: user.is_premium,
          last_login: user.last_login
        },
        token: generateToken(user.id)
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'verification_token', 'password_reset_token'] }
  });

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    const allowedUpdates = [
      'name', 'birth_date', 'gender', 'height', 'weight', 
      'fitness_level', 'goals', 'preferred_workout_duration',
      'preferred_workout_days', 'injuries'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    await user.update(updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!(await user.validatePassword(currentPassword))) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with this email'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  await user.update({
    password_reset_token: resetToken,
    password_reset_expires: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  // In a real app, you would send an email here
  // For now, we'll just return the token (NOT recommended in production)
  res.json({
    success: true,
    message: 'Password reset token generated',
    resetToken: resetToken // Remove this in production
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: {
      password_reset_token: token,
      password_reset_expires: {
        [Op.gt]: Date.now()
      }
    }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  user.password = newPassword;
  user.password_reset_token = null;
  user.password_reset_expires = null;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful',
    data: {
      token: generateToken(user.id)
    }
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user || !user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'User not found or inactive'
    });
  }

  res.json({
    success: true,
    data: {
      token: generateToken(user.id)
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken
};