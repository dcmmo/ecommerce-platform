import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import {
  normalizeEmail,
  validateLoginInput,
  validateRegisterInput
} from '../utils/validators.js';

dotenv.config();

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const error = validateRegisterInput({ name, email, password });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true }
    });

    const token = createToken(user.id);
    return res.status(201).json({ token, user });
  } catch {
    return res.status(500).json({ message: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const error = validateLoginInput({ email, password });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = createToken(user.id);
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch {
    return res.status(500).json({ message: 'Login failed.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
