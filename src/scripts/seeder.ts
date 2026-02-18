import "dotenv/config";
import mongoose from "mongoose";
import slugify from "@sindresorhus/slugify";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Brand from "../models/brand.model.js";
import Product from "../models/product.model.js";
import { faker } from "@faker-js/faker";
import chalk from "chalk";

// التكوينات (التحكم في الأعداد)
const CATEGORIES_COUNT = 10;
const SUBCATEGORIES_COUNT = 20; // إجمالي الفئات الفرعية
const SUBCATEGORIES_PER_CATEGORY = 5; // الحد الأقصى لكل فئة
const BRANDS_COUNT = 10;
const PRODUCTS_COUNT = 50;

/**
 * دالة لتوزيع الفئات الفرعية على الكاتيجوريز مع احترام الماكس
 */
const distributeSubCategories = (categories: any[]) => {
  const subCats: any[] = [];
  const categoryCounts: Record<string, number> = {};

  categories.forEach((cat) => (categoryCounts[cat._id.toString()] = 0));

  for (let i = 0; i < SUBCATEGORIES_COUNT; i++) {
    const availableCats = categories.filter(
      (cat) => categoryCounts[cat._id.toString()] < SUBCATEGORIES_PER_CATEGORY,
    );

    if (availableCats.length === 0) break;

    const selectedCat = faker.helpers.arrayElement(availableCats);
    categoryCounts[selectedCat._id.toString()]++;

    const name = `${faker.commerce.productAdjective()} ${selectedCat.name} ${faker.string.alphanumeric(3)}`;
    subCats.push({
      name,
      slug: slugify(name, { lowercase: true }),
      category: selectedCat._id,
    });
  }
  return subCats;
};

/**
 * دالة إنشاء المنتجات وربطها بالكاتيجوري والـ سب كاتيجوري الصحيح
 */
const generateProducts = (
  categories: any[],
  brands: any[],
  subCategories: any[],
) => {
  return Array.from({ length: PRODUCTS_COUNT }).map(() => {
    const category = faker.helpers.arrayElement(categories);
    const brand = faker.helpers.arrayElement(brands);

    // اختيار فئات فرعية تنتمي حصرياً للفئة الرئيسية المختارة
    const validSubCats = subCategories
      .filter((sc) => sc.category.toString() === category._id.toString())
      .map((sc) => sc._id);

    const price = parseFloat(faker.commerce.price({ min: 10, max: 2000 }));
    const title = `${faker.commerce.productName()} ${faker.string.alphanumeric(5)}`;

    return {
      title,
      slug: slugify(title, { lowercase: true }),
      description: faker.commerce.productDescription(),
      quantity: faker.number.int({ min: 1, max: 100 }),
      sold: faker.number.int({ min: 0, max: 50 }),
      price,
      priceAfterDiscount: faker.datatype.boolean() ? price * 0.9 : undefined,
      colors: [faker.color.human(), faker.color.human()],
      imageCover: faker.image.url(),
      images: [faker.image.url(), faker.image.url()],
      category: category._id,
      brand: brand._id,
      subcategories: faker.helpers.arrayElements(
        validSubCats,
        faker.number.int({ min: 0, max: Math.min(3, validSubCats.length) }),
      ),
      ratingsAverage: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      ratingsQuantity: faker.number.int({ min: 0, max: 500 }),
    };
  });
};

const seedData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("MONGO_URI not found");

    await mongoose.connect(MONGO_URI);
    console.log(chalk.cyan.bold("🔌 Connected to MongoDB."));

    // 1. مسح البيانات القديمة
    console.log(chalk.yellow("⏳ Clearing old data..."));
    await Promise.all([
      Category.deleteMany(),
      SubCategory.deleteMany(),
      Brand.deleteMany(),
      Product.deleteMany(),
    ]);

    // 2. إنشاء الفئات الرئيسية
    console.log(chalk.blue("📂 Inserting Categories..."));
    const categoriesToCreate = Array.from({ length: CATEGORIES_COUNT }).map(
      () => {
        const name = `${faker.commerce.department()} ${faker.string.alphanumeric(5)}`;
        return {
          name,
          slug: slugify(name, { lowercase: true }),
          image: faker.image.url(),
        };
      },
    );
    const createdCategories = await Category.insertMany(categoriesToCreate);

    // 3. إنشاء الفئات الفرعية (موزعة على الفئات الرئيسية)
    console.log(chalk.blue("📂 Inserting SubCategories..."));
    const subCatsToCreate = distributeSubCategories(createdCategories);
    const createdSubCategories = await SubCategory.insertMany(subCatsToCreate);

    // 4. إنشاء الماركات
    console.log(chalk.blue("📂 Inserting Brands..."));
    const brandsToCreate = Array.from({ length: BRANDS_COUNT }).map(() => {
      const name = faker.company.name();
      return {
        name,
        slug: slugify(name, { lowercase: true }),
        image: faker.image.url(),
      };
    });
    const createdBrands = await Brand.insertMany(brandsToCreate);

    // 5. إنشاء المنتجات (الربط النهائي)
    console.log(chalk.blue("📂 Inserting Products..."));
    const productsToCreate = generateProducts(
      createdCategories,
      createdBrands,
      createdSubCategories,
    );
    await Product.insertMany(productsToCreate);

    console.log(
      chalk.magenta.bold("\n🚀 ★ DATABASE SEEDED SUCCESSFULLY! ★ 🚀\n"),
    );
    process.exit(0);
  } catch (error) {
    console.error(chalk.red.bold("❌ Error seeding database:"), error);
    process.exit(1);
  }
};

seedData();
