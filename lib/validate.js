import { RELATIONSHIPS, LENGTHS, ALLOWED_IMAGE_TYPES } from "./schema.js";

export const LIMITS = {
  receivedMessage: 4000,
  additionalContext: 1000,
  language: 40,
  maxScreenshots: 4,
  // Vercel caps a serverless request body at ~4.5MB, and base64 inflates by 4/3.
  // The frontend downscales before sending, so these are a backstop, not the norm.
  maxScreenshotBase64Bytes: 2_600_000,
  maxTotalBase64Bytes: 3_800_000,
};

/**
 * Normalises and validates the request body.
 * Returns { ok: true, value } or { ok: false, error }.
 */
export function validateBody(raw) {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const receivedMessage =
    typeof raw.receivedMessage === "string" ? raw.receivedMessage.trim() : "";
  if (!receivedMessage) {
    return { ok: false, error: "receivedMessage is required." };
  }
  if (receivedMessage.length > LIMITS.receivedMessage) {
    return {
      ok: false,
      error: `receivedMessage must be under ${LIMITS.receivedMessage} characters.`,
    };
  }

  const senderRelationship = RELATIONSHIPS.includes(raw.senderRelationship)
    ? raw.senderRelationship
    : "other";

  let warmth = Number.parseInt(raw.warmth, 10);
  if (!Number.isFinite(warmth)) warmth = 3;
  warmth = Math.min(5, Math.max(1, warmth));

  const length = LENGTHS.includes(raw.length) ? raw.length : "medium";
  const promiseCatchUp = raw.promiseCatchUp === true || raw.promiseCatchUp === "true";

  const additionalContext =
    typeof raw.additionalContext === "string"
      ? raw.additionalContext.trim().slice(0, LIMITS.additionalContext)
      : "";
  const language =
    typeof raw.language === "string" ? raw.language.trim().slice(0, LIMITS.language) : "";

  const screenshotsResult = validateScreenshots(raw.screenshots);
  if (!screenshotsResult.ok) return screenshotsResult;

  return {
    ok: true,
    value: {
      receivedMessage,
      senderRelationship,
      warmth,
      length,
      promiseCatchUp,
      additionalContext,
      language,
      screenshots: screenshotsResult.value,
    },
  };
}

function validateScreenshots(raw) {
  if (raw == null) return { ok: true, value: [] };
  if (!Array.isArray(raw)) {
    return { ok: false, error: "screenshots must be an array." };
  }
  if (raw.length > LIMITS.maxScreenshots) {
    return {
      ok: false,
      error: `At most ${LIMITS.maxScreenshots} screenshots per request.`,
    };
  }

  const out = [];
  let total = 0;

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Each screenshot must be an object." };
    }

    const mimeType = typeof item.mimeType === "string" ? item.mimeType.toLowerCase() : "";
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return {
        ok: false,
        error: `Unsupported image type. Use ${ALLOWED_IMAGE_TYPES.join(", ")}.`,
      };
    }

    // Accept a bare base64 payload or a full data: URL.
    let data = typeof item.data === "string" ? item.data : "";
    const comma = data.indexOf(",");
    if (data.startsWith("data:") && comma !== -1) data = data.slice(comma + 1);
    data = data.trim();

    if (!data) return { ok: false, error: "A screenshot had no image data." };
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
      return { ok: false, error: "A screenshot was not valid base64." };
    }
    if (data.length > LIMITS.maxScreenshotBase64Bytes) {
      return { ok: false, error: "One of the screenshots is too large (max about 2MB each)." };
    }

    total += data.length;
    if (total > LIMITS.maxTotalBase64Bytes) {
      return { ok: false, error: "The screenshots are too large in total. Try fewer of them." };
    }

    out.push({ mimeType, data });
  }

  return { ok: true, value: out };
}

export default validateBody;
