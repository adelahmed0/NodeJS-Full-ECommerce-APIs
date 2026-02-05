export interface IApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    total_count: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}
