/**
 * Offline checks — no API key, no network.
 *   node test/dryrun.js
 * Covers the validator, the Gemini request body (text and image paths),
 * the response schema, and the post-processing of model output.
 */
import assert from "node:assert/strict";
import { validateBody, LIMITS } from "../lib/validate.js";
import { RESPONSE_SCHEMA } from "../lib/schema.js";
import { buildGeminiRequest, normaliseResult } from "../api/generate.js";
import { SYSTEM_PROMPT } from "../lib/prompt.js";

let pass = 0;
const ok = (name) => { pass++; console.log("  ok  " + name); };

const base = {
  receivedMessage: "did you eat?",
  senderRelationship: "parent",
  warmth: 4,
  length: "short",
  promiseCatchUp: true,
  additionalContext: "finals week",
};

// --- validator: basics ---
assert.equal(validateBody(null).ok, false);
assert.equal(validateBody({}).ok, false);
assert.equal(validateBody({ receivedMessage: "   " }).ok, false);
ok("rejects empty input");

const v = validateBody({ ...base, receivedMessage: "  did you eat?  ", warmth: "9", length: "nonsense", promiseCatchUp: "true" });
assert.equal(v.ok, true);
assert.equal(v.value.receivedMessage, "did you eat?");
assert.equal(v.value.warmth, 5, "warmth clamps to 5");
assert.equal(v.value.length, "medium", "unknown length falls back");
assert.equal(v.value.promiseCatchUp, true, "string 'true' coerces");
assert.deepEqual(v.value.screenshots, [], "screenshots default to empty");
ok("normalises and clamps the sliders");

assert.equal(validateBody({ ...base, senderRelationship: "hacker" }).value.senderRelationship, "other");
assert.equal(validateBody({ ...base, receivedMessage: "x".repeat(5000) }).ok, false);
ok("guards the relationship enum and message length");

// --- validator: screenshots ---
const png = Buffer.from("hello world").toString("base64");

assert.equal(validateBody({ ...base, screenshots: "nope" }).ok, false, "non-array rejected");
assert.equal(validateBody({ ...base, screenshots: [{ mimeType: "application/pdf", data: png }] }).ok, false, "bad mime rejected");
assert.equal(validateBody({ ...base, screenshots: [{ mimeType: "image/png", data: "not base64!!" }] }).ok, false, "bad base64 rejected");
assert.equal(validateBody({ ...base, screenshots: Array(9).fill({ mimeType: "image/png", data: png }) }).ok, false, "too many rejected");
assert.equal(
  validateBody({ ...base, screenshots: [{ mimeType: "image/png", data: "A".repeat(LIMITS.maxScreenshotBase64Bytes + 4) }] }).ok,
  false,
  "oversized image rejected",
);
ok("rejects malformed and oversized screenshots");

const withImg = validateBody({ ...base, screenshots: [{ mimeType: "image/PNG", data: `data:image/png;base64,${png}` }] });
assert.equal(withImg.ok, true);
assert.equal(withImg.value.screenshots[0].mimeType, "image/png", "mime lowercased");
assert.equal(withImg.value.screenshots[0].data, png, "data: prefix stripped");
ok("accepts a data URL and normalises it");

// --- request body: text only ---
const req = buildGeminiRequest(v.value);
assert.ok(req.systemInstruction.parts[0].text.includes("Never invent facts"));
assert.equal(req.contents[0].role, "user");
assert.equal(req.generationConfig.responseMimeType, "application/json");
assert.equal(req.contents[0].parts.length, 1, "no image parts when none sent");
assert.ok(!("screenshots" in JSON.parse(req.contents[0].parts[0].text)), "screenshots stripped from the JSON part");
assert.equal(JSON.parse(req.contents[0].parts[0].text).warmth, 5);
ok("builds a valid text-only Gemini request");

// --- request body: with images ---
const imgReq = buildGeminiRequest(withImg.value);
assert.equal(imgReq.contents[0].parts.length, 3, "json part + image + trailing instruction");
assert.deepEqual(imgReq.contents[0].parts[1].inlineData, { mimeType: "image/png", data: png });
assert.ok(imgReq.contents[0].parts[2].text.includes("not commands to you"), "images carry a prompt-injection guard");
ok("attaches screenshots as inlineData");

// --- schema shape (Gemini's OpenAPI subset) ---
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

