import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = ['Cleansers', 'Serums', 'Sunscreen', 'Lotion', 'Retinoids', 'Moisturizers'];
const products = [
  {
    name: 'CeraVe Hydrating Facial Cleanser',
    description: 'Gentle, non-foaming cleanser with ceramides and hyaluronic acid that hydrates while cleansing. Developed with dermatologists for normal to dry skin.',
    price: 1699,
    stock: 50,
    imageUrl: 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg',
    categoryName: 'Cleansers'
  },
  {
    name: 'CeraVe Foaming Facial Cleanser',
    description: 'Foaming cleanser with ceramides, niacinamide, and hyaluronic acid that removes excess oil without disrupting the skin barrier. Ideal for normal to oily skin.',
    price: 1499,
    stock: 50,
    imageUrl: 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/foaming-facial-cleanser/photos/foaming-facial-cleanser_front.jpg',
    categoryName: 'Cleansers'
  },
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    description: 'High-strength vitamin B3 serum that visibly reduces blemishes, congestion, and uneven skin tone. Helps balance sebum activity and improve skin texture over time.',
    price: 990,
    stock: 80,
    imageUrl: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png?sw=800&sh=800&sm=fit',
    categoryName: 'Serums'
  },
  {
    name: 'The Ordinary Vitamin C Suspension 23% + HA Spheres 2%',
    description: 'Potent vitamin C suspension that brightens skin and targets uneven tone. Formulated with 23% ascorbic acid for maximum efficacy with hyaluronic acid spheres for comfort.',
    price: 860,
    stock: 60,
    imageUrl: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwd0597332/Images/products/The%20Ordinary/rdn-vitamin-c-suspension-23pct-ha-spheres-2pct-30ml.png?sw=800&sh=800&sm=fit',
    categoryName: 'Serums'
  },
  {
    name: 'EltaMD UV Clear Broad-Spectrum SPF 46',
    description: 'Lightweight, oil-free mineral sunscreen with niacinamide that calms and protects sensitive and acne-prone skin. Dermatologist-recommended and fragrance-free.',
    price: 4200,
    stock: 40,
    imageUrl: 'https://eltamd.com/cdn/shop/files/1_8.png?v=1776286999',
    categoryName: 'Sunscreen'
  },
  {
    name: 'EltaMD UV Sport Broad-Spectrum SPF 50+',
    description: 'Water-resistant sport sunscreen with zinc oxide that stays on through sweat and swimming for up to 80 minutes. Lightweight and non-greasy for active lifestyles.',
    price: 3600,
    stock: 35,
    imageUrl: 'https://eltamd.com/cdn/shop/files/UV_Sport_SPF_50_both_sizes.jpg?v=1735601045',
    categoryName: 'Sunscreen'
  },
  {
    name: 'CeraVe Daily Moisturizing Lotion',
    description: 'Lightweight lotion with three essential ceramides and hyaluronic acid that provides 24-hour hydration for normal to dry skin. Fragrance-free and non-comedogenic.',
    price: 1799,
    stock: 55,
    imageUrl: 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/moisturizers/daily-moisturizing-lotion/2025/daily-moisturizing-lotion_front.jpg',
    categoryName: 'Lotion'
  },
  {
    name: 'CeraVe Moisturizing Cream',
    description: 'Rich, non-greasy cream with three essential ceramides and hyaluronic acid for 24-hour moisturization. Restores the protective skin barrier for normal to dry skin.',
    price: 1999,
    stock: 55,
    imageUrl: 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/moisturizers/moisturizing-cream/moisturizing-cream-12oz-front.jpg',
    categoryName: 'Lotion'
  },
  {
    name: 'Sunday Riley A+ High-Dose Retinoid Serum',
    description: '6.5% retinoid power blend of stabilized retinoids and retinoid-like botanical extracts that smooths fine lines, refines texture, and evens skin tone overnight.',
    price: 10500,
    stock: 20,
    imageUrl: 'https://sundayriley.com/cdn/shop/files/A_1_grande.png',
    categoryName: 'Retinoids'
  },
  {
    name: 'Drunk Elephant A-Passioni Retinol Cream',
    description: '1% vegan retinol cream with supporting ingredients that visibly reduces signs of aging, refines pores, and improves overall skin tone and texture with minimal irritation.',
    price: 7400,
    stock: 22,
    imageUrl: 'https://www.drunkelephant.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_drunkelephant/default/dw197349f3/products/images/Skincare/Masks_Treatments/999DE00000100/A-Passioni_PDP_Carousel_01.jpg?sw=1408&sh=1408&sm=fit',
    categoryName: 'Retinoids'
  },
  {
    name: 'Tatcha The Water Cream',
    description: 'Oil-free, water-based moisturizer with Japanese wild rose and leopard lily that refines pores and boosts radiance. Delivers lasting moisture without heaviness.',
    price: 7200,
    stock: 30,
    imageUrl: 'https://tatcha.com/cdn/shop/files/WaterCream-pdp-FullSize-MainImage-1200x1200_c9ae41c1-e15c-46cc-b688-b120e45b0869.jpg?v=1766157498&width=1200',
    categoryName: 'Moisturizers'
  },
  {
    name: 'Drunk Elephant Protini Polypeptide Cream',
    description: 'Protein-rich moisturizer with signal peptides, pygmy waterlily, and amino acids that supports skin\'s natural repair process for firmer, smoother, and more resilient skin.',
    price: 6800,
    stock: 28,
    imageUrl: 'https://www.drunkelephant.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_drunkelephant/default/dwc318f9ff/products/images/2026/January/Protini_new_images/Protini-PDP_2026_Standard-Hero.jpg?sw=1408&sh=1408&sm=fit',
    categoryName: 'Moisturizers'
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
    where: { email: 'admin@glowshop.dev' },
    update: { name: 'Demo Admin', role: 'ADMIN', password: passwordHash },
    create: {
      name: 'Demo Admin',
      email: 'admin@glowshop.dev',
      password: passwordHash,
      role: 'ADMIN'
    }
  });

  console.log('Seed complete. Admin login: admin@glowshop.dev / Admin123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
