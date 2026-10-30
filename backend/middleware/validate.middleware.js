import AppError from "../utils/AppError.js";

/**
 * Middleware factory for request validation using Zod schemas.
 * Supports validating body, query, and/or params.
 *
 * @param {object} schemas
 * @param {import("zod").ZodSchema} [schemas.body]
 * @param {import("zod").ZodSchema} [schemas.query]
 * @param {import("zod").ZodSchema} [schemas.params]
 */
export const validate = ({ body, query, params }) => {
  return (req, _res, next) => {
    const errors = [];

    if (body) {
      const result = body.safeParse(req.body);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            location: "body",
          }))
        );
      } else {
        req.body = result.data;
      }
    }

    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            location: "query",
          }))
        );
      } else {
        req.query = result.data;
      }
    }

    if (params) {
      const result = params.safeParse(req.params);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            location: "params",
          }))
        );
      } else {
        req.params = result.data;
      }
    }

    if (errors.length > 0) {
      const message = errors.map((e) => e.message).join("; ");
      const appError = new AppError(message, 400, "VALIDATION_ERROR");
      appError.errors = errors;
      return next(appError);
    }

    next();
  };
};

export default validate;
