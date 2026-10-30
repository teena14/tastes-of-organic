/**
 * Order status constants and state machine transitions.
 */

export const ORDER_STATUS = {
  PLACED: "placed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

export const ALLOWED_STATUS_TRANSITIONS = {
  placed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

/**
 * Validates whether a state transition is legal in the order lifecycle.
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
export const isValidStatusTransition = (currentStatus, nextStatus) => {
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};
