import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Fashion", slug: "fashion" },
  { name: "Shoes", slug: "shoes" },
  { name: "Watches", slug: "watches" },
  { name: "Eyewear", slug: "eyewear" },
  { name: "Jewelry", slug: "jewelry" },
  { name: "Accessories", slug: "accessories" },
];

const products = [
  { name: "Aurora Oversized Sunglasses", category: "eyewear", price: 2499, sale: 1899, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80", ar: true },
  { name: "Nova Chronograph Watch", category: "watches", price: 8999, sale: 6999, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80", ar: true },
  { name: "Halo Drop Earrings", category: "jewelry", price: 1499, sale: null, img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80", ar: true },
  { name: "Drift Leather Jacket", category: "fashion", price: 6999, sale: 5499, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80", ar: false },
  { name: "Glide Running Sneakers", category: "shoes", price: 4499, sale: null, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", ar: true },
  { name: "Quartz Minimalist Watch", category: "watches", price: 3299, sale: 2799, img: "https://images.unsplash.com/photo-1495856458515-0637185db551?w=800&q=80", ar: true },
  { name: "Element Canvas Tote", category: "accessories", price: 1299, sale: null, img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80", ar: false },
  { name: "Orbit Hoop Earrings", category: "jewelry", price: 999, sale: 799, img: "https://images.unsplash.com/photo-1588444968742-2a0bb8e98d2d?w=800&q=80", ar: true },
  { name: "Lumen Aviators", category: "eyewear", price: 1999, sale: null, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80", ar: true },
  { name: "Ridge Chelsea Boots", category: "shoes", price: 5999, sale: 4799, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80", ar: false },
  { name: "Form Fit Tee", category: "fashion", price: 899, sale: null, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", ar: false },
  { name: "Signal Leather Belt", category: "accessories", price: 1199, sale: 899, img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80", ar: false },
];

async function main() {
  console.log("Seeding…");

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catMap[c.slug] = created.id;
  }

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: `${p.name} — a VIRTUA signature piece crafted with premium materials and a modern silhouette. Designed for everyday wear with a standout finish.`,
        categoryId: catMap[p.category],
        basePrice: p.price,
        salePrice: p.sale,
        sku: "SKU-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 180) + 5,
        isFeatured: Math.random() > 0.5,
        arEnabled: p.ar,
        images: { create: [{ url: p.img, sortOrder: 0 }] },
        variants: {
          create: [
            { size: "S", sku: `SKU-${Math.random().toString(36).slice(2, 8)}`, stock: 12 },
            { size: "M", sku: `SKU-${Math.random().toString(36).slice(2, 8)}`, stock: 20 },
            { size: "L", sku: `SKU-${Math.random().toString(36).slice(2, 8)}`, stock: 8 },
          ],
        },
      },
    });
    console.log("Created", product.name);
  }

  const adminPass = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@virtua.com" },
    update: {},
    create: { name: "Admin", email: "admin@virtua.com", passwordHash: adminPass, role: "ADMIN" },
  });

  const customerPass = await bcrypt.hash("customer123", 10);
  await prisma.user.upsert({
    where: { email: "customer@virtua.com" },
    update: {},
    create: { name: "Demo Customer", email: "customer@virtua.com", passwordHash: customerPass, role: "CUSTOMER" },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
