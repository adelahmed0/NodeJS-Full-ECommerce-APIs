import "dotenv/config";
import mongoose from "mongoose";
import slugify from "@sindresorhus/slugify";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Brand from "../models/brand.model.js";

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
