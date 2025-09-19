// backend/controllers/authController.js - COMPLETE FIXED VERSION WITH OTP DEBUGGING
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Farmer from '../models/Farmer.js';
import OTPVerification from '../models/OTPVerification.js';

// ✅ Simple response handler
const ResponseHandler = {
  success: (res, data, message = 'Success') => {
    res.status(200).json({
      success: true,
      message,
      data
    });
  },
  created: (res, data, message = 'Created successfully') => {
    res.status(201).json({
      success: true,
      message,
      data
    });
  },
  error: (res, message = 'Error occurred', statusCode = 500) => {
    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

// ✅ Simple validators
const Validators = {
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? 'Valid email' : 'Invalid email format'
    };
  },
  validatePhone: (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return {
      isValid: phoneRegex.test(phone),
      message: phoneRegex.test(phone) ? 'Valid phone' : 'Invalid Indian phone number'
    };
  },
  validatePassword: (password) => {
    return {
      isValid: password && password.length >= 6,
      message: password && password.length >= 6 ? 'Valid password' : 'Password must be at least 6 characters'
    };
  },
  validateOTP: (otp) => {
    return {
      isValid: /^\d{6}$/.test(otp),
      message: /^\d{6}$/.test(otp) ? 'Valid OTP' : 'OTP must be 6 digits'
    };
  }
};

// ✅ Simple helpers
const Helpers = {
  sanitizeInput: (input) => {
    return input.trim().replace(/[<>]/g, '');
  },
  generateOTP: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
};

// ✅ JWT token generation
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'krishi-sahayak-secret-key',
    { expiresIn: '24h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      type: 'refresh' 
    },
    process.env.JWT_REFRESH_SECRET || 'krishi-sahayak-refresh-secret',
    { expiresIn: '7d' }
  );
};

// ✅ Email transporter setup with correct method name
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

// ✅ Email sending function with better error handling
const sendOTPEmail = async (email, otp, purpose = 'registration') => {
  // Check if real email is enabled
  if (process.env.ENABLE_EMAIL !== 'true' || !process.env.EMAIL_USER) {
    console.log('📧 MOCK EMAIL (Real email disabled):');
    console.log(`📧 To: ${email}`);
    console.log(`📧 OTP: ${otp}`);
    console.log(`📧 Purpose: ${purpose}`);
    return { success: true, mock: true };
  }

  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      console.log('📧 No email transporter configured, using mock email');
      console.log(`📧 Mock OTP for ${email}: ${otp}`);
      return { success: true, mock: true };
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

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Real email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.log(`📧 Fallback to mock email for ${email}: ${otp}`);
    return { success: true, mock: true, error: error.message };
  }
};

