import crypto from "crypto";
import axios from "axios";
import "dotenv/config";
import AppError from "../utils/AppError.js";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "TEST_MERCHANT";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "test_salt_key_for_testing";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE_URL =
  process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

/**
 * Generate PhonePe X-VERIFY checksum header.
 * @param {string} endpointPath (e.g. "/pg/v1/pay" or "/pg/v1/status/{mid}/{txnId}")
 * @param {string} [base64Payload=""]
 * @returns {string}
 */
export const generatePhonePeChecksum = (endpointPath, base64Payload = "") => {
  const checksumString = base64Payload + endpointPath + SALT_KEY;
  return (
    crypto.createHash("sha256").update(checksumString).digest("hex") +
    "###" +
    SALT_INDEX
  );
};

/**
 * Verifies X-VERIFY checksum received in PhonePe S2S webhook callbacks.
 * Formula: SHA256(encodedResponse + saltKey) + "###" + saltIndex
 * @param {string} encodedResponse
 * @param {string} receivedChecksum
 * @returns {boolean}
 */
export const verifyPhonePeSignature = (encodedResponse, receivedChecksum) => {
  if (!receivedChecksum || !encodedResponse || !SALT_KEY) return false;

  const expected =
    crypto
      .createHash("sha256")
      .update(encodedResponse + SALT_KEY)
      .digest("hex") +
    "###" +
    SALT_INDEX;

  return receivedChecksum === expected;
};

/**
 * Initiates a standard PhonePe payment session and returns redirect URL.
 * @param {object} params
 * @param {string} params.merchantTransactionId
 * @param {number} params.amountInPaise
 * @param {string} params.userId
 * @param {string} params.redirectUrl
 * @param {string} params.callbackUrl
 * @returns {Promise<string>} redirectUrl
 */
export const initiatePhonePeTransaction = async ({
  merchantTransactionId,
  amountInPaise,
  userId,
  redirectUrl,
  callbackUrl,
}) => {
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId,
    merchantUserId: userId.toString(),
    amount: amountInPaise,
    redirectUrl,
    callbackUrl,
    redirectMode: "REDIRECT",
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const checksum = generatePhonePeChecksum("/pg/v1/pay", base64Payload);

  const response = await axios.post(
    `${PHONEPE_BASE_URL}/pg/v1/pay`,
    { request: base64Payload },
    {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": MERCHANT_ID,
        accept: "application/json",
      },
    }
  );

  const redirectInfoUrl =
    response.data?.data?.instrumentResponse?.redirectInfo?.url;

  if (!redirectInfoUrl) {
    throw new AppError("No redirect URL from PhonePe gateway", 502, "PHONEPE_ERROR");
  }

  return redirectInfoUrl;
};

/**
 * Polls PhonePe status API for a merchantTransactionId.
 * @param {string} merchantTransactionId
 * @returns {Promise<{ code: string, phonePePaymentId: string, raw: object }>}
 */
export const queryPhonePeStatus = async (merchantTransactionId) => {
  const path = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
  const checksum = generatePhonePeChecksum(path);

  const response = await axios.get(`${PHONEPE_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": MERCHANT_ID,
      accept: "application/json",
    },
  });

  return {
    code: response.data?.code,
    phonePePaymentId: response.data?.data?.transactionId,
    raw: response.data,
  };
};
