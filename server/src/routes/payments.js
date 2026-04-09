import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { stripe } from '../utils/stripe.js';

const router = express.Router();

router.use(requireAuth);

router.post('/create-payment-intent', async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}.`
        });
      }
    }

    const amount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId: String(req.user.id)
      },
      automatic_payment_methods: { enabled: true }
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount
    });
  } catch {
    return res.status(500).json({ message: 'Could not create payment intent.' });
  }
});

export default router;
