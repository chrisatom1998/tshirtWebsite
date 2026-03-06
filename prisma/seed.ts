import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { SHIRT_SIZES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL || "owner@threadline.local";
const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

const sampleProducts = [
  {
    title: "After Hours Heavy Tee",
    slug: "after-hours-heavy-tee",
    description:
      "A heavyweight tee with a front chest mark and oversized back print inspired by city routes after midnight. Built for all-day wear with a relaxed silhouette and soft handfeel.",
    price: 4200,
    featured: true,
    images: ["/products/after-hours-front.svg", "/products/after-hours-back.svg"],
    colors: ["Black", "Bone"],
  },
  {
    title: "Signal Fade Box Tee",
    slug: "signal-fade-box-tee",
    description:
      "A washed box-fit tee with a fading signal graphic across the shoulders and clean front lockup. Meant to look broken-in on day one without losing structure.",
    price: 3800,
    featured: true,
    images: ["/products/signal-fade-front.svg", "/products/signal-fade-back.svg"],
    colors: ["White", "Coal"],
  },
  {
    title: "Off Grid Studio Tee",
    slug: "off-grid-studio-tee",
    description:
      "A premium cotton tee with understated typography on the chest and bold framing artwork on the back. Easy to style with workwear, denim, or sweats.",
    price: 3600,
    featured: true,
    images: ["/products/off-grid-front.svg", "/products/off-grid-back.svg"],
    colors: ["Forest", "Sand"],
  },
  {
    title: "Harbor Print Vintage Tee",
    slug: "harbor-print-vintage-tee",
    description:
      "Garment-dyed vintage tee with weathered harbor art and a clean, open neckline. The fit lands between classic and oversized with enough drape for repeat wear.",
    price: 4000,
    featured: false,
    images: ["/products/harbor-front.svg", "/products/harbor-back.svg"],
    colors: ["Navy", "Stone"],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      name: "Store Owner",
      passwordHash,
    },
  });

  for (const product of sampleProducts) {
    const sizes = [...SHIRT_SIZES];
    const variants = product.colors.flatMap((color, colorIndex) =>
      SHIRT_SIZES.map((size, sizeIndex) => ({
        size,
        color,
        price: product.price,
        inventory: 6 + ((sizeIndex + colorIndex) % 5),
        sortOrder: colorIndex * SHIRT_SIZES.length + sizeIndex,
        sku: `${slugify(product.title)}-${size.toLowerCase()}-${slugify(color)}`,
      })),
    );

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        description: product.description,
        price: product.price,
        featured: product.featured,
        isActive: true,
        inventoryCount: variants.reduce((sum, variant) => sum + variant.inventory, 0),
        sizes,
        colors: product.colors,
        images: {
          deleteMany: {},
          create: product.images.map((url, index) => ({
            url,
            alt: `${product.title} image ${index + 1}`,
            position: index,
          })),
        },
        variants: {
          deleteMany: {},
          create: variants,
        },
      },
      create: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        featured: product.featured,
        isActive: true,
        inventoryCount: variants.reduce((sum, variant) => sum + variant.inventory, 0),
        sizes,
        colors: product.colors,
        images: {
          create: product.images.map((url, index) => ({
            url,
            alt: `${product.title} image ${index + 1}`,
            position: index,
          })),
        },
        variants: {
          create: variants,
        },
      },
    });
  }

  console.log(`Seeded admin user ${adminEmail}`);
  console.log("Seeded sample t-shirt catalog.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
