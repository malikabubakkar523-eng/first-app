import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting safe VELOCE database seeding (Preserving all existing orders and customers)...");

  // 1. Store Settings (upsert)
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {
      currencySymbol: "Rs.",
      currencyCode: "PKR",
      freeShippingThreshold: 5000,
      defaultShippingFee: 250,
      announcement: "Complimentary nationwide express shipping on orders over Rs. 5,000. Use code VELOCE20 for 20% off your first purchase.",
    },
    create: {
      id: "default",
      storeName: "VELOCE",
      logo: "/logo.png",
      currencySymbol: "Rs.",
      currencyCode: "PKR",
      supportEmail: "concierge@veloce-shoes.com",
      supportPhone: "+92 (51) 835-6231",
      address: "Blue Area, Islamabad, Pakistan",
      freeShippingThreshold: 5000,
      defaultShippingFee: 250,
      announcement: "Complimentary nationwide express shipping on orders over Rs. 5,000. Use code VELOCE20 for 20% off your first purchase.",
      isMaintenanceMode: false,
    },
  });

  // 2. Admin & Customer accounts (upsert without deleting existing users)
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "adminveloco@gmail.com" },
    update: { role: "ADMIN", passwordHash: adminPasswordHash },
    create: {
      name: "Marcus Vance (Admin)",
      email: "adminveloco@gmail.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      phone: "+1 (555) 019-2834",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@veloce.com" },
    update: { role: "CUSTOMER" },
    create: {
      name: "Alexander Hayes",
      email: "customer@veloce.com",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "+92 300 3498120",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      addresses: {
        create: [
          {
            fullName: "Alexander Hayes",
            phone: "+92 300 3498120",
            street: "House 12, Street 4, Sector F-7/2",
            city: "Islamabad",
            state: "Federal Territory",
            postalCode: "44000",
            country: "Pakistan",
            isDefault: true,
          },
        ],
      },
    },
  });

  // Seed sample initial in-app notifications if none exist
  const notifCount = await prisma.notification.count();
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: customer.id,
          title: "Welcome to VELOCE",
          message: "Your private membership is now active. Explore the SS26 footwear archive.",
          type: "SYSTEM",
          isRead: false,
        },
        {
          userId: customer.id,
          title: "Spring Flash Promotion Live",
          message: "Enjoy up to 40% off marathon carbon racers with code VELOCE20.",
          type: "DEAL",
          isRead: false,
        },
      ],
    });
  }

  // 3. Brands (upsert)
  const brandsData = [
    { name: "Veloce Atelier", slug: "veloce-atelier", logo: "⚡", description: "Our handcrafted signature performance and luxury footwear." },
    { name: "Nike", slug: "nike", logo: "✔️", description: "World-class athletic footwear engineered for greatness." },
    { name: "Adidas Originals", slug: "adidas-originals", logo: "👟", description: "Iconic streetwear silhouettes with timeless heritage." },
    { name: "New Balance", slug: "new-balance", logo: "🏃", description: "Pioneering comfort, running tech and lifestyle aesthetics." },
    { name: "Balenciaga", slug: "balenciaga", logo: "💎", description: "Avant-garde haute couture luxury luxury footwear." },
    { name: "On Running", slug: "on-running", logo: "☁️", description: "Swiss-engineered cloud cushioning technology." },
  ];

  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }

  // 4. Categories (upsert)
  const categoriesData = [
    {
      name: "Sneakers",
      slug: "sneakers",
      description: "Iconic lifestyle and low-top street silhouettes for everyday distinction.",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
      order: 1,
    },
    {
      name: "Running",
      slug: "running",
      description: "High-performance carbon-plated road racers and daily trainers.",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
      order: 2,
    },
    {
      name: "Basketball",
      slug: "basketball",
      description: "Court-ready high-tops with unmatched ankle lockdown and responsiveness.",
      image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80",
      order: 3,
    },
    {
      name: "Casual & Loafers",
      slug: "casual",
      description: "Effortless versatility crafted from supple Italian full-grain leathers.",
      image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80",
      order: 4,
    },
    {
      name: "Boots",
      slug: "boots",
      description: "Rugged durability engineered with weather-sealed storm welts.",
      image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
      order: 5,
    },
    {
      name: "Training & Gym",
      slug: "training",
      description: "Stable lifting bases and breathable mesh uppers for intense sessions.",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
      order: 6,
    },
  ];

  for (const c of categoriesData) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // 5. Coupons (upsert)
  const oneWeekLater = new Date();
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);

  await prisma.coupon.upsert({
    where: { code: "VELOCE20" },
    update: {
      description: "20% off on all orders over Rs. 3,000",
      minOrderAmount: 3000,
      maxDiscount: 2000,
    },
    create: {
      code: "VELOCE20",
      description: "20% off on all orders over Rs. 3,000",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderAmount: 3000,
      maxDiscount: 2000,
      usageLimit: 500,
      usedCount: 42,
      expiresAt: oneWeekLater,
      isActive: true,
    },
  });

  console.log("✅ Database verified & safe seed finished without overwriting user orders!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
