import express from 'express';
import { authenticate } from '../middleware/auth';
import { registerUser, loginUser, refreshToken, logoutUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword, getMinerStats } from '../controllers/userController';

const router = express.Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logoutUser);

// User profile routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.get('/stats', authenticate, getMinerStats);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router; 