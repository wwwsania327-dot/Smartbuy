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
