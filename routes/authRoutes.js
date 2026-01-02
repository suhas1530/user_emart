const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginMember
} = require('../controllers/authController');

// User routes
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

// Member routes
router.post('/member/login', loginMember);

module.exports = router;