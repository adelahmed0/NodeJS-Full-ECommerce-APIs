import { Schema, Document } from "mongoose";

/**
 * Mongoose Schema Plugins
 * Reusable plugins for consistent schema behavior
 */

interface PluginOptions {
  removePassword?: boolean;
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
  const { removePassword = false } = options;

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

      return { id, ...rest };
    },
  });
};
