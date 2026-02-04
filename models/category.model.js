import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        unique: [true, "Category name already exists"],
        minLength: [3, "Category name must be at least 3 characters long"],
        maxLength: [32, "Category name must be at most 50 characters long"]
    },
    slug: {
        type: String,
        lowercase:true
    },
},{timestamps:true});

const Category = mongoose.model("Category", categorySchema);

export default Category;

