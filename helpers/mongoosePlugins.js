/**
 * Mongoose Schema Plugins
 * Reusable plugins for consistent schema behavior
 */

/**
 * Plugin to standardize JSON output
 * - Adds virtual 'id' field
 * - Removes _id, __v, and optionally password
 * - Ensures 'id' is the first field in response
 *
 * @param {Schema} schema - Mongoose schema
 * @param {Object} options - Plugin options
 * @param {boolean} options.removePassword - Whether to remove password field (default: false)
 */
export const toJSONPlugin = (schema, options = {}) => {
  const { removePassword = false } = options;

  // Add virtual id field
  schema.virtual("id").get(function () {
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
