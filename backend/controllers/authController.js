const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/sendEmail');

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

    // Delete existing OTP first
    await Otp.deleteOne({ email: emailLower });

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Save new OTP
    const newOtp = new Otp({
      email: emailLower,
      otp,
      createdAt: Date.now()
    });

    await newOtp.save();

    // Debug logs
    console.log("Generated OTP:", otp);
    console.log("Saved OTP:", newOtp.otp);

    // Send email using utility AFTER saving
    const emailSent = await sendOtpEmail(emailLower, otp);

    if (emailSent) {
      res.json({ success: true, message: 'OTP sent successfully to email.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again later.' });
    }
  } catch (error) {
    console.error('Send OTP Controller error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error while sending OTP' });
  }
};

// @desc    Verify OTP and authenticate user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  console.log("REQ BODY:", req.body);
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const emailLower = email.toLowerCase();
    
    // 1. Ensure OTP exists in Otp collection
    const otpRecord = await Otp.findOne({ email: emailLower });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found' });
    }

    // 2. Ensure OTP not expired (Manual check for 5 mins)
    const expiryTime = 5 * 60 * 1000; // 5 minutes in ms
    if (Date.now() - new Date(otpRecord.createdAt).getTime() > expiryTime) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    // 3. Ensure OTP comparison
    console.log("Entered OTP:", otp);
    console.log("Stored OTP:", otpRecord.otp);

    if (otpRecord.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid. Now ensure User exists.
    let user = await User.findOne({ email: emailLower });

    if (!user) {
      // Create new user
      const adminCount = await User.countDocuments({ role: 'admin' });
      const role = adminCount === 0 ? 'admin' : 'user';

      const userData = {
        email: emailLower,
        name: emailLower.split('@')[0],
        role
      };

      // Requirement: Do NOT include firebaseUid if it's null or undefined
      if (req.body.firebaseUid) {
        userData.firebaseUid = req.body.firebaseUid;
      }

      user = await User.create(userData);
    } else {
      // Update last login for existing user
      user.lastLogin = Date.now();
      await user.save();
    }

    console.log("User found or created:", user.email);

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
    console.error("OTP VERIFY ERROR:", error);
    res.status(500).json({ message: error.message });
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
