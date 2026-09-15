/**
 * Gemini responseSchema (OpenAPI 3.0 subset — types are UPPERCASE strings).
 * This forces the model to return parseable JSON with exactly the fields
 * the frontend renders.
 */

export const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    read: {
      type: "OBJECT",
      properties: {
        who: { type: "STRING" },
        surface: { type: "STRING" },
        emotional_need: { type: "STRING" },
        reply_job: { type: "STRING" },
      },
      required: ["who", "surface", "emotional_need", "reply_job"],
      propertyOrdering: ["who", "surface", "emotional_need", "reply_job"],
    },
    drafts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING", enum: ["warm", "brief", "honest"] },
          text: { type: "STRING" },
          why: { type: "STRING" },
        },
        required: ["label", "text", "why"],
        propertyOrdering: ["label", "text", "why"],
      },
    },
    missing_details: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    flags: {
      type: "OBJECT",
      properties: {
        urgent: { type: "BOOLEAN" },
        pressure_detected: { type: "BOOLEAN" },
        sensitive_request: { type: "BOOLEAN" },
      },
      required: ["urgent", "pressure_detected", "sensitive_request"],
      propertyOrdering: ["urgent", "pressure_detected", "sensitive_request"],
    },
    care_note: { type: "STRING" },
  },
  required: ["read", "drafts", "missing_details", "flags"],
  propertyOrdering: ["read", "drafts", "missing_details", "flags", "care_note"],
};

export const RELATIONSHIPS = [
  "parent",
  "parent_figure",
  "sibling",
  "relative",
  "close_friend",
  "distant_friend",
  "old_classmate",
  "mentor",
  "acquaintance",
  "other",
];

export const LENGTHS = ["short", "medium", "long"];

export default RESPONSE_SCHEMA;
