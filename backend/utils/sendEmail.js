const nodemailer = require('nodemailer');

// Reusable transporter configuration
// Reusable transporter configuration with improved reliability and timeouts
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Add timeouts to prevent hanging
  connectionTimeout: 10000, // 10s
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

/**
 * Send an OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - The 6-digit OTP
 * @returns {Promise<boolean>} - Success or failure
 */
const sendOtpEmail = async (email, otp) => {
  try {
    console.log("Sending OTP via email:", otp);
    console.log("EMAIL OTP:", otp);

    const message = `Your OTP is ${otp}`;

    const mailOptions = {
      from: `"SmartBuy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Success] OTP sent to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send OTP to ${email}:`, error.message);
    return false;
  }
};

module.exports = { sendOtpEmail };