// ✅ IMPROVED REGISTER WITH BETTER OTP CREATION
export const register = async (req, res) => {
  console.log('📝 Registration request received:', req.body);

  try {
    const { 
      name, 
      email, 
      phone, 
      password, 
      confirmPassword,
      role, 
      state, 
      district, 
      village,
      landSize,
      currentCrops,
      agreeToTerms
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return ResponseHandler.error(res, 'All required fields must be provided', 400);
    }

    if (!agreeToTerms) {
      return ResponseHandler.error(res, 'You must agree to the terms and conditions', 400);
    }

    if (password !== confirmPassword) {
      return ResponseHandler.error(res, 'Passwords do not match', 400);
    }

    // Validate email and phone
    const emailCheck = Validators.validateEmail(email);
    const phoneCheck = Validators.validatePhone(phone);
    const passwordCheck = Validators.validatePassword(password);

    if (!emailCheck.isValid) {
      return ResponseHandler.error(res, emailCheck.message, 400);
    }

    if (!phoneCheck.isValid) {
      return ResponseHandler.error(res, phoneCheck.message, 400);
    }

    if (!passwordCheck.isValid) {
      return ResponseHandler.error(res, passwordCheck.message, 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return ResponseHandler.error(res, 'User with this email or phone already exists', 400);
      } else {
        // Delete unverified user and allow re-registration
        await User.findByIdAndDelete(existingUser._id);
        await OTPVerification.deleteMany({ userId: existingUser._id });
        console.log('🗑️  Deleted unverified user for re-registration');
      }
    }

    let newUser;

    // Create user based on role using YOUR existing models
    if (role === 'farmer') {
      newUser = new Farmer({
        name: Helpers.sanitizeInput(name.trim()),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password,
        farmLocation: {
          state: state || 'Unknown',
          district: district || 'Unknown',
          village: village || '',
          pincode: '',
          coordinates: {
            latitude: null,
            longitude: null
          }
        },
        landSize: landSize || 1.0,
        currentCrops: currentCrops || [],
        farmingExperience: 0,
        preferredLanguage: 'hindi',
        farmingType: 'traditional',
        isVerified: false,
        registrationIP: req.ip || 'unknown'
      });
    } else {
      // For buyer/admin, use base User model
      newUser = new User({
        name: Helpers.sanitizeInput(name.trim()),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password,
        role,
        isVerified: false,
        registrationIP: req.ip || 'unknown'
      });
    }

    await newUser.save();
    console.log('✅ User created:', newUser._id);

    // ✅ Clean up any existing OTP records for this user
    await OTPVerification.deleteMany({ 
      $or: [
        { userId: newUser._id },
        { email: newUser.email.toLowerCase() }
      ]
    });

    // ✅ Generate and save OTP with explicit expiry
    const otp = Helpers.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const otpRecord = await OTPVerification.create({
      userId: newUser._id,
      email: newUser.email.toLowerCase(),
      otp: otp.toString(),
      purpose: 'registration',
      expiresAt: otpExpiry
    });

    console.log('✅ OTP record created:', {
      id: otpRecord._id,
      userId: newUser._id,
      email: newUser.email,
      otp: otp,
      expiresAt: otpExpiry
    });

    // Send OTP email with improved error handling
    try {
      const emailResult = await sendOTPEmail(newUser.email, otp, 'registration');
      if (emailResult.success) {
        console.log('📧 OTP email handling successful:', emailResult.mock ? 'Mock email used' : 'Real email sent');
      }
    } catch (emailError) {
      console.error('📧 Email sending failed:', emailError.message);
    }

    // Return success response
    ResponseHandler.created(res, {
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      otpSent: true,
      // ✅ ALWAYS show OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    }, 'Registration successful! Please check your email for OTP verification. 🌾');

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return ResponseHandler.error(res, `Validation failed: ${messages.join(', ')}`, 400);
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return ResponseHandler.error(res, `${field === 'email' ? 'Email' : 'Phone number'} already exists`, 400);
    }

    ResponseHandler.error(res, 'Registration failed. Please try again.', 500);
  }
};

// ✅ IMPROVED VERIFY OTP WITH DETAILED DEBUGGING
export const verifyOTP = async (req, res) => {
  console.log('🔢 OTP Verification request received:', req.body);
  
  try {
    const { email, otp } = req.body;

    // ✅ Validate input
    const emailCheck = Validators.validateEmail(email);
    const otpCheck = Validators.validateOTP(otp);

    if (!emailCheck.isValid) {
      console.log('❌ Email validation failed:', emailCheck.message);
      return ResponseHandler.error(res, emailCheck.message, 400);
    }

    if (!otpCheck.isValid) {
      console.log('❌ OTP validation failed:', otpCheck.message);
      return ResponseHandler.error(res, otpCheck.message, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOTP = otp.toString().trim();

    console.log(`🔍 Looking for OTP record: email=${normalizedEmail}, otp=${normalizedOTP}`);

    // ✅ Find OTP verification record with detailed logging
    const otpRecord = await OTPVerification.findOne({
      email: normalizedEmail,
      purpose: 'registration',
      isUsed: false
    }).sort({ createdAt: -1 }); // Get the latest OTP

    if (!otpRecord) {
      console.log('❌ No OTP record found for email:', normalizedEmail);
      
      // ✅ Debug: Check if any OTP exists for this email
      const anyOTP = await OTPVerification.find({ email: normalizedEmail });
      console.log('🔍 All OTP records for this email:', anyOTP.map(otp => ({
        id: otp._id,
        otp: otp.otp,
        isUsed: otp.isUsed,
        purpose: otp.purpose,
        createdAt: otp.createdAt,
        expiresAt: otp.expiresAt
      })));
      
      return ResponseHandler.error(res, 'No pending OTP found for this email', 404);
    }

    console.log('✅ Found OTP record:', {
      id: otpRecord._id,
      email: otpRecord.email,
      otp: otpRecord.otp,
      purpose: otpRecord.purpose,
      attempts: otpRecord.attempts,
      isUsed: otpRecord.isUsed,
      expiresAt: otpRecord.expiresAt,
      createdAt: otpRecord.createdAt
    });

    // ✅ Check if OTP is expired
    const now = new Date();
    const isExpired = otpRecord.expiresAt < now;
    console.log(`🕒 OTP Expiry Check: Current=${now}, Expires=${otpRecord.expiresAt}, Expired=${isExpired}`);
    
    if (isExpired) {
      console.log('❌ OTP is expired, deleting record');
      await OTPVerification.findByIdAndDelete(otpRecord._id);
      return ResponseHandler.error(res, 'OTP has expired. Please request a new one.', 400);
    }

    // ✅ Check if can attempt
    const canAttempt = otpRecord.attempts < 5 && !otpRecord.isUsed && !isExpired;
    console.log(`🔍 OTP Can Attempt: attempts=${otpRecord.attempts}, isUsed=${otpRecord.isUsed}, expired=${isExpired}, canAttempt=${canAttempt}`);
    
    if (!canAttempt) {
      console.log('❌ Too many attempts or OTP already used, deleting record');
      await OTPVerification.findByIdAndDelete(otpRecord._id);
      return ResponseHandler.error(res, 'Too many failed attempts. Please request a new OTP.', 400);
    }

    console.log(`🔍 OTP Comparison: Database="${otpRecord.otp}" vs Input="${normalizedOTP}"`);

    // ✅ Verify OTP with exact string comparison
    if (otpRecord.otp !== normalizedOTP) {
      console.log('❌ OTP mismatch, incrementing attempts');
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      const remainingAttempts = 5 - otpRecord.attempts;
      return ResponseHandler.error(res, `Invalid OTP. ${remainingAttempts} attempts remaining.`, 400);
    }

    console.log('✅ OTP matched, marking as used');

    // ✅ Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    console.log(`🔍 Looking for user with ID: ${otpRecord.userId}`);

    // ✅ Activate user account
    const user = await User.findByIdAndUpdate(
      otpRecord.userId,
      { 
        isVerified: true,
        lastLogin: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      console.log('❌ User not found for ID:', otpRecord.userId);
      return ResponseHandler.error(res, 'User not found', 404);
    }

    console.log('✅ User found and verified:', user._id);

    // ✅ Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log('✅ OTP verification successful for:', user.email);

    // ✅ Cleanup: Delete all OTP records for this user
    await OTPVerification.deleteMany({ userId: user._id });

    ResponseHandler.success(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        ...(user.farmLocation && { 
          state: user.farmLocation.state, 
          district: user.farmLocation.district 
        })
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }, 'Email verified successfully! Account is now active. 🎉');

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    ResponseHandler.error(res, 'OTP verification failed', 500);
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const emailCheck = Validators.validateEmail(email);
    const passwordCheck = Validators.validatePassword(password);

    if (!emailCheck.isValid) {
      return ResponseHandler.error(res, emailCheck.message, 400);
    }

    if (!passwordCheck.isValid) {
      return ResponseHandler.error(res, passwordCheck.message, 400);
    }

    // Find user (works with discriminators automatically)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return ResponseHandler.error(res, 'Invalid email or password', 400);
    }

    // Check if account is verified
    if (!user.isVerified) {
      return ResponseHandler.error(res, 'Please verify your email before logging in', 403);
    }

    // Check if account is locked
    if (user.isLocked) {
      return ResponseHandler.error(res, 'Account is temporarily locked due to too many failed login attempts', 423);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      if (user.incLoginAttempts) await user.incLoginAttempts();
      return ResponseHandler.error(res, 'Invalid email or password', 400);
    }

    // Reset login attempts on successful login
    if (user.resetLoginAttempts) await user.resetLoginAttempts();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user data based on role
    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      profileImage: user.profileImage
    };

    // Add role-specific data
    if (user.role === 'farmer' && user.farmLocation) {
      userData.farmLocation = user.farmLocation;
      userData.landSize = user.landSize;
      userData.currentCrops = user.currentCrops;
      userData.preferredLanguage = user.preferredLanguage;
      userData.state = user.farmLocation.state;
      userData.district = user.farmLocation.district;
    }

    console.log('✅ Login successful:', {
      userId: user._id,
      role: user.role,
      email: user.email
    });

    ResponseHandler.success(res, {
      user: userData,
      tokens: {
        accessToken,
        refreshToken
      }
    }, 'Login successful! 🌾');

  } catch (error) {
    console.error('❌ Login error:', error);
    ResponseHandler.error(res, 'Login failed. Please try again.', 500);
  }
};

// ✅ IMPROVED RESEND OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const emailCheck = Validators.validateEmail(email);
    if (!emailCheck.isValid) {
      return ResponseHandler.error(res, emailCheck.message, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ 
      email: normalizedEmail,
      isVerified: false 
    });

    if (!user) {
      return ResponseHandler.error(res, 'No unverified account found with this email', 404);
    }

    console.log('📧 Resending OTP for user:', user._id);

    // ✅ Delete ALL old OTP records for this user and email
    await OTPVerification.deleteMany({
      $or: [
        { userId: user._id },
        { email: normalizedEmail }
      ]
    });

    // Generate new OTP
    const otp = Helpers.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const otpRecord = await OTPVerification.create({
      userId: user._id,
      email: normalizedEmail,
      otp: otp.toString(),
      purpose: 'registration',
      expiresAt: otpExpiry
    });

    console.log('✅ New OTP record created:', {
      id: otpRecord._id,
      userId: user._id,
      email: normalizedEmail,
      otp: otp,
      expiresAt: otpExpiry
    });

    // Send OTP email with improved error handling
    try {
      const emailResult = await sendOTPEmail(user.email, otp, 'registration');
      console.log('📧 Resend OTP email result:', emailResult.mock ? 'Mock email' : 'Real email');
    } catch (emailError) {
      console.error('📧 Resend OTP email error:', emailError.message);
    }

    ResponseHandler.success(res, {
      email: user.email,
      // Show OTP in development mode
      ...(process.env.NODE_ENV === 'development' && { otp })
    }, 'New OTP sent to your email 📧');

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    ResponseHandler.error(res, 'Failed to resend OTP', 500);
  }
};

