import express from 'express';
import { prisma } from '../utils/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { stripe } from '../utils/stripe.js';
import { isPositiveInteger, validateCheckoutInput, validateOrderStatus } from '../utils/validators.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        payment: true,
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(orders);
  } catch {
    return res.status(500).json({ message: 'Could not fetch orders.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isPositiveInteger(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id.' });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        items: { include: { product: true } },
        payment: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    return res.json(order);
  } catch {
    return res.status(500).json({ message: 'Could not fetch order.' });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress } = req.body;
    const error = validateCheckoutInput({ paymentIntentId, shippingAddress });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { stripePaymentIntent: paymentIntentId }
    });

    if (existingPayment) {
      return res.status(409).json({ message: 'This payment has already been used.' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed.' });
    }

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

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    if (paymentIntent.amount !== totalAmount) {
      return res.status(400).json({ message: 'Payment amount does not match cart total.' });
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          status: 'PAID',
          shippingAddress: shippingAddress.trim(),
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: { items: true }
      });

      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          stripePaymentIntent: paymentIntent.id,
          amount: totalAmount,
          status: 'SUCCEEDED'
        }
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
      return createdOrder;
    });

    return res.status(201).json(order);
  } catch {
    return res.status(500).json({ message: 'Checkout failed.' });
  }
});

router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    if (!isPositiveInteger(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id.' });
    }

    const { status } = req.body;
    const statusError = validateOrderStatus(status);

    if (statusError) {
      return res.status(400).json({ message: statusError });
    }

    const existing = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status }
    });

    return res.json(order);
  } catch {
    return res.status(500).json({ message: 'Could not update order status.' });
  }
});

export default router;
