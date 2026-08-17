import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting safe VELOCE database seeding...");

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

  // 2. Admin & Customer accounts
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

  // 3. Brands (upsert)
  const brandsData = [
    { name: "Veloce Atelier", slug: "veloce-atelier", logo: "⚡", description: "Our handcrafted signature performance and luxury footwear." },
    { name: "Nike", slug: "nike", logo: "✔️", description: "World-class athletic footwear engineered for greatness." },
    { name: "Adidas Originals", slug: "adidas-originals", logo: "👟", description: "Iconic streetwear silhouettes with timeless heritage." },
    { name: "New Balance", slug: "new-balance", logo: "🏃", description: "Pioneering comfort, running tech and lifestyle aesthetics." },
    { name: "Balenciaga", slug: "balenciaga", logo: "💎", description: "Avant-garde haute couture luxury footwear." },
    { name: "On Running", slug: "on-running", logo: "☁️", description: "Swiss-engineered cloud cushioning technology." },
    { name: "Jordan", slug: "jordan", logo: "🏀", description: "The legendary basketball dynasty footwear." },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandMap[b.slug] = brand.id;
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

  const catMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catMap[c.slug] = cat.id;
  }

  // 5. Rich Shoe Catalog
  const fullShoeCatalog = [
    {
      name: "VELOCE Carbon Strider Pro",
      slug: "veloce-carbon-strider-pro",
      description: "Propulsion-grade carbon plate marathon racer featuring dual-density Pebax foam cushioning and ultralight micro-mesh upper.",
      details: "Full-length 3K carbon plate, 40mm stack height, 195 grams weight, Continental rubber outsole traction.",
      price: 24500,
      salePrice: 19600,
      sku: "VEL-STRIDER-PRO",
      categoryId: catMap["running"],
      brandId: brandMap["veloce-atelier"],
      isFeatured: true,
      isNew: true,
      rating: 4.9,
      reviewCount: 38,
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80", isPrimary: false, order: 1 },
      ],
      sizes: ["39", "40", "41", "42", "43", "44", "45", "46"],
    },
    {
      name: "Nike Air Zoom Alphafly 3",
      slug: "nike-air-zoom-alphafly-3",
      description: "Marathon racing shoe fine-tuned with continuous ZoomX foam and dual forefoot Air Zoom pods for unprecedented energy return.",
      details: "Atomknit 3.0 upper, full-length Flyplate carbon fiber, integrated tongue cushioning, waffle traction pattern.",
      price: 36000,
      salePrice: 32400,
      sku: "NIKE-ALPHAFLY-3",
      categoryId: catMap["running"],
      brandId: brandMap["nike"],
      isFeatured: true,
      isNew: true,
      rating: 5.0,
      reviewCount: 49,
      images: [
        { url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&q=80", isPrimary: false, order: 1 },
      ],
      sizes: ["40", "41", "42", "43", "44", "45"],
    },
    {
      name: "On Cloudmonster Hyper Carbon",
      slug: "on-cloudmonster-hyper-carbon",
      description: "Maximum cushioning road runner built with Helion HF hyper-foam and CloudTec oversized elements for zero-gravity soft landings.",
      details: "Helion HF Pebax foam, CloudTec geometry, engineered microfiber mesh, high-grip rubber compound.",
      price: 27900,
      salePrice: null,
      sku: "ON-CLOUDMONSTER-HYPER",
      categoryId: catMap["running"],
      brandId: brandMap["on-running"],
      isFeatured: false,
      isNew: true,
      rating: 4.8,
      reviewCount: 22,
      images: [
        { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80", isPrimary: true, order: 0 },
      ],
      sizes: ["40", "41", "42", "43", "44", "45"],
    },
    {
      name: "VELOCE Tuscan Calfskin Low",
      slug: "veloce-tuscan-calfskin-low",
      description: "Handcrafted in Florence using hand-burnished full-grain Tuscan calfskin leather with stitched Margom rubber cupsole.",
      details: "Full Italian calf leather, stitched Margom sole, calfskin lining, waxed cotton laces, gold embossed serial.",
      price: 28900,
      salePrice: null,
      sku: "VEL-TUSCAN-LOW",
      categoryId: catMap["sneakers"],
      brandId: brandMap["veloce-atelier"],
      isFeatured: true,
      isNew: true,
      rating: 5.0,
      reviewCount: 42,
      images: [
        { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80", isPrimary: false, order: 1 },
      ],
      sizes: ["39", "40", "41", "42", "43", "44", "45"],
    },
    {
      name: "New Balance 990v6 Made in USA",
      slug: "new-balance-990v6-usa",
      description: "The pinnacle of lifestyle heritage. FuelCell foam midsole meets ENCAP rim support in pigskin suede and mesh.",
      details: "Made in USA, FuelCell foam, ENCAP midsole, pigskin suede overlays, reflective 3M accents.",
      price: 26500,
      salePrice: 23850,
      sku: "NB-990V6-GRY",
      categoryId: catMap["sneakers"],
      brandId: brandMap["new-balance"],
      isFeatured: true,
      isNew: false,
      rating: 4.9,
      reviewCount: 65,
      images: [
        { url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80", isPrimary: false, order: 1 },
      ],
      sizes: ["40", "41", "42", "43", "44", "45", "46"],
    },
    {
      name: "Adidas Samba OG Decon Leather",
      slug: "adidas-samba-og-decon",
      description: "Deconstructed low-profile terrace sneaker in buttery tumbled leather with iconic gum rubber outsole and gold foil branding.",
      details: "Collapsible heel counter, soft premium leather, suede T-toe overlay, classic gum sole.",
      price: 18500,
      salePrice: null,
      sku: "ADI-SAMBA-DECON",
      categoryId: catMap["sneakers"],
      brandId: brandMap["adidas-originals"],
      isFeatured: false,
      isNew: false,
      rating: 4.7,
      reviewCount: 31,
      images: [
        { url: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80", isPrimary: true, order: 0 },
      ],
      sizes: ["39", "40", "41", "42", "43", "44"],
    },
    {
      name: "Balenciaga Triple S Monochromatic",
      slug: "balenciaga-triple-s-mono",
      description: "Chunky multi-layered sculpted sole sneaker crafted with complex paneling, washed vintage effect, and embroidered toe sizing.",
      details: "Triple-stacked sole, TPU injected inside sole, round hiking laces, embossed Balenciaga logo.",
      price: 48000,
      salePrice: 42000,
      sku: "BAL-TRIPLE-S-MONO",
      categoryId: catMap["sneakers"],
      brandId: brandMap["balenciaga"],
      isFeatured: true,
      isNew: true,
      rating: 4.8,
      reviewCount: 17,
      images: [
        { url: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&q=80", isPrimary: true, order: 0 },
      ],
      sizes: ["40", "41", "42", "43", "44", "45"],
    },
    {
      name: "Air Jordan Retro 4 Industrial Blue",
      slug: "air-jordan-retro-4-industrial-blue",
      description: "Legendary 1989 hardwood silhouette featuring sculpted support wings, mesh side quarter panels, and visible Air-Sole unit.",
      details: "Full-grain white leather, Industrial Blue accents, polyurethane midsole, herringbone traction.",
      price: 34500,
      salePrice: null,
      sku: "JORDAN-4-IND-BLU",
      categoryId: catMap["basketball"],
      brandId: brandMap["jordan"],
      isFeatured: true,
      isNew: true,
      rating: 5.0,
      reviewCount: 56,
      images: [
        { url: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80", isPrimary: false, order: 1 },
      ],
      sizes: ["40", "41", "42", "43", "44", "45", "46"],
    },
    {
      name: "Nike Kobe 8 Protro Court Vision",
      slug: "nike-kobe-8-protro-court",
      description: "Ultralight low-top hardwood predator equipped with engineered mesh upper and full-length React foam drop-in midsole.",
      details: "Drop-in Nike React foam, engineered mesh, 3D anatomical heel clip, carbon fiber shank.",
      price: 31000,
      salePrice: 27900,
      sku: "NIKE-KOBE-8-PROTRO",
      categoryId: catMap["basketball"],
      brandId: brandMap["nike"],
      isFeatured: false,
      isNew: true,
      rating: 4.9,
      reviewCount: 33,
      images: [
        { url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80", isPrimary: true, order: 0 },
      ],
      sizes: ["41", "42", "43", "44", "45"],
    },
    {
      name: "VELOCE Monte Carlo Driving Loafer",
      slug: "veloce-monte-carlo-loafer",
      description: "Supple pebble-grain calfskin moccasin constructed with individual rubber driving nubs for peak pedal control and effortless leisure.",
      details: "Hand-stitched apron vamp, pebble grain calfskin, rubber driver studded sole, breathable calf lining.",
      price: 22000,
      salePrice: 17600,
      sku: "VEL-DRIVE-LOAFER",
      categoryId: catMap["casual"],
      brandId: brandMap["veloce-atelier"],
      isFeatured: true,
      isNew: false,
      rating: 4.8,
      reviewCount: 24,
      images: [
        { url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80", isPrimary: false, order: 1 },
      ],
      sizes: ["39", "40", "41", "42", "43", "44", "45"],
    },
    {
      name: "VELOCE Penny Loafer Nero Reserve",
      slug: "veloce-penny-loafer-nero",
      description: "Polished Italian box calf penny loafer with stacked leather heel, Blake-stitched sole, and subtle brass coin slot detail.",
      details: "Box calf leather, Blake welt construction, stacked leather heel with rubber tap, cushioned insole.",
      price: 25900,
      salePrice: null,
      sku: "VEL-PENNY-NERO",
      categoryId: catMap["casual"],
      brandId: brandMap["veloce-atelier"],
      isFeatured: false,
      isNew: true,
      rating: 4.9,
      reviewCount: 18,
      images: [
        { url: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80", isPrimary: true, order: 0 },
      ],
      sizes: ["40", "41", "42", "43", "44"],
    },
    {
      name: "VELOCE Chelsea Suede Vanguard",
      slug: "veloce-chelsea-suede-vanguard",
      description: "Classic British Chelsea boot rendered in weather-treated Italian suede with Goodyear-welted commando lug soles.",
      details: "Water-repellent suede, Goodyear storm welt, elastic side gussets, woven pull tabs, Vibram lug sole.",
      price: 31500,
      salePrice: null,
      sku: "VEL-CHELSEA-VAN",
      categoryId: catMap["boots"],
      brandId: brandMap["veloce-atelier"],
      isFeatured: true,
      isNew: true,
      rating: 4.9,
      reviewCount: 29,
      images: [
        { url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", isPrimary: false, order: 1 },
      ],
      sizes: ["40", "41", "42", "43", "44", "45"],
    },
    {
      name: "VELOCE Combat Lug Boot Noir",
      slug: "veloce-combat-lug-noir",
      description: "Tactical luxury combat silhouette forged with military-spec ballistic nylon and oiled full-grain leather on jagged combat outsoles.",
      details: "Oiled cowhide leather, 8-eyelet speed lacing, padded ankle collar, reinforced toe cap.",
      price: 33900,
      salePrice: 29500,
      sku: "VEL-COMBAT-NOIR",
      categoryId: catMap["boots"],
      brandId: brandMap["veloce-atelier"],
      isFeatured: false,
      isNew: false,
      rating: 4.8,
      reviewCount: 16,
      images: [
        { url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80", isPrimary: true, order: 0 },
      ],
      sizes: ["40", "41", "42", "43", "44", "45"],
    },
    {
      name: "Adidas Ultraboost Light Core",
      slug: "adidas-ultraboost-light-core",
      description: "Next-generation 30% lighter Boost capsule midsole with Primeknit+ adaptive upper and Linear Energy Push torsion system.",
      details: "Light BOOST foam, Primeknit+ textile, Continental Natural Rubber, 10mm midsole drop.",
      price: 19800,
      salePrice: null,
      sku: "ADI-UB-LIGHT",
      categoryId: catMap["training"],
      brandId: brandMap["adidas-originals"],
      isFeatured: true,
      isNew: false,
      rating: 4.8,
      reviewCount: 74,
      images: [
        { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80", isPrimary: true, order: 0 },
      ],
      sizes: ["39", "40", "41", "42", "43", "44", "45", "46"],
    },
    {
      name: "Nike Metcon 9 Cross Trainer",
      slug: "nike-metcon-9-cross",
      description: "Heavyweight lifting and high-intensity interval shoe built with enlarged Hyperlift heel plate and lace-lock clamp system.",
      details: "Hyperlift plate, extended rubber rope wrap, dual-density drop-in foam, wide stable base.",
      price: 21500,
      salePrice: 18900,
      sku: "NIKE-METCON-9",
      categoryId: catMap["training"],
      brandId: brandMap["nike"],
      isFeatured: false,
      isNew: true,
      rating: 4.9,
      reviewCount: 41,
      images: [
        { url: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&q=80", isPrimary: true, order: 0 },
      ],
      sizes: ["40", "41", "42", "43", "44", "45"],
    },
  ];

  for (const p of fullShoeCatalog) {
    const { images, sizes, ...prodFields } = p;
    if (!prodFields.categoryId) continue;

    const createdProd = await prisma.product.upsert({
      where: { slug: prodFields.slug },
      update: prodFields,
      create: prodFields,
    });

    // Seed images
    await prisma.productImage.deleteMany({ where: { productId: createdProd.id } });
    for (const img of images) {
      await prisma.productImage.create({
        data: {
          productId: createdProd.id,
          url: img.url,
          isPrimary: img.isPrimary,
          order: img.order,
        },
      });
    }

    // Seed sizes
    await prisma.productSize.deleteMany({ where: { productId: createdProd.id } });
    for (const s of sizes) {
      await prisma.productSize.create({
        data: {
          productId: createdProd.id,
          size: s,
          stock: 18,
          sku: `${createdProd.sku}-${s}`,
        },
      });
    }
  }

  // 6. Coupons (upsert)
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

  // 7. Seed SS26 Lookbook Gallery (Men, Women, and Kids)
  const gallerySeedData = [
    // Women
    {
      title: "Paris Fashion Week — Sleek Metallic Aura",
      category: "WOMEN",
      imageUrl: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=1200&q=85",
      description: "Styled on the Paris runway paired with draped monochrome silk. Engineered with reflective carbon accents and featherlight nitrogen midsole.",
      shoeModel: "VELOCE AURA NITRO 02",
      link: "/category/running",
      order: 1,
    },
    {
      title: "Milan Boulevard — Cloud Luxe Soft Strider",
      category: "WOMEN",
      imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=85",
      description: "Minimalist Italian leather trainer tailored for all-day urban movement with zero fatigue and cloud-soft step dynamics.",
      shoeModel: "VELOCE CLOUD WALK LUXE",
      link: "/category/lifestyle",
      order: 2,
    },
    {
      title: "Brooklyn Sunset — Chroma Velocity",
      category: "WOMEN",
      imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=85",
      description: "Pastel gradient breathable mesh sneaker tailored for high-cadence evening tempo runs across the Williamsburg waterfront.",
      shoeModel: "VELOCE CHROMA STRIDER V1",
      link: "/category/running",
      order: 3,
    },
    {
      title: "Studio Rebound — Aerodynamic Flow",
      category: "WOMEN",
      imageUrl: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&q=85",
      description: "Sculpted lateral support shoe crafted for high-intensity studio agility drills, HIIT cross-training, and contemporary dance.",
      shoeModel: "VELOCE STUDIO FLEX NITRO",
      link: "/category/sneakers",
      order: 4,
    },
    // Men
    {
      title: "Tokyo Underground — Carbon Stride High",
      category: "MEN",
      imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85",
      description: "Harajuku cyberpunk styling with our high-traction carbon runner. Engineered for midnight city exploration and neon aesthetics.",
      shoeModel: "VELOCE NITRO-CARBON 01",
      link: "/category/sneakers",
      order: 5,
    },
    {
      title: "Berlin Marathon Track Day — Speed Propulsion",
      category: "MEN",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=85",
      description: "Sub-2 hour marathon championship silhouette featuring dual curved carbon plates and supercritical rebound foam.",
      shoeModel: "VELOCE MARATHON RACER X",
      link: "/category/running",
      order: 6,
    },
    {
      title: "Tuscan Heritage — Burnished Calfskin Loafer",
      category: "MEN",
      imageUrl: "https://images.unsplash.com/photo-1512374382149-233c42b66137?w=1200&q=85",
      description: "Full-grain French calfskin hand-burnished in Florence. Goodyear welted with Vibram lug inserts for unrivaled boardroom presence.",
      shoeModel: "VELOCE TUSCAN ATELIER DERBY",
      link: "/category/boots",
      order: 7,
    },
    {
      title: "Alpine Trailhead — All-Terrain Rugged V2",
      category: "MEN",
      imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&q=85",
      description: "GORE-TEX waterproof membrane paired with deep lugged Vibram Megagrip traction for extreme technical mountain descents.",
      shoeModel: "VELOCE ALL-TERRAIN V2",
      link: "/category/sneakers",
      order: 8,
    },
    // Kids / Children
    {
      title: "Junior Champions — Dynamic Flex Stride",
      category: "KIDS",
      imageUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&q=85",
      description: "Designed specifically for growing athletes. Features ergonomic arch support, flexible groove outsoles, and durable scuff-resistant toe guards.",
      shoeModel: "VELOCE JUNIOR FLEX TRAINER",
      link: "/category/sneakers",
      order: 9,
    },
    {
      title: "Urban Playground — Neon Bounce Junior",
      category: "KIDS",
      imageUrl: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1200&q=85",
      description: "Vibrant high-energy cushioning with quick-lock speed laces. Keeps active kids fast, comfortable, and visible with 360° reflective details.",
      shoeModel: "VELOCE NEO-BOUNCE KIDS",
      link: "/category/running",
      order: 10,
    },
    {
      title: "Adventure Ready — Mini Trail Explorer",
      category: "KIDS",
      imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&q=85",
      description: "Rugged yet featherlight trail shoe for school adventures, camping trips, and weekend park runs. Reinforced water-resistant upper.",
      shoeModel: "VELOCE MINI ALL-TERRAIN",
      link: "/category/sneakers",
      order: 11,
    },
    {
      title: "Heritage Retro High — Junior Court Edition",
      category: "KIDS",
      imageUrl: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=85",
      description: "Classic basketball court inspired high-top crafted with soft eco-leather, padded ankle collars, and non-marking gum soles.",
      shoeModel: "VELOCE RETRO MINI HIGH",
      link: "/category/lifestyle",
      order: 12,
    },
  ];

  for (const g of gallerySeedData) {
    const existing = await prisma.galleryItem.findFirst({
      where: { title: g.title },
    });
    if (existing) {
      await prisma.galleryItem.update({
        where: { id: existing.id },
        data: g,
      });
    } else {
      await prisma.galleryItem.create({
        data: {
          ...g,
          isActive: true,
        },
      });
    }
  }

  console.log("✅ Complete safe seeding finished without touching existing orders or users!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