// ✅ REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseHandler.error(res, 'Refresh token is required', 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'krishi-sahayak-refresh-secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return ResponseHandler.error(res, 'Invalid refresh token', 401);
    }
    
    const accessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    ResponseHandler.success(res, {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    }, 'Tokens refreshed successfully');

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    ResponseHandler.error(res, 'Invalid refresh token', 401);
  }
};

// ✅ FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const emailCheck = Validators.validateEmail(email);
    if (!emailCheck.isValid) {
      return ResponseHandler.error(res, emailCheck.message, 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return ResponseHandler.success(res, null, 'If the email exists, a reset link has been sent.');
    }

    // Generate reset token (simple implementation)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // In a real app, send email with reset link
    console.log(`🔑 Password reset token for ${email}: ${resetToken}`);

    ResponseHandler.success(res, {
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    }, 'If the email exists, a reset link has been sent.');

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    ResponseHandler.error(res, 'Failed to process password reset request', 500);
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return ResponseHandler.error(res, 'Token and new password are required', 400);
    }

    const passwordCheck = Validators.validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      return ResponseHandler.error(res, passwordCheck.message, 400);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return ResponseHandler.error(res, 'Invalid or expired reset token', 400);
    }

    // Update password and clear reset token
    user.password = newPassword; // Will be hashed by pre-save middleware
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    ResponseHandler.success(res, null, 'Password reset successfully');

  } catch (error) {
    console.error('❌ Reset password error:', error);
    ResponseHandler.error(res, 'Failed to reset password', 500);
  }
};

