import express from 'express';
import { prisma } from '../utils/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateProductInput } from '../utils/validators.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search = '', category } = req.query;

    const products = await prisma.product.findMany({
      where: {
        name: { contains: String(search).trim(), mode: 'insensitive' },
        ...(category ? { category: { name: category } } : {})
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(products);
  } catch {
    return res.status(500).json({ message: 'Could not fetch products.' });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return res.json(categories);
  } catch {
    return res.status(500).json({ message: 'Could not fetch categories.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(product);
  } catch {
    return res.status(500).json({ message: 'Could not fetch product.' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    const error = validateProductInput({ name, description, price, stock, imageUrl });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const category = categoryId
      ? await prisma.category.findUnique({ where: { id: Number(categoryId) } })
      : null;

    if (categoryId && !category) {
      return res.status(400).json({ message: 'Selected category does not exist.' });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl.trim(),
        categoryId: category ? category.id : null
      },
      include: { category: true }
    });

    return res.status(201).json(product);
  } catch {
    return res.status(500).json({ message: 'Could not create product.' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    const error = validateProductInput({ name, description, price, stock, imageUrl });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const existing = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const category = categoryId
      ? await prisma.category.findUnique({ where: { id: Number(categoryId) } })
      : null;

    if (categoryId && !category) {
      return res.status(400).json({ message: 'Selected category does not exist.' });
    }

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl.trim(),
        categoryId: category ? category.id : null
      },
      include: { category: true }
    });

    return res.json(product);
  } catch {
    return res.status(500).json({ message: 'Could not update product.' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });

    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Could not delete product.' });
  }
});

export default router;
