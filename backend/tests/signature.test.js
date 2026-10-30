import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

// PhonePe signature verification formula
const verifyPhonePeSignature = (encodedResponse, receivedChecksum, saltKey, saltIndex = "1") => {
  if (!receivedChecksum || !encodedResponse || !saltKey) return false;

  const expected =
    crypto
      .createHash("sha256")
      .update(encodedResponse + saltKey)
      .digest("hex") +
    "###" +
    saltIndex;

  return receivedChecksum === expected;
};

describe("PhonePe Callback Signature Verification", () => {
  const saltKey = "mock_salt_key_12345";
  const saltIndex = "1";

  it("should successfully verify a valid checksum", () => {
    const payload = Buffer.from(
      JSON.stringify({ code: "PAYMENT_SUCCESS", merchantTransactionId: "TXN_123" })
    ).toString("base64");

    const validChecksum =
      crypto
        .createHash("sha256")
        .update(payload + saltKey)
        .digest("hex") +
      "###" +
      saltIndex;

    const isValid = verifyPhonePeSignature(payload, validChecksum, saltKey, saltIndex);
    assert.equal(isValid, true);
  });

  it("should reject a forged checksum", () => {
    const payload = Buffer.from(
      JSON.stringify({ code: "PAYMENT_SUCCESS", merchantTransactionId: "TXN_123" })
    ).toString("base64");

    const fakeChecksum = "forged_hash_value###1";
    const isValid = verifyPhonePeSignature(payload, fakeChecksum, saltKey, saltIndex);
    assert.equal(isValid, false);
  });

  it("should reject tampered payload", () => {
    const payload1 = Buffer.from(JSON.stringify({ code: "PAYMENT_SUCCESS" })).toString("base64");
    const payload2 = Buffer.from(JSON.stringify({ code: "PAYMENT_ERROR" })).toString("base64");

    const validChecksum1 =
      crypto
        .createHash("sha256")
        .update(payload1 + saltKey)
        .digest("hex") +
      "###" +
      saltIndex;

    const isValid = verifyPhonePeSignature(payload2, validChecksum1, saltKey, saltIndex);
    assert.equal(isValid, false);
  });

  it("should reject null or missing inputs", () => {
    assert.equal(verifyPhonePeSignature(null, "chk", saltKey), false);
    assert.equal(verifyPhonePeSignature("data", null, saltKey), false);
    assert.equal(verifyPhonePeSignature("data", "chk", null), false);
  });
});
