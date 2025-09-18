// backend/utils/notificationService.js - ULTRA SIMPLE VERSION
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// Simple in-app notification schema
const notificationSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  type: String,
  title: String,
  message: String,
  severity: { type: String, default: 'medium' },
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

// Simple email config (copy your registration email config here)
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD // App password
  }
};

let emailTransporter = null;

// Initialize email (simple)
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    emailTransporter = nodemailer.createTransporter(emailConfig);
    console.log('✅ Email service ready');
  } else {
    console.log('⚠️ Email not configured - add EMAIL_USER and EMAIL_PASSWORD to .env');
  }
} catch (error) {
  console.log('⚠️ Email setup failed:', error.message);
}

/**
 * Simple notification sender
 */
const sendNotification = async (data) => {
  try {
    const { userId, title, message, severity = 'medium', type = 'alert' } = data;

    // 1. Save to database (in-app notification)
    const notification = new Notification({
      farmerId: userId,
      type,
      title,
      message,
      severity
    });
    await notification.save();
    console.log('📱 In-app notification saved');

    // 2. Send email for critical alerts only
    if ((severity === 'high' || severity === 'critical') && emailTransporter) {
      try {
        // Get farmer email
        const { default: Farmer } = await import('../models/Farmer.js');
        const farmer = await Farmer.findById(userId).select('email name');
        
        if (farmer && farmer.email) {
          const mailOptions = {
            from: `"🌾 कृषि सहायक" <${process.env.EMAIL_USER}>`,
            to: farmer.email,
            subject: `🚨 ${title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f8f0;">
                <div style="background: linear-gradient(135deg, #27ae60, #16a085); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                  <h1>🌾 कृषि सहायक</h1>
                  <p>Krishi Sahayak - Smart Farming Alert</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 10px; margin: 10px 0;">
                  <div style="border-left: 5px solid #e74c3c; padding: 20px; background: #fdf2f2; border-radius: 5px;">
                    <h2 style="color: #c0392b; margin: 0 0 15px 0;">🚨 ${title}</h2>
                    <p style="font-size: 16px; line-height: 1.6; margin: 0;">${message}</p>
                  </div>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/notifications" 
                       style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                      View All Alerts
                    </a>
                  </div>
                </div>
                <div style="text-align: center; color: #666; font-size: 12px;">
                  <p>© ${new Date().getFullYear()} कृषि सहायक (Krishi Sahayak) - Made for Indian Farmers</p>
                  <p>This is an automated message. Please do not reply.</p>
                </div>
              </div>
            `
          };

          await emailTransporter.sendMail(mailOptions);
          console.log(`📧 Alert email sent to ${farmer.email}`);
        }
      } catch (emailError) {
        console.log('📧 Email send failed:', emailError.message);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Notification failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Weather alert sender
 */
const sendWeatherAlert = async (farmer, alert) => {
  return await sendNotification({
    userId: farmer._id,
    title: `Weather Alert: ${alert.alertType.replace('_', ' ').toUpperCase()}`,
    message: alert.message,
    severity: alert.severity,
    type: 'weather_alert'
  });
};

// Export functions
export { sendNotification, sendWeatherAlert };

// Default export
export default {
  sendNotification,
  sendWeatherAlert,
  getStatus: () => ({ 
    emailEnabled: !!emailTransporter,
    channels: ['inapp', ...(emailTransporter ? ['email'] : [])]
  })
};
