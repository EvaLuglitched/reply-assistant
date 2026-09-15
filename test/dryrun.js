/**
 * Offline check — no API key needed.
 *   node test/dryrun.js
 * Verifies the validator, the Gemini request body, and the response schema shape.
 */
import assert from "node:assert/strict";
import { validateBody } from "../lib/validate.js";
import { RESPONSE_SCHEMA } from "../lib/schema.js";
import { buildGeminiRequest } from "../api/generate.js";
import { SYSTEM_PROMPT } from "../lib/prompt.js";

let pass = 0;
const ok = (name) => { pass++; console.log("  ok  " + name); };

// --- validator ---
assert.equal(validateBody(null).ok, false);
assert.equal(validateBody({}).ok, false);
assert.equal(validateBody({ incoming_message: "   " }).ok, false);
ok("rejects empty input");

const v = validateBody({
  incoming_message: "  did you eat?  ",
  relationship: "parent",
  warmth: "9",
  length: "nonsense",
  promise_followup: "true",
  user_notes: "finals week",
});
assert.equal(v.ok, true);
assert.equal(v.value.incoming_message, "did you eat?");
assert.equal(v.value.warmth, 5, "warmth clamps to 5");
assert.equal(v.value.length, "medium", "unknown length falls back");
assert.equal(v.value.promise_followup, true, "string 'true' coerces");
ok("normalises and clamps the sliders");

assert.equal(validateBody({ incoming_message: "hi", relationship: "hacker" }).value.relationship, "other");
assert.equal(validateBody({ incoming_message: "x".repeat(5000) }).ok, false, "length cap enforced");
ok("guards relationship enum and message length");

// --- request body ---
const req = buildGeminiRequest(v.value);
assert.ok(req.systemInstruction.parts[0].text.includes("Never invent facts"));
assert.equal(req.contents[0].role, "user");
assert.equal(req.generationConfig.responseMimeType, "application/json");
assert.ok(JSON.parse(req.contents[0].parts[0].text).warmth === 5);
assert.ok(JSON.stringify(req).length < 60_000, "payload is a sane size");
ok("builds a valid Gemini request");

// --- schema shape (Gemini's OpenAPI subset: UPPERCASE types, no $ref, no additionalProperties) ---
const VALID_TYPES = new Set(["OBJECT", "ARRAY", "STRING", "NUMBER", "INTEGER", "BOOLEAN"]);
(function walk(node, path = "root") {
  assert.ok(VALID_TYPES.has(node.type), `${path}: bad type ${node.type}`);
  assert.ok(!("$ref" in node), `${path}: $ref not supported`);
  assert.ok(!("additionalProperties" in node), `${path}: additionalProperties not supported`);
  if (node.type === "OBJECT") {
    assert.ok(node.properties, `${path}: OBJECT needs properties`);
    for (const r of node.required || []) {
      assert.ok(r in node.properties, `${path}: required "${r}" is not a property`);
    }
    for (const [k, child] of Object.entries(node.properties)) walk(child, `${path}.${k}`);
  }
  if (node.type === "ARRAY") {
    assert.ok(node.items, `${path}: ARRAY needs items`);
    walk(node.items, `${path}[]`);
  }
})(RESPONSE_SCHEMA);
ok("response schema is valid for Gemini");

// --- prompt sanity ---
for (const must of ["INTERNAL PASS", "missing_details", "care_note", "pressure_detected", "warmth 5"]) {
  assert.ok(SYSTEM_PROMPT.includes(must), `prompt is missing "${must}"`);
}
assert.ok(SYSTEM_PROMPT.length > 3000, "prompt looks truncated");
ok("system prompt contains its required sections");

console.log(`\n${pass}/${pass} checks passed.`);