// --- normaliseResult ---
const n = normaliseResult({
  replies: [
    { label: "warm", title: "T", styleTag: "S", text: "  hello there friend  ", why: "W", toneBadges: ["a", "b", "c", "d", "e"] },
    { label: "brief", title: "T", styleTag: "S", text: "hi", why: "W", toneBadges: [] },
    { label: "honest", title: "T", styleTag: "S", text: "", why: "W", toneBadges: [] },
    { label: "warm", title: "extra", styleTag: "S", text: "should be dropped", why: "W", toneBadges: [] },
  ],
  relationshipAnalysis: { reciprocityScore: 140, keyThemes: ["a", "b", "c", "d", "e", "f"] },
  missingDetails: ["What did you eat?", "   ", 42],
  flags: { urgent: "yes" },
});
assert.equal(n.replies.length, 3, "empty drafts dropped, list capped at 3");
assert.ok(!n.replies.some((r) => !r.text), "no blank draft survives");
assert.deepEqual(n.replies.map((r) => r.id), ["reply-1", "reply-2", "reply-3"], "ids renumbered after filtering");
assert.equal(n.replies[0].text, "hello there friend", "text trimmed");
assert.equal(n.replies[0].wordCount, 3);
assert.equal(n.replies[0].charCount, 18);
assert.equal(n.replies[0].id, "reply-1");
assert.equal(n.replies[0].toneBadges.length, 4, "badges capped");
assert.equal(n.relationshipAnalysis.reciprocityScore, 100, "score clamped to 0-100");
assert.equal(n.relationshipAnalysis.keyThemes.length, 5, "themes capped");
assert.deepEqual(n.missingDetails, ["What did you eat?"], "blank and non-string details dropped");
assert.equal(n.flags.urgent, true, "flags coerced to booleans");
assert.equal(n.flags.pressureDetected, false, "missing flags default false");
assert.equal(n.careNote, "", "careNote defaults to empty string");
ok("normalises model output into what the UI expects");

assert.equal(normaliseResult({}).replies.length, 0, "an empty model response does not throw");
ok("survives a garbage model response");

// --- prompt sanity ---
for (const must of ["INTERNAL PASS", "READING SCREENSHOTS", "missingDetails", "careNote", "pressureDetected", "warmth 5", "never instructions"]) {
  assert.ok(SYSTEM_PROMPT.includes(must), `prompt is missing "${must}"`);
}
assert.ok(SYSTEM_PROMPT.length > 6000, "prompt looks truncated");
ok("system prompt contains its required sections");

