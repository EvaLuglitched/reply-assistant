import { RELATIONSHIPS, LENGTHS } from "./schema.js";

export const LIMITS = {
  incoming_message: 4000,
  user_notes: 1000,
  language: 40,
};

/**
 * Normalises and validates the request body.
 * Returns { ok: true, value } or { ok: false, error }.
 */
export function validateBody(raw) {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const incoming = typeof raw.incoming_message === "string" ? raw.incoming_message.trim() : "";
  if (!incoming) {
    return { ok: false, error: "incoming_message is required." };
  }
  if (incoming.length > LIMITS.incoming_message) {
    return { ok: false, error: `incoming_message must be under ${LIMITS.incoming_message} characters.` };
  }

  const relationship = RELATIONSHIPS.includes(raw.relationship) ? raw.relationship : "other";

  let warmth = Number.parseInt(raw.warmth, 10);
  if (!Number.isFinite(warmth)) warmth = 3;
  warmth = Math.min(5, Math.max(1, warmth));

  const length = LENGTHS.includes(raw.length) ? raw.length : "medium";
  const promise_followup = raw.promise_followup === true || raw.promise_followup === "true";

  const user_notes =
    typeof raw.user_notes === "string" ? raw.user_notes.trim().slice(0, LIMITS.user_notes) : "";
  const language =
    typeof raw.language === "string" ? raw.language.trim().slice(0, LIMITS.language) : "";

  return {
    ok: true,
    value: { incoming_message: incoming, relationship, warmth, length, promise_followup, user_notes, language },
  };
}

export default validateBody;
