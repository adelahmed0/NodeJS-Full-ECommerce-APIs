import "dotenv/config";
import mongoose from "mongoose";
import slugify from "@sindresorhus/slugify";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Brand from "../models/brand.model.js";
import Product from "../models/product.model.js";

const categories = [
  {
    name: "Electronics",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/electronics.jpg",
  },
  {
    name: "Fashion",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/fashion.jpg",
  },
  {
    name: "Home & Garden",
    image: "https://res.cloudinary.com/demo/image/upload/v1620000000/home.jpg",
  },
  {
    name: "Books",
    image: "https://res.cloudinary.com/demo/image/upload/v1620000000/books.jpg",
  },
  {
    name: "Beauty & Health",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/beauty.jpg",
  },
];

const subCategories = [
  { name: "Laptops", parent: "Electronics" },
  { name: "Smartphones", parent: "Electronics" },
  { name: "Cameras", parent: "Electronics" },
  { name: "Men's Clothing", parent: "Fashion" },
  { name: "Women's Clothing", parent: "Fashion" },
  { name: "Footwear", parent: "Fashion" },
  { name: "Furniture", parent: "Home & Garden" },
  { name: "Kitchen Appliances", parent: "Home & Garden" },
  { name: "Decor", parent: "Home & Garden" },
  { name: "Fiction", parent: "Books" },
  { name: "Non-Fiction", parent: "Books" },
  { name: "Skincare", parent: "Beauty & Health" },
  { name: "Makeup", parent: "Beauty & Health" },
];

const brands = [
  {
    name: "Apple",
    image: "https://res.cloudinary.com/demo/image/upload/v1620000000/apple.png",
  },
  {
    name: "Samsung",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/samsung.png",
  },
  {
    name: "Nike",
    image: "https://res.cloudinary.com/demo/image/upload/v1620000000/nike.png",
  },
  {
    name: "Adidas",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/adidas.png",
  },
  {
    name: "Sony",
    image: "https://res.cloudinary.com/demo/image/upload/v1620000000/sony.png",
  },
  {
    name: "Canon",
    image: "https://res.cloudinary.com/demo/image/upload/v1620000000/canon.png",
  },
  {
    name: "Dell",
    image: "https://res.cloudinary.com/demo/image/upload/v1620000000/dell.png",
  },
];