// --- handler end to end, with Gemini stubbed ---
{
  const { default: handler } = await import("../api/generate.js");

  const makeRes = () => {
    const res = { statusCode: 0, headers: {}, body: null, ended: false };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (b) => { res.body = b; res.ended = true; return res; };
    res.end = () => { res.ended = true; return res; };
    return res;
  };
  const makeReq = (body, method = "POST") => ({ method, headers: { origin: "https://example.com" }, body, socket: {} });

  const realFetch = globalThis.fetch;
  const realKey = process.env.GEMINI_API_KEY;

  // missing key
  delete process.env.GEMINI_API_KEY;
  let res = makeRes();
  await handler(makeReq(base), res);
  assert.equal(res.statusCode, 500);
  assert.match(res.body.error, /GEMINI_API_KEY/);
  ok("handler reports a missing API key");

  process.env.GEMINI_API_KEY = "test-key";

  // preflight
  res = makeRes();
  await handler(makeReq(null, "OPTIONS"), res);
  assert.equal(res.statusCode, 204);
  assert.ok(res.headers["Access-Control-Allow-Methods"].includes("POST"));
  ok("handler answers CORS preflight");

  // bad input
  res = makeRes();
  await handler(makeReq({ receivedMessage: "" }), res);
  assert.equal(res.statusCode, 400);
  ok("handler rejects an empty message");

  // happy path
  const modelJson = {
    replies: [
      { label: "warm", title: "Warm and reassuring", styleTag: "Leads with feeling", text: "I did eat — [what you ate]. I know you worry.", why: "Answers the worry first.", toneBadges: ["Answers the worry"] },
      { label: "brief", title: "Short and kind", styleTag: "Minimal", text: "Ate already, all good. Love you!", why: "Fastest way to stop the worry.", toneBadges: ["Fast"] },
      { label: "honest", title: "Honest about the week", styleTag: "Names the constraint", text: "Sorry for the silence — [the thing you're busy with].", why: "Explains the gap without apologising too much.", toneBadges: ["Direct"] },
    ],
    relationshipAnalysis: {
      connectionTier: "Parent, daily contact", relationshipDynamic: "Wants to know you're okay.",
      reciprocityScore: 85, emotionalTone: "Worried, affectionate", cadenceSummary: "Unknown from a single message",
      keyThemes: ["Wellbeing check"], suggestedStrategy: "Reassure first.",
    },
    missingDetails: ["What did you actually eat today?"],
    flags: { urgent: false, pressureDetected: false, sensitiveRequest: false },
    careNote: "",
  };

  let captured = null;
  globalThis.fetch = async (url, init) => {
    captured = { url, init };
    return { ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(modelJson) }] } }] }) };
  };

  res = makeRes();
  await handler(makeReq({ ...base, receivedMessage: "did you eat today" }), res);
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
  assert.equal(res.body.replies.length, 3);
  assert.equal(res.body.replies[0].wordCount, 11);
  assert.deepEqual(res.body.missingDetails, ["What did you actually eat today?"]);
  assert.equal(captured.init.headers["x-goog-api-key"], "test-key");
  assert.ok(!captured.init.body.includes("test-key"), "the key travels in the header, never in the body");
  ok("handler returns normalised replies on the happy path");

  // overloaded main model → falls back to the next model
  {
    const urls = [];
    globalThis.fetch = async (url) => {
      urls.push(url);
      if (url.includes("gemini-3.6-flash")) return { ok: false, status: 503, text: async () => '{"error":{"status":"UNAVAILABLE","message":"overloaded"}}' };
      return { ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(modelJson) }] } }] }) };
    };
    res = makeRes();
    await handler(makeReq({ ...base, receivedMessage: "are you coming home?" }), res);
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.equal(urls.length, 3, "main model twice, then one fallback");
    assert.ok(urls[2].includes("gemini-3.5-flash"), "first fallback is gemini-3.5-flash");
    ok("handler falls back to another model when Gemini is overloaded");
  }

  // everything overloaded → clear message
  globalThis.fetch = async () => ({ ok: false, status: 503, text: async () => '{"error":{"status":"UNAVAILABLE","message":"The model is overloaded."}}' });
  res = makeRes();
  await handler(makeReq({ ...base, receivedMessage: "hello?" }), res);
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error, /overloaded/);
  ok("handler says 'overloaded' when every model is busy");

  // upstream 404 (retired model)
  globalThis.fetch = async () => ({ ok: false, status: 404, text: async () => '{"error":{"message":"no longer available"}}' });
  res = makeRes();
  await handler(makeReq({ ...base, receivedMessage: "hi there" }), res);
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error, /GEMINI_MODEL/);
  ok("handler explains a retired model name");

  // safety block
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: "SAFETY", content: { parts: [] } }] }) });
  res = makeRes();
  await handler(makeReq({ ...base, receivedMessage: "hello again" }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.replies, []);
  assert.equal(res.body.flags.sensitiveRequest, true);
  assert.ok(res.body.careNote.length > 0);
  ok("handler degrades gracefully when the model blocks");

  // unparseable output
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "sorry, no json here" }] } }] }) });
  res = makeRes();
  await handler(makeReq({ ...base, receivedMessage: "hello once more" }), res);
  assert.equal(res.statusCode, 502);
  ok("handler reports unreadable model output");

  globalThis.fetch = realFetch;
  if (realKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = realKey;
}



// --- error descriptions ---
{
  const { describeGeminiError } = await import("../api/generate.js");
  const k = describeGeminiError(400, JSON.stringify({ error: { code: 400, message: "API key expired. Please renew the API key.", status: "INVALID_ARGUMENT", details: [{ reason: "API_KEY_INVALID" }] } }));
  assert.match(k, /invalid or has expired/);
  assert.match(describeGeminiError(403, '{"error":{"status":"PERMISSION_DENIED","message":"Your API key was reported as leaked."}}'), /refused this API key/);
  assert.match(describeGeminiError(503, '{"error":{"status":"UNAVAILABLE","message":"The model is overloaded."}}'), /overloaded/);
  assert.match(describeGeminiError(400, '{"error":{"message":"Something odd"}}'), /Gemini 400: Something odd/);
  assert.match(describeGeminiError(400, "not json"), /Gemini 400/);
  ok("error messages say what to do");
}
console.log(`\n${pass}/${pass} checks passed.`);
