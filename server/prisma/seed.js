import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = ['Electronics', 'Accessories', 'Home'];
const products = [
  {
    name: 'Wireless Headphones',
    description: 'Bluetooth over-ear headphones with passive noise isolation and 30-hour battery life.',
    price: 12999,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    categoryName: 'Electronics'
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact keyboard with tactile switches, RGB backlight, and hot-swappable keycaps.',
    price: 8999,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80',
    categoryName: 'Accessories'
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness, warm light modes, and USB charging port.',
    price: 4999,
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    categoryName: 'Home'
  }
];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { name: product.categoryName }
    });

    await prisma.product.upsert({
      where: { id: products.indexOf(product) + 1 },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId: category?.id
      },
      create: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId: category?.id
      }
    });
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@shopstack.dev' },
    update: { name: 'Demo Admin', role: 'ADMIN', password: passwordHash },
    create: {
      name: 'Demo Admin',
      email: 'admin@shopstack.dev',
      password: passwordHash,
      role: 'ADMIN'
    }
  });

  console.log('Seed complete. Admin login: admin@shopstack.dev / Admin123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
