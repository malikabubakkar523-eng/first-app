import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const galleryItems = [
  {
    id: "gallery-1",
    title: "Carbon Strides — SS26 Campaign",
    category: "WOMEN",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80",
    description: "Elena Vance wearing Veloce Apex Carbon Ghost in high-altitude marathon pace trials.",
    shoeModel: "Veloce Apex Carbon Ghost",
    order: 1,
  },
  {
    id: "gallery-2",
    title: "Urban Sprint & Street Distinction",
    category: "MEN",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80",
    description: "Marcus Cole styled in tailored wool trousers and Veloce Milan Leather Low.",
    shoeModel: "Veloce Milan Leather Low",
    order: 2,
  },
  {
    id: "gallery-3",
    title: "Aura Track & Supercritical Foam",
    category: "WOMEN",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&q=80",
    description: "High-fashion activewear editorial featuring Veloce Strata Nitro Racer.",
    shoeModel: "Veloce Strata Nitro Racer",
    order: 3,
  },
  {
    id: "gallery-4",
    title: "Tuscan Workshop & Heritage Trail",
    category: "MEN",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&q=80",
    description: "Goodyear-welted Tuscan boot craftsmanship paired with rugged alpine outerwear.",
    shoeModel: "Veloce Tuscan Goodyear Boot",
    order: 4,
  },
  {
    id: "gallery-5",
    title: "Metropolitan Pace & Carbon Flight",
    category: "WOMEN",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=80",
    description: "Sunrise pace run along Brooklyn waterfront wearing Veloce Quantum Carbon.",
    shoeModel: "Veloce Quantum Carbon",
    order: 5,
  },
  {
    id: "gallery-6",
    title: "Minimalist Runway Editorial",
    category: "MEN",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&q=80",
    description: "Clean monochrome aesthetics styled with Veloce Phantom All-Black Silhouette.",
    shoeModel: "Veloce Phantom Knit",
    order: 6,
  },
];

async function seedGallery() {
  console.log("Seeding Gallery Items...");
  for (const item of galleryItems) {
    await prisma.galleryItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Seeded ${galleryItems.length} Gallery items!`);
}

seedGallery()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
