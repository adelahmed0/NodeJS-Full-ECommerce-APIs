import mongoose,{Schema, Document,Types} from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

export interface ISubCategory extends Document {
  name: string;
  slug: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new Schema<ISubCategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique:[true, "SubCategory name must be unique"],
    minlength:[3, "Too short subCategory name"],
    maxlength:[32, "Too long subCategory name"],
  },
  slug: {
    type: String,
    lowercase: true,
  },
  category: {
    type: Types.ObjectId,
    ref: "Category",
    required: [true, "SubCategory must belong to a parent category"],
  },
}, { timestamps: true });

subCategorySchema.plugin(toJSONPlugin)

const SubCategory = mongoose.model<ISubCategory>("SubCategory", subCategorySchema);

export default SubCategory;