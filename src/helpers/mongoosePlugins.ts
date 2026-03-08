/**
 * Mongoose Global Plugins
 * This file contains reusable Mongoose plugins that standardize
 * schema behavior across the application, including image URL formatting,
 * JSON serialization, and automatic population.
 */
import { Schema, Document, Query } from "mongoose";

/**
 * Image URL Plugin
 * Automatically prepends the application's base URL to specified image paths.
 * Ensures that relative file paths stored in the DB are served as full absolute URLs.
 *
 * @param schema - The Mongoose schema to apply the plugin to.
 * @param options - Configuration containing the folder name and target fields.
 */
export const imageURLPlugin = (
  schema: Schema,
  options: { folderName: string; fields: string[] },
) => {
  const { folderName, fields } = options;

  /**
   * Internal helper to set the absolute URL for a document.
   */
  const setImageURL = (doc: any) => {
    if (!doc) return;
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;

    fields.forEach((field) => {
      // Only prefix if it's a relative path (doesn't start with http/https)
      if (doc[field] && typeof doc[field] === "string") {
        if (!doc[field].startsWith("http") && !doc[field].startsWith("https")) {
          doc[field] = `${baseUrl}/${folderName}/${doc[field]}`;
        }
      }
    });
  };

  // Process URL after fetching from DB (init) and after saving new data (save)
  schema.post("init", (doc) => {
    setImageURL(doc);
  });

  schema.post("save", (doc) => {
    setImageURL(doc);
  });
};

/**
 * Plugin Options for JSON/Object transformations
 */
interface PluginOptions {
  removePassword?: boolean;
  removePasswordFields?: boolean;
}

/**
 * JSON Standardization Plugin
 * Enhances document serialization by:
 * 1. Adding a virtual 'id' field.
 * 2. Removing MongoDB internal fields (_id, __v).
 * 3. Optionally stripping sensitive password data.
 * 4. Ordering 'id' as the first property in the output.
 *
 * @param schema - The Mongoose schema.
 * @param options - Transformation settings.
 */
export const toJSONPlugin = (schema: Schema, options: PluginOptions = {}) => {
  const { removePassword = false, removePasswordFields = false } = options;

  // Define the virtual 'id' getter
  schema.virtual("id").get(function (this: Document) {
    return this._id.toHexString();
  });

  // Apply transformation to JSON output (used by res.json())
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      const { _id, __v, id, ...rest } = ret;

      // Handle sensitive field removal
      if (removePassword && rest.password) {
        delete rest.password;
      }

      if (removePasswordFields) {
        delete rest.passwordChangedAt;
        delete rest.passwordResetCode;
        delete rest.passwordResetCodeExpires;
        delete rest.passwordResetVerified;
      }

      // Reconstruct object with 'id' at the top for clean API responses
      return { id, ...rest };
    },
  });

  // Apply transformation to hard objects for internal consistency
  schema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      const { _id, __v, id, ...rest } = ret;

      if (removePassword && rest.password) {
        delete rest.password;
      }

      if (removePasswordFields) {
        delete rest.passwordChangedAt;
        delete rest.passwordResetCode;
        delete rest.passwordResetCodeExpires;
        delete rest.passwordResetVerified;
      }

      return { id, ...rest };
    },
  });
};

/**
 * Global Population Plugin
 * Standardizes automatic population of referenced fields across queries.
 *
 * @param schema - The Mongoose schema.
 * @param options - Fields to populate and optional query type filtering.
 */
export const populatePlugin = (
  schema: Schema,
  options: {
    populateFields: Array<{
      path: string;
      select?: string;
    }>;
    queryTypes?: RegExp[];
    skipNestedPopulate?: boolean;
  },
) => {
  const {
    populateFields,
    queryTypes = [/^find/],
    skipNestedPopulate = false,
  } = options;

  // Apply pre-hooks to all matching query types (e.g., find, findOne)
  queryTypes.forEach((queryType) => {
    schema.pre(queryType, function (this: Query<any, any>) {
      // Avoid redundant population if the query is already nested
      if (skipNestedPopulate) {
        const populatedPaths = this.getPopulatedPaths();
        if (populatedPaths && populatedPaths.length > 0) {
          return;
        }
      }

      populateFields.forEach((field) => {
        this.populate(field);
      });
    });
  });
};
