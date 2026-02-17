import { Query } from "mongoose";

class ApiFeatures<T> {
  public mongooseQuery: Query<T[], T>;
  private queryString: any;
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
   * 1) Filteration
   */
  filter() {
    const queryStringObj = { ...this.queryString };
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

    // Apply filtration using [gte, gt, lte, lt]
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  /**
   * 2) Sorting
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  /**
   * 3) Field Limiting
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  /**
   * 4) Search
   */
  search(searchFields: string[] = ["title", "description"]) {
    const search = this.queryString.search || this.queryString.keyword;
    if (search) {
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
   * Get the count of filtered/searched documents
   */
  async countDocuments(): Promise<number> {
    const count = await this.mongooseQuery.clone().countDocuments();
    return count;
  }

  /**
   * 6) Pagination
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

    // Calculate pagination metadata
    this.paginationResult = {
      total_count: totalCount,
      current_page: page,
      last_page: totalPages,
      per_page: limit,
    };

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;
