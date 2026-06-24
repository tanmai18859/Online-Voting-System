const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  toggleBlockUser,
  updateUserProfile
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin dashboard actions
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/block', protect, authorize('admin'), toggleBlockUser);

module.exports = router;
