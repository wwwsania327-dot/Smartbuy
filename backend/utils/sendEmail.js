const nodemailer = require('nodemailer');

// Reusable transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - The 6-digit OTP
 * @returns {Promise<boolean>} - Success or failure
 */
const sendOtpEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: `"SmartBuy" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'SmartBuy OTP Verification 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">SmartBuy OTP Verification</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for logging into SmartBuy is:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; padding: 15px; background-color: #f9f9f9; border-radius: 5px; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="margin-top: 20px;">This OTP is valid for <strong>5 minutes</strong>. Do not share this OTP with anyone.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 SmartBuy. All rights reserved.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Success] OTP sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send OTP to ${to}:`, error.message);
    return false;
  }
};

module.exports = { sendOtpEmail };
