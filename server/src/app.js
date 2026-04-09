import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import paymentRoutes from './routes/payments.js';
import orderRoutes from './routes/orders.js';
import webhookRoutes from './routes/webhooks.js';
import uploadRoutes from './routes/uploads.js';

dotenv.config();

const app = express();
const uploadsDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads');

app.use('/api/webhooks', webhookRoutes);
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

export default app;
