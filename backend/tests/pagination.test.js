import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Pagination & Query Optimization Logic", () => {
  const calculatePagination = (total, pageInput, limitInput, maxLimit = 100) => {
    const page = Math.max(1, parseInt(pageInput, 10) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(limitInput, 10) || 20)
    );
    const skip = (page - 1) * limit;
    const pages = Math.ceil(total / limit);

    return { page, limit, skip, pages, total };
  };

  it("should compute correct pagination metadata with default values", () => {
    const meta = calculatePagination(55, undefined, undefined);
    assert.equal(meta.page, 1);
    assert.equal(meta.limit, 20);
    assert.equal(meta.skip, 0);
    assert.equal(meta.pages, 3);
    assert.equal(meta.total, 55);
  });

  it("should clamp limit to max 100 to prevent denial of service", () => {
    const meta = calculatePagination(500, 1, 99999);
    assert.equal(meta.limit, 100);
    assert.equal(meta.pages, 5);
  });

  it("should clamp negative page to 1 and handle zero/falsy limit defaulting to 20", () => {
    const meta = calculatePagination(50, -5, 0);
    assert.equal(meta.page, 1);
    assert.equal(meta.limit, 20);
    assert.equal(meta.skip, 0);
  });

  it("should compute accurate skip offset for arbitrary page numbers", () => {
    const meta = calculatePagination(100, 4, 15);
    assert.equal(meta.page, 4);
    assert.equal(meta.limit, 15);
    assert.equal(meta.skip, 45); // (4 - 1) * 15 = 45
    assert.equal(meta.pages, 7);
  });

  it("should handle empty result sets gracefully (0 pages)", () => {
    const meta = calculatePagination(0, 1, 20);
    assert.equal(meta.total, 0);
    assert.equal(meta.pages, 0);
    assert.equal(meta.skip, 0);
  });

  it("should canonicalize JUICE to JUICES in category query filters", () => {
    const rawCategories = "HONEY, JUICE, PULSES";
    const parsed = rawCategories.split(",").map((c) => {
      const trimmed = c.trim().toUpperCase();
      return trimmed === "JUICE" ? "JUICES" : trimmed;
    });
    assert.deepEqual(parsed, ["HONEY", "JUICES", "PULSES"]);
  });
});
