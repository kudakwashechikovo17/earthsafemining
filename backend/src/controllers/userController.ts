import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole, SubscriptionTier } from '../models/User';
import { logger } from '../utils/logger';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    // Debug logging
    logger.info(`Registration attempt for ${email} with role: ${role}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    // Validate role
    let userRole = UserRole.MINER; // Default to MINER

    if (role) {
      // Check if the provided role is valid
      logger.info(`Validating role: ${role}, type: ${typeof role}`);
      logger.info(`Valid roles: ${JSON.stringify(Object.values(UserRole))}`);

      const isValidRole = Object.values(UserRole).includes(role as UserRole);
      if (isValidRole) {
        userRole = role as UserRole;
        logger.info(`Role is valid: ${userRole}`);
      } else {
        logger.warn(`Invalid role provided: ${role}. Defaulting to MINER.`);
      }
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed in the pre-save hook
      role: userRole,
      phone,
      isVerified: false, // Require email verification
      isActive: true,
      subscriptionTier: SubscriptionTier.FREE, // Default to FREE plan
    });

    // Save user to database
    await user.save();
    logger.info(`User saved with role: ${user.role}`);

    // Generate JWT token
    const token = user.generateAuthToken();

    // Generate refresh token
    const refreshToken = user.generateRefreshToken();

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data and token (excluding password)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      isActive: user.isActive,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiry: user.subscriptionExpiry,
      token
    };

    res.status(201).json({
      user: userData,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    logger.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Debug logging
    logger.info(`Login attempt for ${email}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Find user by email and explicitly select the password field
    logger.info(`Finding user with email: ${email}`);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`User not found with email: ${email}`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    logger.info(`User found: ${user._id}, role: ${user.role}`);

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({ message: 'Your account has been deactivated' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    logger.info(`Password match: ${isMatch}`);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Generate refresh token
    const refreshToken = user.generateRefreshToken();

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data and token (excluding password)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      isActive: user.isActive,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiry: user.subscriptionExpiry,
      token
    };

    res.status(200).json({
      user: userData,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Refresh access token
// @route   POST /api/users/refresh-token
// @access  Public
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');

      // Generate new access token
      const newToken = user.generateAuthToken();

      res.status(200).json({
        token: newToken,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    logger.error('Error in refreshToken:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user from request (added by authenticate middleware)
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Find user and clear refresh token
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Error in logoutUser:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user from request (added by authenticate middleware)
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Find user by ID
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user from request (added by authenticate middleware)
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update fields
    const { firstName, lastName, phone, password } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    // If password is provided, update it
    if (password) {
      user.password = password; // Will be hashed in the pre-save hook
    }

    // Save updated user
    await user.save();

    // Return updated user (excluding password and refresh token)
    const updatedUser = await User.findById(userId).select('-password -refreshToken');

    res.status(200).json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
      return;
    }

    // In a real implementation, generate a reset token and send an email
    // For now, just return a success message

    res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    logger.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    // In a real implementation, verify the reset token and update the password
    // For now, just return a success message

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    logger.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
}; 