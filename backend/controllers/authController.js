// controllers/authController.js - FIXED VERSION (No Duplicate Helpers)
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import OTPVerification from '../models/OTPVerification.js';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../middleware/auth.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { Validators } from '../utils/validators.js';
import { Helpers } from '../utils/helpers.js'; // ✅ Import from utils
import { catchAsync } from '../utils/errorHandler.js';
import { 
  AppError, 
  ValidationError, 
  ConflictError, 
  NotFoundError, 
  AuthenticationError 
} from '../utils/errorHandler.js';

// ✅ REAL Email transporter setup
const createEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('⚠️  Email credentials not found. Using mock email.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// ✅ REAL Email sending function
const sendOTPEmail = async (email, otp, purpose = 'registration') => {
  // Check if real email is enabled
  if (process.env.ENABLE_EMAIL !== 'true' || !process.env.EMAIL_USER) {
    console.log('📧 MOCK EMAIL (Real email disabled):');
    console.log(`📧 To: ${email}`);
    console.log(`📧 OTP: ${otp}`);
    console.log(`📧 Purpose: ${purpose}`);
    return true;
  }

  const transporter = createEmailTransporter();
  if (!transporter) {
    throw new Error('Email transporter not configured');
  }

  const purposeText = {
    'registration': 'Account Registration',
    'password_reset': 'Password Reset',
    'email_change': 'Email Change Verification'
  };

  const mailOptions = {
    from: {
      name: 'Krishi Sahayak 🌾',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: `${purposeText[purpose]} - OTP Verification`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌾 Krishi Sahayak</h1>
            <p style="color: #e8f5e8; margin: 10px 0 0; font-size: 16px;">Smart Agricultural Advisory Platform</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Your Verification Code</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Hello! Welcome to Krishi Sahayak. Please use the following OTP to complete your <strong>${purposeText[purpose].toLowerCase()}</strong>:
            </p>
            
            <!-- OTP Box -->
            <div style="background: #f8f9fa; border: 2px dashed #4CAF50; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #4CAF50; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #666; margin: 15px 0 0; font-size: 14px;">Valid for 10 minutes</p>
            </div>
            
            <!-- Instructions -->
            <div style="background: #e8f5e8; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32; font-size: 14px;">
                <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong> for security reasons. If you didn't request this verification, please ignore this email.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              Need help? Reply to this email or contact our support team.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2025 Krishi Sahayak - Empowering Indian Farmers with Technology<br>
              This is an automated email, please do not reply.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Real email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

// ❌ REMOVED - Don't redeclare Helpers, we're importing it from utils/helpers.js

// Register new user with OTP verification
export const register = catchAsync(async (req, res, next) => {
  console.log('📝 Registration request received:', req.body);

  const { name, email, phone, password, role, location, language, landSize, crops } = req.body;

  // Validate required fields
  const validation = Validators.validateFields(req.body, {
    name: { type: 'name' },
    email: { type: 'email' },
    phone: { type: 'phone' },
    password: { type: 'password' },
  });

  if (!validation.isValid) {
    throw new ValidationError('Registration validation failed', validation.errors);
  }

  // Check if role is valid
  const validRoles = ['farmer', 'buyer', 'admin'];
  if (!validRoles.includes(role)) {
    throw new ValidationError('Invalid role', [{ field: 'role', message: 'Role must be farmer, buyer, or admin' }]);
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }]
  });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ConflictError('User with this email or phone already exists');
    } else {
      // Delete unverified user and allow re-registration
      await User.findByIdAndDelete(existingUser._id);
      await OTPVerification.deleteMany({ userId: existingUser._id });
      console.log('🗑️  Deleted unverified user for re-registration');
    }
  }

  // Create new user data
  const userData = {
    name: Helpers.sanitizeInput(name.trim()), // ✅ Use imported Helpers
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password,
    role,
    isVerified: false,
    registrationIP: req.ip || 'unknown'
  };

  // Add farmer-specific data
  if (role === 'farmer') {
    if (location) userData.location = location;
    if (language) userData.language = language;
    if (landSize) userData.landSize = landSize;
    if (crops) userData.crops = crops;
  }

  const newUser = await User.create(userData);
  console.log('✅ User created:', newUser._id);

  // Generate and save OTP
  const otp = Helpers.generateOTP(); // ✅ Use imported Helpers
  
  await OTPVerification.create({
    userId: newUser._id,
    email: newUser.email,
    otp,
    purpose: 'registration'
  });

  // Send OTP email (REAL EMAIL NOW!)
  try {
    await sendOTPEmail(newUser.email, otp, 'registration');
    console.log('📧 OTP sent successfully to:', newUser.email);
  } catch (emailError) {
    console.error('📧 Email sending failed:', emailError.message);
    // Delete user if email fails
    await User.findByIdAndDelete(newUser._id);
    await OTPVerification.deleteMany({ userId: newUser._id });
    throw new AppError('Failed to send verification email. Please try again.', 500);
  }

  ResponseHandler.created(res, {
    userId: newUser._id,
    email: newUser.email,
    otpSent: true,
    // Show OTP in development mode only if email is disabled
    ...(process.env.NODE_ENV === 'development' && process.env.ENABLE_EMAIL !== 'true' && { otp })
  }, 'Registration successful! Please check your email for OTP verification. 🌾');
});

