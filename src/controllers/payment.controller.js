const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Step 1: Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // in ₹

  const options = {
    amount: amount * 100, // Razorpay uses paise
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`
  };

  try {
    const order = await instance.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

// ✅ Step 2: Verify Signature and Save Payment
exports.verifyRazorpaySignature = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
    amount
  } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = generatedSignature === razorpay_signature;

  if (!isValid) {
    return res.status(400).json({ message: 'Invalid signature', success: false });
  }

  try {
    // Save payment info in DB
    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        paymentId: razorpay_payment_id,
        orderRef: razorpay_order_id,
        signature: razorpay_signature,
        amount: parseFloat(amount),
        status: 'success'
      }
    });

    // Update order status
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'paid' }
    });

    res.json({ message: 'Payment verified & saved', success: true, payment });
  } catch (err) {
    console.error('Error saving payment:', err);
    res.status(500).json({ message: 'Payment save failed', success: false });
  }
};
