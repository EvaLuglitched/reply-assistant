/**
 * Drop-in client for /api/generate.
 * Works in plain JS, and in the React/TS app AI Studio generates.
 *
 * Usage:
 *   import { generateReplies } from "./replyClient.js";
 *   const result = await generateReplies({
 *     incoming_message: "你吃饭了吗？怎么都不回消息",
 *     relationship: "parent",
 *     warmth: 4,
 *     length: "short",
 *     promise_followup: true,
 *     user_notes: "I'm in finals week. I did eat.",
 *   });
 */

// Same-origin by default. If your UI is hosted somewhere else (e.g. AI Studio),
// set this to your full Vercel URL: "https://your-site.vercel.app"
export const API_BASE = "";

export async function generateReplies(input, { signal } = {}) {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      incoming_message: input.incoming_message,
      relationship: input.relationship ?? "other",
      warmth: input.warmth ?? 3,
      length: input.length ?? "medium",
      promise_followup: !!input.promise_followup,
      user_notes: input.user_notes ?? "",
      language: input.language ?? "",
    }),
    signal,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("The server returned something unreadable.");
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
  return data;
}

export default generateReplies;
