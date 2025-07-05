const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/generateToken');

const prisma = new PrismaClient();

// 🚀 Register User
exports.register = async (req, res) => {
  const { name, phone, email, password, city, code } = req.body;

  if (!name || !phone || !email || !password || !city || !code) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Only Tricity cities allowed
  const allowedCities = ['Chandigarh', 'Mohali', 'Panchkula'];
  if (!allowedCities.includes(city)) {
    return res.status(400).json({ message: 'Only Tricity users allowed' });
  }

  // Blocked users check
  const isBlocked = await prisma.blockedUser.findUnique({ where: { email } });
  if (isBlocked) return res.status(403).json({ message: 'Access blocked' });

  // Already exists
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ message: 'User already exists' });

  // Email verification check
  const verification = await prisma.emailVerification.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' }
  });

  if (!verification || verification.code !== code || verification.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired verification code' });
  }

  // Hash password and create user
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, phone, email, password: hashed, city }
  });

  const token = generateToken(user);
  res.status(201).json({ user, token });
};

// 🔐 Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  const isBlocked = await prisma.blockedUser.findUnique({ where: { email } });
  if (isBlocked) return res.status(403).json({ message: 'Access blocked' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });

  const token = generateToken(user);
  res.json({ user, token });
};

// 👤 Get current user
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// 🚪 Logout (just returns message)
exports.logout = async (req, res) => {
  res.json({ message: 'Logout success (client deletes token)' });
};

// 📧 Send email verification code
exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

  await prisma.emailVerification.create({
    data: { email, code, expiresAt }
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `Sanitary Shop <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code} (valid for 10 minutes)`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
};
