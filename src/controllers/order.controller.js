const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

const generateInvoice = async (order) => {
  const doc = new PDFDocument();
  const filename = `invoice-${order.id}.pdf`;
  const filePath = path.join(__dirname, '..', 'invoices', filename);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('Sanitary Shop Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Order ID: ${order.id}`);
  doc.text(`Customer: ${order.user.name} (${order.user.email})`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.moveDown();

  doc.text('Items:', { underline: true });
  order.items.forEach((item) => {
    doc.text(`${item.product.name} x${item.quantity} = ₹${item.price * item.quantity}`);
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total: ₹${order.totalPrice}`, { bold: true });

  doc.end();

  return filePath;
};

exports.createOrder = async (req, res) => {
  const { items } = req.body;

  let totalPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    const itemTotal = product.price * item.quantity;
    totalPrice += itemTotal;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price
    });
  }

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      totalPrice,
      items: {
        create: orderItems
      }
    },
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  const invoicePath = await generateInvoice(order);
  res.status(201).json({ order, invoice: invoicePath });
};

exports.getUserOrders = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
  const orders = await prisma.order.findMany({
    where: filter,
    include: {
      user: true,
      items: { include: { product: true } }
    }
  });
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      user: true,
      items: { include: { product: true } }
    }
  });
  res.json(order);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const updated = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { status }
  });

  res.json(updated);
};
