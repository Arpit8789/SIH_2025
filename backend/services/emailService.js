// backend/services/emailService.js - FIXED EMAIL SERVICE
import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // ✅ FIXED: createTransport (not createTransporter)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD // Use App Password
      }
    });
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send weather alert email
  async sendWeatherAlert(farmerEmail, farmerName, weatherData, insights, timeOfDay = 'morning') {
    try {
      const template = this.generateWeatherTemplate(farmerName, weatherData, insights, timeOfDay);
      
      const mailOptions = {
        from: `"Krishi Sahayak Weather Alerts" <${process.env.GMAIL_USER}>`,
        to: farmerEmail,
        subject: `🌦️ ${timeOfDay === 'morning' ? 'Daily Weather Alert' : timeOfDay === 'evening' ? 'Evening Weather Update' : 'Weather Alert'} - Krishi Sahayak`,
        html: template
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Weather email sent to ${farmerEmail} (${result.messageId})`);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate weather email template
  generateWeatherTemplate(farmerName, weatherData, insights, timeOfDay) {
    const greeting = timeOfDay === 'morning' ? 
      'Good Morning' : timeOfDay === 'evening' ? 
      'Good Evening' : 'Namaste';
    
    const currentWeather = weatherData.current;
    const todayForecast = insights.insights?.dailyActions?.[0];
    const warnings = insights.insights?.warnings || [];
    const weeklyPlanning = insights.insights?.weeklyPlanning;

    // Generate current time in IST
    const currentTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krishi Sahayak Weather Alert</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #f0f9ff; 
            line-height: 1.6;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 15px; 
            overflow: hidden; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 26px; 
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 18px;
            opacity: 0.9;
        }
        .content { 
            padding: 25px; 
        }
        .weather-card { 
            background: linear-gradient(135deg, #f8fafc, #e2e8f0); 
            border-radius: 12px; 
            padding: 20px; 
            margin: 20px 0; 
            border-left: 5px solid #10b981; 
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        .weather-card h2 {
            color: #1f2937;
            margin-top: 0;
            font-size: 20px;
        }
        .weather-info { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin: 15px 0; 
            flex-wrap: wrap;
        }
        .temperature { 
            font-size: 42px; 
            font-weight: bold; 
            color: #059669; 
            margin-bottom: 5px;
        }
        .condition {
            font-size: 16px;
            color: #4b5563;
            text-transform: capitalize;
        }
        .weather-details {
            text-align: right;
            color: #6b7280;
        }
        .weather-details p {
            margin: 8px 0;
            font-size: 15px;
        }
        .actions { 
            background: linear-gradient(135deg, #fef3c7, #fde68a); 
            border-radius: 12px; 
            padding: 20px; 
            margin: 20px 0; 
            border-left: 5px solid #f59e0b;
        }
        .actions h3 { 
            color: #92400e; 
            margin: 0 0 15px 0; 
            font-size: 18px;
        }
        .action-item { 
            background: white; 
            padding: 12px 15px; 
            margin: 8px 0; 
            border-radius: 8px; 
            border-left: 4px solid #f59e0b; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            font-size: 14px;
        }
        .warning { 
            background: linear-gradient(135deg, #fee2e2, #fecaca); 
            border: 2px solid #fca5a5; 
            border-radius: 12px; 
            padding: 20px; 
            margin: 20px 0; 
        }
        .warning h3 { 
            color: #dc2626; 
            margin: 0 0 15px 0; 
            font-size: 18px;
        }
        .warning p {
            margin: 10px 0;
            font-size: 15px;
            color: #991b1b;
        }
        .planning-section {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border-left: 5px solid #10b981;
        }
        .planning-section h3 {
            color: #065f46;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .planning-section p {
            color: #047857;
            font-size: 15px;
            margin: 0;
        }
        .footer { 
            background: #f9fafb; 
            padding: 25px 20px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer .brand {
            color: #059669;
            font-weight: bold;
            font-size: 16px;
        }
        .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .priority-high {
            background: #fee2e2;
            color: #dc2626;
        }
        .priority-medium {
            background: #fef3c7;
            color: #d97706;
        }
        .priority-low {
            background: #ecfdf5;
            color: #059669;
        }
        @media (max-width: 600px) {
            .weather-info {
                flex-direction: column;
                text-align: center;
            }
            .weather-details {
                text-align: center;
                margin-top: 15px;
            }
            .temperature {
                font-size: 36px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌾 Krishi Sahayak Weather Alert</h1>
            <p>${greeting}, ${farmerName}! 🙏</p>
        </div>
        
        <div class="content">
            <div class="weather-card">
                <h2>🌤️ Current Weather Conditions</h2>
                <div class="weather-info">
                    <div>
                        <div class="temperature">${currentWeather.temperature}°C</div>
                        <div class="condition">${currentWeather.condition.description}</div>
                    </div>
                    <div class="weather-details">
                        <p><strong>💧 Humidity:</strong> ${currentWeather.humidity}%</p>
                        <p><strong>💨 Wind:</strong> ${currentWeather.windSpeed} km/h</p>
                        <p><strong>🌧️ Rainfall:</strong> ${currentWeather.rainfall}mm</p>
                        <p><strong>☁️ Cloud Cover:</strong> ${currentWeather.cloudCover}%</p>
                    </div>
                </div>
            </div>

            ${todayForecast ? `
            <div class="actions">
                <h3>📋 Today's Action Items</h3>
                <div class="priority-badge priority-${todayForecast.priority}">
                    ${todayForecast.priority} Priority
                </div>
                ${todayForecast.actions.map(action => `
                    <div class="action-item">✅ ${action}</div>
                `).join('')}
            </div>
            ` : ''}

            ${warnings.length > 0 ? `
            <div class="warning">
                <h3>⚠️ Important Weather Alerts</h3>
                ${warnings.map(warning => `
                    <p><strong>${warning.type.replace(/([A-Z])/g, ' $1').toUpperCase()}:</strong> ${warning.message}</p>
                `).join('')}
            </div>
            ` : ''}

            ${weeklyPlanning ? `
            <div class="planning-section">
                <h3>📅 Weekly Planning Advice</h3>
                <p>${weeklyPlanning}</p>
            </div>
            ` : ''}

            <!-- Additional helpful tips -->
            <div class="weather-card">
                <h2>💡 Smart Farming Tips</h2>
                <div style="color: #4b5563; font-size: 14px;">
                    <p><strong>🌱 Remember:</strong></p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Check weather updates twice daily</li>
                        <li>Plan field activities based on forecasts</li>
                        <li>Keep emergency contacts handy during severe weather</li>
                        <li>Document crop observations daily</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p class="brand">🌾 Krishi Sahayak - Smart Farming Solutions</p>
            <p>This weather alert was generated on ${currentTime}</p>
            <p>🌐 For detailed forecasts and farming insights, visit our app</p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
                You're receiving this because you've enabled weather notifications. 
                <br>To unsubscribe, please update your preferences in the app.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Send bulk weather alerts
  async sendBulkWeatherAlerts(farmers, weatherData, insights, timeOfDay) {
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    console.log(`📧 Starting bulk email send to ${farmers.length} farmers...`);
    
    for (const farmer of farmers) {
      try {
        const result = await this.sendWeatherAlert(
          farmer.email,
          farmer.name,
          weatherData,
          insights,
          timeOfDay
        );
        
        results.push({ 
          email: farmer.email, 
          name: farmer.name,
          ...result 
        });
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
        
        // Add delay to avoid Gmail rate limiting (1 email per second)
        await new Promise(resolve => setTimeout(resolve, 1200));
        
      } catch (error) {
        failureCount++;
        results.push({ 
          email: farmer.email, 
          name: farmer.name,
          success: false, 
          error: error.message 
        });
      }
    }
    
    console.log(`📊 Bulk email results: ${successCount} sent, ${failureCount} failed`);
    return {
      results,
      summary: {
        total: farmers.length,
        successful: successCount,
        failed: failureCount,
        successRate: ((successCount / farmers.length) * 100).toFixed(1)
      }
    };
  }

  // Send test email
  async sendTestEmail(recipientEmail, recipientName = 'Farmer') {
    try {
      const testWeatherData = {
        current: {
          temperature: 28,
          condition: { description: 'partly cloudy' },
          humidity: 65,
          windSpeed: 12,
          rainfall: 0,
          cloudCover: 40
        }
      };

      const testInsights = {
        insights: {
          dailyActions: [{
            day: 'Today',
            actions: [
              'Check irrigation systems',
              'Monitor crop health',
              'Prepare for possible evening showers'
            ],
            priority: 'medium'
          }],
          warnings: [{
            type: 'rain',
            message: 'Light showers expected in the evening, plan field activities accordingly'
          }],
          weeklyPlanning: 'Good weather conditions expected for most farming activities this week. Monitor moisture levels and adjust irrigation as needed.'
        }
      };

      const result = await this.sendWeatherAlert(
        recipientEmail,
        recipientName,
        testWeatherData,
        testInsights,
        'test'
      );

      return result;

    } catch (error) {
      console.error('❌ Test email failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send urgent weather alert
  async sendUrgentAlert(farmerEmail, farmerName, alertData) {
    try {
      const urgentTemplate = this.generateUrgentAlertTemplate(farmerName, alertData);
      
      const mailOptions = {
        from: `"Krishi Sahayak URGENT Alert" <${process.env.GMAIL_USER}>`,
        to: farmerEmail,
        subject: `🚨 URGENT Weather Alert - ${alertData.type} - Krishi Sahayak`,
        html: urgentTemplate,
        priority: 'high'
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`🚨 Urgent alert sent to ${farmerEmail}`);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error('❌ Urgent alert failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate urgent alert template
  generateUrgentAlertTemplate(farmerName, alertData) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>URGENT Weather Alert</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #fee2e2; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(220,38,38,0.3); border: 3px solid #dc2626; }
        .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; }
        .alert-box { background: #fef2f2; border: 2px solid #fca5a5; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 URGENT WEATHER ALERT</h1>
            <p>${farmerName}, Immediate Action Required!</p>
        </div>
        <div class="content">
            <div class="alert-box">
                <h2 style="color: #dc2626; margin: 0 0 15px 0;">⚠️ ${alertData.type.toUpperCase()}</h2>
                <p style="font-size: 16px; color: #991b1b;"><strong>${alertData.message}</strong></p>
                <h3 style="color: #dc2626;">Immediate Actions Required:</h3>
                <ul style="color: #991b1b;">
                    ${alertData.actions?.map(action => `<li>${action}</li>`).join('') || '<li>Take protective measures immediately</li>'}
                </ul>
            </div>
        </div>
        <div class="footer">
            <p><strong>🌾 Krishi Sahayak Emergency Alert System</strong></p>
            <p>Alert generated at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

export default new EmailService();
