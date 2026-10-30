import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Auth Primitives & Security Services", () => {
  const BCRYPT_ROUNDS = 12;
  const TEST_JWT_SECRET = "super_secure_test_secret_key_1234567890";

  it("should hash passwords using exactly 12 bcrypt rounds", async () => {
    const plain = "StrongP@ssw0rd!2026";
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hash = await bcrypt.hash(plain, salt);

    assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"));
    assert.equal(bcrypt.getRounds(hash), 12);
  });

  it("should correctly verify matching password and reject incorrect password", async () => {
    const plain = "CorrectPassword123#";
    const salt = await bcrypt.genSalt(10); // test with 10 for speed in test
    const hash = await bcrypt.hash(plain, salt);

    const isMatch = await bcrypt.compare(plain, hash);
    const isWrongMatch = await bcrypt.compare("WrongPassword!", hash);

    assert.equal(isMatch, true);
    assert.equal(isWrongMatch, false);
  });

  it("should identify legacy hashes requiring security upgrade (< 12 rounds)", async () => {
    const legacySalt = await bcrypt.genSalt(10);
    const legacyHash = await bcrypt.hash("OldUserPassword", legacySalt);

    const modernSalt = await bcrypt.genSalt(12);
    const modernHash = await bcrypt.hash("ModernUserPassword", modernSalt);

    const legacyNeedsUpgrade = bcrypt.getRounds(legacyHash) < BCRYPT_ROUNDS;
    const modernNeedsUpgrade = bcrypt.getRounds(modernHash) < BCRYPT_ROUNDS;

    assert.equal(legacyNeedsUpgrade, true);
    assert.equal(modernNeedsUpgrade, false);
  });

  it("should generate cryptographically secure 6-digit OTPs within valid bounds", () => {
    for (let i = 0; i < 25; i++) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      assert.equal(otp.length, 6);
      assert.match(otp, /^\d{6}$/);
      const num = parseInt(otp, 10);
      assert.ok(num >= 100000 && num < 1000000);
    }
  });

  it("should generate and verify JWT auth tokens with expected payload claims", () => {
    const userId = "64f1a2b3c4d5e6f7a8b9c0d1";
    const token = jwt.sign({ id: userId }, TEST_JWT_SECRET, { expiresIn: "7d" });

    const decoded = jwt.verify(token, TEST_JWT_SECRET);
    assert.equal(decoded.id, userId);
    assert.ok(decoded.exp > decoded.iat);

    assert.throws(() => {
      jwt.verify(token, "wrong_secret_key");
    }, /invalid signature/);
  });
});
