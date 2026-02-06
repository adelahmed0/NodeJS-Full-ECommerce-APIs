import { ICategory } from "../models/category.model.js";

export interface IPagination {
  total_count: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface IAllCategoriesResponse {
  categories: ICategory[];
  pagination: IPagination;
}