// ✅ DEBUG OTP FUNCTION (FOR DEVELOPMENT)
export const debugOTP = async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find all OTP records for this email
    const otpRecords = await OTPVerification.find({ email: normalizedEmail });
    
    const debugInfo = otpRecords.map(record => ({
      id: record._id,
      email: record.email,
      otp: record.otp,
      purpose: record.purpose,
      attempts: record.attempts,
      isUsed: record.isUsed,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      isExpired: record.expiresAt < new Date(),
      canAttempt: record.attempts < 5 && !record.isUsed && record.expiresAt >= new Date()
    }));
    
    console.log('🔍 Debug OTP Records for', normalizedEmail, ':', debugInfo);
    
    ResponseHandler.success(res, {
      email: normalizedEmail,
      otpRecords: debugInfo,
      totalRecords: otpRecords.length
    }, 'OTP debug information retrieved');
    
  } catch (error) {
    console.error('❌ Debug OTP error:', error);
    ResponseHandler.error(res, 'Failed to retrieve debug info', 500);
  }
};

// ✅ GET PROFILE FUNCTION
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return ResponseHandler.error(res, 'User not found', 404);
    }

    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin
    };

    // Add farmer-specific data
    if (user.role === 'farmer' && user.farmLocation) {
      userData.farmLocation = user.farmLocation;
      userData.landSize = user.landSize;
      userData.currentCrops = user.currentCrops;
      userData.preferredLanguage = user.preferredLanguage;
      userData.farmingType = user.farmingType;
      userData.farmingExperience = user.farmingExperience;
    }

    ResponseHandler.success(res, userData, 'Profile retrieved successfully');

  } catch (error) {
    console.error('❌ Get profile error:', error);
    ResponseHandler.error(res, 'Failed to get user profile', 500);
  }
};

// Export all controller methods
export const authController = {
  register,
  verifyOTP,
  login,
  resendOTP,
  refreshToken,
  forgotPassword,
  resetPassword,
  debugOTP,
  getProfile
};

export default authController;
