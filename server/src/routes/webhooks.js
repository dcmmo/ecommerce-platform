import express from 'express';
import { stripe } from '../utils/stripe.js';

const router = express.Router();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      console.log('Payment intent succeeded:', event.data.object.id);
    }

    if (event.type === 'payment_intent.payment_failed') {
      console.log('Payment intent failed:', event.data.object.id);
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