// Verify OTP and activate account
export const verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  // Validate input
  const emailValidation = Validators.validateEmail(email);
  const otpValidation = Validators.validateOTP(otp);

  if (!emailValidation.isValid) {
    throw new ValidationError('Invalid email', [{ field: 'email', message: emailValidation.message }]);
  }

  if (!otpValidation.isValid) {
    throw new ValidationError('Invalid OTP', [{ field: 'otp', message: otpValidation.message }]);
  }

  // Find OTP verification record
  const otpRecord = await OTPVerification.findOne({
    email: email.toLowerCase(),
    purpose: 'registration',
    isUsed: false
  });

  if (!otpRecord) {
    throw new NotFoundError('No pending OTP found for this email');
  }

  if (otpRecord.isExpired()) {
    await OTPVerification.findByIdAndDelete(otpRecord._id);
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  if (!otpRecord.canAttempt()) {
    await OTPVerification.findByIdAndDelete(otpRecord._id);
    throw new AppError('Too many failed attempts. Please request a new OTP.', 400);
  }

  // Verify OTP
  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    
    const remainingAttempts = 5 - otpRecord.attempts;
    throw new AppError(`Invalid OTP. ${remainingAttempts} attempts remaining.`, 400);
  }

  // Mark OTP as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  // Activate user account
  const user = await User.findByIdAndUpdate(
    otpRecord.userId,
    { 
      isVerified: true,
      lastLogin: new Date()
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Generate tokens
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  ResponseHandler.success(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    },
    tokens: {
      accessToken,
      refreshToken
    }
  }, 'Email verified successfully! Account is now active. 🎉');
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  const validation = Validators.validateFields(req.body, {
    email: { type: 'email' },
    password: { type: 'password' }
  });

  if (!validation.isValid) {
    throw new ValidationError('Login validation failed', validation.errors);
  }

  // Find user
  const user = await User.findOne({ 
    email: email.toLowerCase() 
  }).select('+password');

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if account is verified
  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in', 403);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    if (user.incLoginAttempts) await user.incLoginAttempts();
    throw new AuthenticationError('Invalid email or password');
  }

  // Reset login attempts on successful login
  if (user.resetLoginAttempts) await user.resetLoginAttempts();

  // Generate tokens
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  ResponseHandler.success(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    },
    tokens: {
      accessToken,
      refreshToken
    }
  }, 'Login successful! 🌾');
});

// Resend OTP
export const resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const emailValidation = Validators.validateEmail(email);
  if (!emailValidation.isValid) {
    throw new ValidationError('Invalid email', [{ field: 'email', message: emailValidation.message }]);
  }

  // Find user
  const user = await User.findOne({ 
    email: email.toLowerCase(),
    isVerified: false 
  });

  if (!user) {
    throw new NotFoundError('No unverified account found with this email');
  }

  // Delete old OTP records
  await OTPVerification.deleteMany({
    userId: user._id,
    purpose: 'registration'
  });

  // Generate new OTP
  const otp = Helpers.generateOTP(); // ✅ Use imported Helpers
  
  await OTPVerification.create({
    userId: user._id,
    email: user.email,
    otp,
    purpose: 'registration'
  });

  // Send OTP email
  await sendOTPEmail(user.email, otp, 'registration');

  ResponseHandler.success(res, {
    email: user.email,
    // Show OTP in development mode only if email is disabled
    ...(process.env.NODE_ENV === 'development' && process.env.ENABLE_EMAIL !== 'true' && { otp })
  }, 'New OTP sent to your email 📧');
});

// Refresh token
export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  try {
    const user = await verifyRefreshToken(refreshToken);
    
    const accessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    ResponseHandler.success(res, {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    }, 'Tokens refreshed successfully');
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
});

// Forgot password (placeholder)
export const forgotPassword = catchAsync(async (req, res, next) => {
  ResponseHandler.success(res, null, 'Password reset feature will be implemented soon');
});

// Reset password (placeholder)
export const resetPassword = catchAsync(async (req, res, next) => {
  ResponseHandler.success(res, null, 'Password reset feature will be implemented soon');
});
