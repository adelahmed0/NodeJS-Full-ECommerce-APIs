import { Schema, Document, Query } from "mongoose";

/**
 * Plugin to automatically prepend base URL to image fields
 * Handles single strings and arrays of strings
 * Supports both http and https check
 */
export const imageURLPlugin = (
  schema: Schema,
  options: { folderName: string; fields: string[] },
) => {
  const { folderName, fields } = options;

  const setImageURL = (doc: any) => {
    if (!doc) return;
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;

    fields.forEach((field) => {
      if (doc[field] && typeof doc[field] === "string") {
        if (!doc[field].startsWith("http") && !doc[field].startsWith("https")) {
          doc[field] = `${baseUrl}/${folderName}/${doc[field]}`;
        }
      }
    });
  };

  // After fetching data from database
  schema.post("init", (doc) => {
    setImageURL(doc);
  });

  // After saving new data
  schema.post("save", (doc) => {
    setImageURL(doc);
  });
};

/**
 * Mongoose Schema Plugins
 * Reusable plugins for consistent schema behavior
 */

interface PluginOptions {
  removePassword?: boolean;
  removePasswordFields?: boolean;
}

/**
 * Plugin to standardize JSON output
 * - Adds virtual 'id' field
 * - Removes _id, __v, and optionally password
 * - Ensures 'id' is the first field in response
 *
 * @param {Schema} schema - Mongoose schema
 * @param {PluginOptions} options - Plugin options
 */
export const toJSONPlugin = (schema: Schema, options: PluginOptions = {}) => {
  const { removePassword = false, removePasswordFields = false } = options;

  // Add virtual id field
  schema.virtual("id").get(function (this: Document) {
    return this._id.toHexString();
  });

  // Configure toJSON transformation
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      const { _id, __v, id, ...rest } = ret;

      // Remove password if option is enabled
      if (removePassword && rest.password) {
        delete rest.password;
      }

      // Remove password-related fields if option is enabled
      if (removePasswordFields) {
        delete rest.passwordChangedAt;
        delete rest.passwordResetCode;
        delete rest.passwordResetCodeExpires;
        delete rest.passwordResetVerified;
      }

      // Return with id as first field
      return { id, ...rest };
    },
  });

  // Also configure toObject for consistency
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
 * Plugin to automatically populate referenced fields on find queries
 * Reusable plugin for consistent population behavior across schemas
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

  queryTypes.forEach((queryType) => {
    schema.pre(queryType, function (this: Query<any, any>) {
      // Check if this query is already being populated (nested populate)
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
