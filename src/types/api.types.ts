/**
 * Standard structure for single-resource API responses
 */
export interface IApiResponse<T> {
  status: boolean; // True for success, false for error
  message: string; // Human-readable message
  data: T | null; // The payload (can be null for deletes or errors)
}

/**
 * Enhanced structure for multi-resource responses with pagination metadata
 */
export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    total_count: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}
