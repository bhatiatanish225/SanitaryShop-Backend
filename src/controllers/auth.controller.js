const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const { generateToken } = require('../utils/generateToken')
const redis = require('../utils/redis') // Import Redis client
const prisma = new PrismaClient()
const dotenv = require('dotenv').config()

// 📧 Send email verification code
exports.sendVerificationCode = async (req, res) => {
  try {
    console.log('Received send-code request:', req.body)
    const { email } = req.body

    if (!email) return res.status(400).json({ message: 'Email is required' })

    const code = crypto.randomInt(100000, 999999).toString() // Generate 6-digit code
    console.log(`Generated verification code ${code} for ${email}`)

    // Store OTP in Redis with 10 minute expiry

    await redis.set(`otp:${email}`, code, 'EX', 10 * 60) // Store OTP with 10 min expiry
    console.log(`Stored OTP for ${email} in Redis`)
    // FOR DEVELOPMENT: Return the code directly in response for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('Production mode: Sending code via email')
      // FOR PRODUCTION: Send email
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        const mailOptions = {
          from: `Mitttal and Co. <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Your Verification Code is ${code} - Mitttal and Co.`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #2e3f47; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: #c6aa55; margin: 0; font-size: 28px;">Mitttal and Co.</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Premium Sanitary Solutions</p>
            </div>
            <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #2e3f47; margin: 0 0 20px 0;">Your Verification Code</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Welcome to Mitttal and Co.! Use the verification code below to complete your registration:
              </p>
              <div style="background-color: #f8f9fa; border: 2px dashed #c6aa55; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px;">
                <h1 style="color: #2e3f47; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${code}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">
                This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © 2024 Mitttal and Co. All rights reserved.
              </p>
            </div>
          </div>
        `,
        }

        await transporter.sendMail(mailOptions)
        console.log('Email sent successfully to:', email)
        res.json({ message: 'Verification code sent to your email' })
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        res
          .status(500)
          .json({ message: 'Failed to send verification code via email' })
      }
    }
  } catch (error) {
    console.error('General error in sendVerificationCode:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// 🚀 Register User
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, city } = req.body

    // Accept either 'code' or 'verificationCode' from frontend

    if (!name || !phone || !email || !password || !city) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Only Tricity cities allowed
    const allowedCities = ['Chandigarh', 'Mohali', 'Panchkula']
    if (!allowedCities.includes(city)) {
      return res.status(400).json({ message: 'Only Tricity users allowed' })
    }

    // Check if user already exists
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ message: 'User already exists' })

    // Always use Redis for OTP verification

    // OTP is valid, remove from Redis

    const salt = await bcrypt.genSalt(10)
    // Hash password and create user
    const hashed = await bcrypt.hash(password, salt)
    const user = await prisma.user.create({
      data: { name, phone, email, password: hashed, city },
    })

    const token = generateToken(user)
    console.log('User registered successfully:', user.email)
    res.status(201).json({ user, token })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// 🔐 Login User
exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' })

  // const isBlocked = await prisma.blockedUser.findUnique({ where: { email } });
  // if (isBlocked) return res.status(403).json({ message: 'Access blocked' });

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(400).json({ message: 'Invalid credentials' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ message: 'Wrong password' })

  const token = generateToken(user)
  res.json({ user, token })
}

// 👤 Get current user
exports.getMe = async (req, res) => {
  res.json(req.user)
}

// 🚪 Logout (just returns message)
exports.logout = async (req, res) => {
  res.json({ message: 'Logout success (client deletes token)' })
}

// 🧪 Test OTP verification (for testing purposes)
exports.testVerifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' })
    }

    // Always use Redis for OTP verification
    const storedCode = await redis.get(`otp:${email}`)
    if (!storedCode) {
      return res.status(400).json({
        message: 'No verification code found. Please request a new one.',
      })
    }
    if (storedCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }
    await redis.del(`otp:${email}`)
    res.json({ message: 'OTP verified successfully!', email: email })
  } catch (error) {
    console.error('Test OTP verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// 🏠 Update user address
exports.updateAddress = async (req, res) => {
  try {
    const { address, city, phone } = req.body
    const userId = req.user.id

    // Validate required fields
    if (!address || !city || !phone) {
      return res.status(400).json({
        message: 'Address, city, and phone are required',
      })
    }

    // Only Tricity cities allowed
    const allowedCities = ['Chandigarh', 'Mohali', 'Panchkula']
    if (!allowedCities.includes(city)) {
      return res.status(400).json({ message: 'Only Tricity users allowed' })
    }

    // Update user address
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        address,
        city,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    console.log('User address updated successfully:', updatedUser.email)
    res.json({
      message: 'Address updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