const products = [
  {
    title: "iPhone 13 Pro",
    description:
      "The iPhone 13 Pro features a 6.1-inch Super Retina XDR display with ProMotion for a faster, more responsive feel. Cinematic mode adds shallow depth of field and shifts focus automatically in your videos.",
    quantity: 50,
    sold: 15,
    price: 999.99,
    priceAfterDiscount: 949.99,
    colors: ["Graphite", "Gold", "Silver", "Sierra Blue"],
    imageCover:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/iphone13-cover.jpg",
    images: [
      "https://res.cloudinary.com/demo/image/upload/v1620000000/iphone13-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1620000000/iphone13-2.jpg",
    ],
    category: "Electronics",
    brand: "Apple",
    subcategories: ["Smartphones"],
    ratingsAverage: 4.8,
    ratingsQuantity: 120,
  },
  {
    title: "MacBook Air M2",
    description:
      "Redesigned around the next-generation M2 chip, MacBook Air is strikingly thin and brings exceptional speed and power efficiency within its durable all-aluminum enclosure.",
    quantity: 30,
    sold: 10,
    price: 1199.5,
    priceAfterDiscount: 1099.0,
    colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
    imageCover:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/macbookm2-cover.jpg",
    images: [
      "https://res.cloudinary.com/demo/image/upload/v1620000000/macbookm2-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1620000000/macbookm2-2.jpg",
    ],
    category: "Electronics",
    brand: "Apple",
    subcategories: ["Laptops"],
    ratingsAverage: 4.9,
    ratingsQuantity: 85,
  },
  {
    title: "Samsung Galaxy S22 Ultra",
    description:
      "Welcome to the Epic Standard. With a built-in S Pen, Nightography camera, and battery that goes way beyond 24 hours, Galaxy S22 Ultra is redefining the smartphone experience.",
    quantity: 45,
    sold: 20,
    price: 899.09,
    priceAfterDiscount: 849.5,
    colors: ["Phantom Black", "Burgundy", "Green", "White"],
    imageCover:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/s22-cover.jpg",
    images: [
      "https://res.cloudinary.com/demo/image/upload/v1620000000/s22-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1620000000/s22-2.jpg",
    ],
    category: "Electronics",
    brand: "Samsung",
    subcategories: ["Smartphones"],
    ratingsAverage: 4.7,
    ratingsQuantity: 150,
  },
  {
    title: "Nike Air Max 270",
    description:
      "Nike's first lifestyle Air Max brings you style, comfort and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation.",
    quantity: 100,
    sold: 55,
    price: 150.75,
    priceAfterDiscount: 130.0,
    colors: ["Black/White", "Triple Red", "Navy Blue"],
    imageCover:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/nikeair-cover.jpg",
    images: [
      "https://res.cloudinary.com/demo/image/upload/v1620000000/nikeair-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1620000000/nikeair-2.jpg",
    ],
    category: "Fashion",
    brand: "Nike",
    subcategories: ["Footwear"],
    ratingsAverage: 4.6,
    ratingsQuantity: 210,
  },
  {
    title: "Sony WH-1000XM4 Headphones",
    description:
      "Sony’s intelligent industry-leading noise canceling headphones with premium sound elevate your listening experience with the ability to personalize and control everything you hear.",
    quantity: 60,
    sold: 25,
    price: 349.99,
    priceAfterDiscount: 299.99,
    colors: ["Black", "Silver", "Midnight Blue"],
    imageCover:
      "https://res.cloudinary.com/demo/image/upload/v1620000000/sony-cover.jpg",
    images: [
      "https://res.cloudinary.com/demo/image/upload/v1620000000/sony-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1620000000/sony-2.jpg",
    ],
    category: "Electronics",
    brand: "Sony",
    subcategories: ["Smartphones"],
    ratingsAverage: 4.8,
    ratingsQuantity: 320,
  },
];

/**
 * Seed Database
 */
const seedData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error("MONGO_URI is not defined in environment variables");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // 1. Delete existing data
    console.log("⚠ Deleting existing data...");
    await Product.deleteMany();
    await SubCategory.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    console.log("✓ Data deleted");

    // 2. Insert Categories
    console.log("Inserting categories...");
    const createdCategories = await Promise.all(
      categories.map((cat) =>
        Category.create({
          name: cat.name,
          slug: slugify(cat.name, { lowercase: true }),
          image: cat.image,
        }),
      ),
    );
    console.log(`✓ Inserted ${createdCategories.length} categories`);

    // 3. Insert SubCategories
    console.log("Inserting subcategories...");
    const subCatsToInsert = subCategories.map((sub) => {
      const parent = createdCategories.find((cat) => cat.name === sub.parent);
      return {
        name: sub.name,
        slug: slugify(sub.name, { lowercase: true }),
        category: parent?._id,
      };
    });

    const createdSubCategories = await SubCategory.insertMany(subCatsToInsert);
    console.log(`✓ Inserted ${createdSubCategories.length} subcategories`);

    // 4. Insert Brands
    console.log("Inserting brands...");
    const createdBrands = await Promise.all(
      brands.map((brand) =>
        Brand.create({
          name: brand.name,
          slug: slugify(brand.name, { lowercase: true }),
          image: brand.image,
        }),
      ),
    );
    console.log(`✓ Inserted ${createdBrands.length} brands`);

    // 5. Insert Products
    console.log("Inserting products...");
    const productsToInsert = products.map((prod) => {
      const category = createdCategories.find((c) => c.name === prod.category);
      const brand = createdBrands.find((b) => b.name === prod.brand);
      const prodSubCats = createdSubCategories
        .filter((sc) => prod.subcategories.includes(sc.name))
        .map((sc) => sc._id);

      return {
        ...prod,
        slug: slugify(prod.title, { lowercase: true }),
        category: category?._id,
        brand: brand?._id,
        subcategories: prodSubCats,
      };
    });

    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`✓ Inserted ${createdProducts.length} products`);

    console.log("★ Database seeded successfully! ★");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Handle process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

seedData();
