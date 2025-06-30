const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/generateToken');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const isBlocked = await prisma.blockedUser.findUnique({ where: { email } });
  if (isBlocked) return res.status(403).json({ message: 'Access blocked' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ message: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = generateToken(user);
  res.status(201).json({ user, token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const isBlocked = await prisma.blockedUser.findUnique({ where: { email } });
  if (isBlocked) return res.status(403).json({ message: 'Access blocked' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });

  const token = generateToken(user);
  res.json({ user, token });
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logout success (client deletes token)' });
};
