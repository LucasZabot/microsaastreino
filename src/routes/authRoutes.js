const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.post('/register', validate(schemas.user.register), register);
router.post('/login', validate(schemas.user.login), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, validate(schemas.user.updateProfile), updateProfile);
router.put('/password', auth, changePassword);
router.post('/refresh', auth, refreshToken);

module.exports = router;