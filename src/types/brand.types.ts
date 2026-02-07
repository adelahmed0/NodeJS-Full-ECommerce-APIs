import { IBrand } from "../models/brand.model.js";

export interface IPagination {
  total_count: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface IAllBrandsResponse {
  brands: IBrand[];
  pagination: IPagination;
}
