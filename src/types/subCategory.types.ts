import { ISubCategory } from "../models/subCategory.model.js";

export interface IPagination {
  total_count: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface IAllSubCategoriesResponse {
  subCategories: ISubCategory[];
  pagination: IPagination;
}
