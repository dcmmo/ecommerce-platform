import express from 'express';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { isPositiveInteger, validateCartInput } from '../utils/validators.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { category: true } } }
    });

    return res.json(items);
  } catch {
    return res.status(500).json({ message: 'Could not fetch cart.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const error = validateCartInput({ productId, quantity });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const normalizedProductId = Number(productId);
    const normalizedQuantity = Number(quantity);

    const product = await prisma.product.findUnique({
      where: { id: normalizedProductId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (normalizedQuantity > product.stock) {
      return res.status(400).json({ message: 'Requested quantity exceeds stock.' });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: normalizedProductId
        }
      }
    });

    if (existing) {
      const nextQuantity = existing.quantity + normalizedQuantity;
      if (nextQuantity > product.stock) {
        return res.status(400).json({ message: 'Requested quantity exceeds stock.' });
      }

      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
        include: { product: true }
      });

      return res.json(updated);
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId: normalizedProductId,
        quantity: normalizedQuantity
      },
      include: { product: true }
    });

    return res.status(201).json(item);
  } catch {
    return res.status(500).json({ message: 'Could not add to cart.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!isPositiveInteger(req.params.id) || !isPositiveInteger(quantity)) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { id: Number(req.params.id) },
      include: { product: true }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (Number(quantity) > existing.product.stock) {
      return res.status(400).json({ message: 'Requested quantity exceeds stock.' });
    }

    const item = await prisma.cartItem.update({
      where: { id: Number(req.params.id) },
      data: { quantity: Number(quantity) },
      include: { product: true }
    });

    return res.json(item);
  } catch {
    return res.status(500).json({ message: 'Could not update cart item.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!isPositiveInteger(req.params.id)) {
      return res.status(400).json({ message: 'Invalid cart item.' });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await prisma.cartItem.delete({ where: { id: Number(req.params.id) } });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Could not remove cart item.' });
  }
});

export default router;
