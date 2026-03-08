import { Query } from "mongoose";

/**
 * ApiFeatures helper class to handle common Mongoose query operations
 * like filtering, sorting, searching, and pagination.
 */
class ApiFeatures<T> {
  // The Mongoose query object (e.g., Product.find())
  public mongooseQuery: Query<T[], T>;
  // The raw query string from the request (e.g., req.query)
  private queryString: any;
  // Metadata about the current pagination state
  public paginationResult?: {
    total_count: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };

  constructor(mongooseQuery: Query<T[], T>, queryString: any) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  /**
   * 1) Filtration
   * Removes specific keywords from the query string and applies Mongoose operators (gte, gt, etc.)
   */
  filter() {
    const queryStringObj = { ...this.queryString };
    // Fields to be handled by other methods
    const excludeFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "keyword",
      "search",
      "per_page",
    ];
    excludeFields.forEach((field) => delete queryStringObj[field]);

    // Convert operators like [gte, gt, lte, lt] to MongoDB $ syntax
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Apply the filtered query object to the Mongoose query
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  /**
   * 2) Sorting
   * Sorts the results based on the 'sort' query parameter or defaults to '-createdAt'
   */
  sort() {
    if (this.queryString.sort) {
      // Convert comma-separated string to space-separated for Mongoose (e.g., 'price,-sold' -> 'price -sold')
      const sortBy = (this.queryString.sort as string).split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      // Default sort by newest first
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  /**
   * 3) Field Limiting (Projection)
   * Selects specific fields to return in the results
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      // Exclude the __v field by default
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  /**
   * 4) Search
   * Performs a regex search across specified fields (defaults to title and description)
   */
  search(searchFields: string[] = ["title", "description"]) {
    const search = this.queryString.search || this.queryString.keyword;
    if (search) {
      // Case-insensitive regex search
      const query = {
        $or: searchFields.map((field) => ({
          [field]: { $regex: search, $options: "i" },
        })),
      };
      this.mongooseQuery = this.mongooseQuery.find(query as any);
    }
    return this;
  }

  /**
   * 5) Count Documents
   * Helper to get the total number of documents matching the current filters
   */
  async countDocuments(): Promise<number> {
    const count = await this.mongooseQuery.clone().countDocuments();
    return count;
  }

  /**
   * 6) Pagination
   * Applies limit and skip to the query and calculates pagination metadata
   */
  async paginate(countDocuments?: number) {
    // If count not provided, calculate it automatically
    const totalCount = countDocuments ?? (await this.countDocuments());

    const page = Math.max(1, parseInt(this.queryString.page) || 1);
    const limit = Math.max(
      1,
      parseInt(this.queryString.limit || this.queryString.per_page) || 10,
    );
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // Store pagination results for API responses
    this.paginationResult = {
      total_count: totalCount,
      current_page: page,
      last_page: totalPages,
      per_page: limit,
    };

    // Apply skip and limit to the mongoose query
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;
