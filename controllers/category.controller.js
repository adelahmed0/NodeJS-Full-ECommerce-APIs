import Category from "../models/category.model.js";
import slugify from "slugify";
import asyncHandler from "express-async-handler";

export const createCategory = asyncHandler(async (req, res) => {
    
        const { name, image } = req.body;
        const slug = slugify(name, { lower: true });
        const category = await Category.create({ name, image, slug });
        res.status(201).json(category);
    
});

// http://localhost:8000/api/categories