import AppError from "../utils/AppError.js";

/**
 * Role-based authorization middleware.
 * Must be used AFTER the `protect` middleware (which sets req.user).
 *
 * Usage:
 *   router.post("/", protect, authorize("ADMIN"), createProduct);
 *
 * @param  {...string} roles — Allowed roles (e.g. "ADMIN", "USER")
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new AppError("Not authenticated", 401, "NOT_AUTHENTICATED")
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          403,
          "FORBIDDEN"
        )
      );
    }

    next();
  };
};

export default authorize;
