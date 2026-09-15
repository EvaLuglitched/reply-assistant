/**
 * Gemini responseSchema (OpenAPI 3.0 subset — types are UPPERCASE strings).
 * Forces the model to return parseable JSON with exactly the fields the UI renders.
 *
 * Note: id, wordCount and charCount are NOT asked of the model — the API computes
 * them after parsing, because models are unreliable at counting.
 */

export const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    replies: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING", enum: ["warm", "brief", "honest"] },
          title: { type: "STRING" },
          styleTag: { type: "STRING" },
          text: { type: "STRING" },
          why: { type: "STRING" },
          toneBadges: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["label", "title", "styleTag", "text", "why", "toneBadges"],
        propertyOrdering: ["label", "title", "styleTag", "text", "why", "toneBadges"],
      },
    },
    relationshipAnalysis: {
      type: "OBJECT",
      properties: {
        connectionTier: { type: "STRING" },
        relationshipDynamic: { type: "STRING" },
        reciprocityScore: { type: "INTEGER" },
        emotionalTone: { type: "STRING" },
        cadenceSummary: { type: "STRING" },
        keyThemes: { type: "ARRAY", items: { type: "STRING" } },
        suggestedStrategy: { type: "STRING" },
        screenshotInsights: { type: "STRING" },
      },
      required: [
        "connectionTier",
        "relationshipDynamic",
        "reciprocityScore",
        "emotionalTone",
        "cadenceSummary",
        "keyThemes",
        "suggestedStrategy",
      ],
      propertyOrdering: [
        "connectionTier",
        "relationshipDynamic",
        "reciprocityScore",
        "emotionalTone",
        "cadenceSummary",
        "keyThemes",
        "suggestedStrategy",
        "screenshotInsights",
      ],
    },
    missingDetails: { type: "ARRAY", items: { type: "STRING" } },
    flags: {
      type: "OBJECT",
      properties: {
        urgent: { type: "BOOLEAN" },
        pressureDetected: { type: "BOOLEAN" },
        sensitiveRequest: { type: "BOOLEAN" },
      },
      required: ["urgent", "pressureDetected", "sensitiveRequest"],
      propertyOrdering: ["urgent", "pressureDetected", "sensitiveRequest"],
    },
    careNote: { type: "STRING" },
  },
  required: ["replies", "relationshipAnalysis", "missingDetails", "flags"],
  propertyOrdering: [
    "replies",
    "relationshipAnalysis",
    "missingDetails",
    "flags",
    "careNote",
  ],
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

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/heic"];

export default RESPONSE_SCHEMA;
