import { SYSTEM_PROMPT } from "../lib/prompt.js";
import { RESPONSE_SCHEMA } from "../lib/schema.js";
import { validateBody } from "../lib/validate.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Origins allowed to call this endpoint from a browser.
// Set ALLOWED_ORIGINS in Vercel, comma-separated. "*" allows everything (fine while testing).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Very small in-memory rate limit. Serverless instances are short-lived, so this
// only smooths bursts — it is not real abuse protection. Good enough for a class project.
const RATE_LIMIT = { windowMs: 60_000, max: 20 };
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT.windowMs) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

/** Builds the Gemini request body. Exported so it can be unit-tested without a key. */
export function buildGeminiRequest(input) {
  return {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: JSON.stringify(input, null, 2) }] }],
    generationConfig: {
      temperature: 0.95,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Wait a minute and try again." });
  }

  // Vercel parses JSON bodies automatically, but be defensive in case it arrives as a string.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Body is not valid JSON." });
    }
  }

  const check = validateBody(body);
  if (!check.ok) {
    return res.status(400).json({ error: check.error });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(buildGeminiRequest(check.value)),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("Gemini error", upstream.status, detail.slice(0, 500));
      const status = upstream.status === 429 ? 429 : 502;
      return res.status(status).json({
        error:
          upstream.status === 429
            ? "The model is rate limited right now. Try again shortly."
            : "The model service returned an error.",
      });
    }

    const data = await upstream.json();
    const candidate = data?.candidates?.[0];

    if (!candidate || candidate.finishReason === "SAFETY") {
      return res.status(200).json({
        read: null,
        drafts: [],
        missing_details: [],
        flags: { urgent: false, pressure_detected: false, sensitive_request: true },
        care_note:
          "I couldn't draft a reply to this one safely. It may be worth answering in your own words, or talking to someone you trust about it.",
      });
    }

    const text = (candidate.content?.parts || []).map((p) => p.text || "").join("");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Last-resort recovery if the model wrapped the JSON in prose or fences.
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error("Unparseable model output:", text.slice(0, 500));
        return res.status(502).json({ error: "The model returned an unreadable response. Try again." });
      }
      parsed = JSON.parse(match[0]);
    }

    // Normalise so the frontend never has to guard.
    parsed.drafts = Array.isArray(parsed.drafts) ? parsed.drafts : [];
    parsed.missing_details = Array.isArray(parsed.missing_details) ? parsed.missing_details : [];
    parsed.flags = {
      urgent: !!parsed.flags?.urgent,
      pressure_detected: !!parsed.flags?.pressure_detected,
      sensitive_request: !!parsed.flags?.sensitive_request,
    };
    parsed.care_note = typeof parsed.care_note === "string" ? parsed.care_note : "";

    return res.status(200).json(parsed);
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "The model took too long. Try again." });
    }
    console.error("generate handler failed:", err);
    return res.status(500).json({ error: "Something went wrong generating the reply." });
  } finally {
    clearTimeout(timeout);
  }
}
