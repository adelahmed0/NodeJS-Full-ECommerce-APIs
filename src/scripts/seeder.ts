import "dotenv/config";
import mongoose from "mongoose";
import slugify from "@sindresorhus/slugify";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Brand from "../models/brand.model.js";
import Product from "../models/product.model.js";
import { faker } from "@faker-js/faker";

const CATEGORIES_COUNT = 5;
const SUBCATEGORIES_COUNT = 15;
const BRANDS_COUNT = 10;
const PRODUCTS_COUNT = 50;

interface ICategoryData {
  name: string;
  image: string;
}

interface IBrandData {
  name: string;
  image: string;
}

interface ISubCategoryData {
  name: string;
  parent: string;
}

const generateCategories = (): ICategoryData[] => {
  return Array.from({ length: CATEGORIES_COUNT }).map(() => ({
    name: faker.commerce.department() + " " + faker.string.alphanumeric(5), // Ensure uniqueness
    image: faker.image.urlLoremFlickr({ category: "business" }),
  }));
};

const generateBrands = (): IBrandData[] => {
  return Array.from({ length: BRANDS_COUNT }).map(() => ({
    name: faker.company.name(),
    image: faker.image.urlLoremFlickr({ category: "fashion" }),
  }));
};

const generateSubCategories = (categories: ICategoryData[]): ISubCategoryData[] => {
  return Array.from({ length: SUBCATEGORIES_COUNT }).map(() => ({
    name: faker.commerce.productName() + " " + faker.string.alphanumeric(5),
    parent: faker.helpers.arrayElement(categories).name,
  }));
};

const generateProducts = (
  categories: ICategoryData[],
  brands: IBrandData[],
  subCategories: ISubCategoryData[],
) => {
  return Array.from({ length: PRODUCTS_COUNT }).map(() => {
    const price = parseFloat(faker.commerce.price({ min: 10, max: 2000 }));
    const hasDiscount = faker.datatype.boolean();
    const priceAfterDiscount = hasDiscount
      ? parseFloat((price * 0.9).toFixed(2))
      : undefined;

    const brand = faker.helpers.arrayElement(brands);
    const category = faker.helpers.arrayElement(categories);
    // Find subcategories that belong to this category
    const categorySubCats = subCategories.filter(sc => sc.parent === category.name);
    
    // Fallback if no subcats match (shouldn't happen with random selection but for safety)
    const selectedSubCats = categorySubCats.length > 0 
      ? faker.helpers.arrayElements(categorySubCats, faker.number.int({ min: 1, max: Math.min(3, categorySubCats.length) }))
      : [faker.helpers.arrayElement(subCategories)];

    return {
      title: faker.commerce.productName() + " " + faker.string.alphanumeric(5),
      description: faker.commerce.productDescription(),
      quantity: faker.number.int({ min: 1, max: 100 }),
      sold: faker.number.int({ min: 0, max: 50 }),
      price,
      priceAfterDiscount,
      colors: Array.from({ length: 3 }).map(() => faker.color.human()),
      imageCover: faker.image.urlLoremFlickr({ category: "product" }),
      images: Array.from({ length: 3 }).map(() =>
        faker.image.urlLoremFlickr({ category: "product" }),
      ),
      category: category.name,
      brand: brand.name,
      subcategories: selectedSubCats.map(sc => sc.name),
      ratingsAverage: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      ratingsQuantity: faker.number.int({ min: 0, max: 500 }),
    };
  });
};

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
    const categoriesData = generateCategories();
    const createdCategories = await Promise.all(
      categoriesData.map((cat) =>
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
    const subCategoriesData = generateSubCategories(categoriesData);
    const subCatsToInsert = subCategoriesData.map((sub) => {
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
    const brandsData = generateBrands();
    const createdBrands = await Promise.all(
      brandsData.map((brand) =>
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
    const productsData = generateProducts(
      categoriesData,
      brandsData,
      subCategoriesData,
    );
    const productsToInsert = productsData.map((prod) => {
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
