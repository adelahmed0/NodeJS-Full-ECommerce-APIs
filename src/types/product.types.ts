import { IProduct } from "../models/product.model.js";

export interface IPagination {
  total_count: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface IAllProductsResponse {
  products: IProduct[];
  pagination: IPagination;
}
