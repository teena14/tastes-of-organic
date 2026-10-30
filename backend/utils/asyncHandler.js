/**
 * Wraps an async route handler / middleware so that rejected promises
 * are automatically forwarded to Express's error-handling middleware.
 *
 * Note: Express 5 handles async errors natively, so this wrapper is
 * technically optional — but it keeps the intent explicit and works
 * equally well on Express 4 if the project ever downgrades.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
