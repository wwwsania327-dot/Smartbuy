const User = require('../models/User');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Email transporter setup using Gmail and App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Generate OTP and send via email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailLower = email.toLowerCase();

    // Check if the user is blocked
    const user = await User.findOne({ email: emailLower });
    if (user && user.status === 'blocked') {
      return res.status(403).json({ message: 'Account has been blocked by an administrator.' });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Save/Update OTP in DB
    await Otp.findOneAndUpdate(
      { email: emailLower },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailLower,
      subject: 'Your Login OTP - SmartBuy',
      text: `Your login OTP is: ${otp}. It will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP sent successfully to email.' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// @desc    Verify OTP and authenticate user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const emailLower = email.toLowerCase();
    
    // Find OTP record
    const otpRecord = await Otp.findOne({ email: emailLower });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }
    
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP format or incorrect code.' });
    }

    // OTP is valid. Now ensure User exists.
    let user = await User.findOne({ email: emailLower });

    if (!user) {
      // Create new user
      const adminCount = await User.countDocuments({ role: 'admin' });
      const role = adminCount === 0 ? 'admin' : 'user';

      user = await User.create({
        email: emailLower,
        name: emailLower.split('@')[0],
        role
      });
    }

    // Clean up used OTP
    await Otp.deleteOne({ email: emailLower });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '30d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
      token
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { sendOtp, verifyOtp, getProfile };
