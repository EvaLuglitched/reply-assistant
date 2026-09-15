# Reply Assistant

Generates replies to parents and distant friends when you're busy and don't want to
answer. Reads the incoming message, works out the emotional need under it, and returns
three drafts you can send as yourself.

```
reply-assistant/
├── api/generate.js        ← the serverless endpoint (this is your API)
├── lib/prompt.js          ← the system prompt (the actual product)
├── lib/schema.js          ← forces Gemini to return parseable JSON
├── lib/validate.js        ← input guards
├── public/index.html      ← working demo UI (replace with your AI Studio build)
├── public/replyClient.js  ← the fetch helper your UI imports
├── test/dryrun.js         ← offline checks, no API key needed
└── PROMPT.md              ← readable copy of the prompt
```

## 1. Get a key

https://aistudio.google.com/apikey → create key → copy it.

## 2. Run it locally

```bash
npm i -g vercel
cp .env.example .env.local     # paste your key into GEMINI_API_KEY
vercel dev                     # http://localhost:3000
node test/dryrun.js            # sanity check, no key required
```

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Reply assistant: prompt + Gemini API route + UI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reply-assistant.git
git push -u origin main
```

`.gitignore` already excludes `.env.local`. **Never commit your key** — Google
auto-revokes keys it finds in public repos.

## 4. Deploy on Vercel

1. vercel.com → Add New → Project → import the repo.
2. Framework preset: **Other**. No build command needed.
3. Settings → Environment Variables → add `GEMINI_API_KEY`. Add `GEMINI_MODEL` and
   `ALLOWED_ORIGINS` if you want them.
4. Deploy. Your endpoint is `https://your-site.vercel.app/api/generate`.

Changing an env var requires a redeploy to take effect.

## 5. Wiring your AI Studio interface to it

AI Studio's generated app calls Gemini **from the browser with the key baked in**.
That's the thing you want to remove — it exposes your key and it's why AI Studio's
preview sandbox gives you CORS and network errors. Replace that call with one to
your own endpoint.

Find the AI Studio code that does `new GoogleGenAI({ apiKey })` / `generateContent(...)`
and delete it. Then:

```ts
const res = await fetch("https://your-site.vercel.app/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    incoming_message: message,
    relationship: "parent",     // see the enum below
    warmth: 4,                  // 1–5 slider
    length: "short",            // short | medium | long
    promise_followup: true,     // checkbox
    user_notes: notes,          // optional, free text
  }),
});
const data = await res.json();
```

`public/replyClient.js` is that call already wrapped — copy it into your AI Studio
project and set `API_BASE` to your Vercel URL.

**The AI Studio CORS problem.** If your UI stays hosted on AI Studio, the browser
sends a cross-origin request and AI Studio's sandbox often blocks it regardless of
what your server allows. Two fixes, in order of how well they work:

- **Best: export the AI Studio app and host it on the same Vercel project.** Download
  the code, drop the built files into `public/` (or let Vercel build it), and call
  `/api/generate` as a relative path. Same origin, no CORS, nothing to configure.
  This is also why the demo page here exists — it shows the shape to aim for.
- **If you keep the UI on AI Studio:** set `ALLOWED_ORIGINS=https://aistudio.google.com`
  in Vercel. The endpoint already answers preflight `OPTIONS` requests. This works
  sometimes; the sandbox is the variable you don't control.

Develop in VS Code either way — `vercel dev` runs the API and the UI together on one
localhost origin, which is the same-origin setup you'll ship.

## Request fields

| field | type | notes |
|---|---|---|
| `incoming_message` | string, required | ≤ 4000 chars, any language |
| `relationship` | string | `parent`, `parent_figure`, `sibling`, `relative`, `close_friend`, `distant_friend`, `old_classmate`, `mentor`, `acquaintance`, `other` |
| `warmth` | 1–5 | clamped |
| `length` | string | `short`, `medium`, `long` |
| `promise_followup` | boolean | false = no "let's catch up soon" |
| `user_notes` | string | ≤ 1000 chars. **Treated as the only true facts about you.** |
| `language` | string | optional; defaults to matching the incoming message |

## Response

```json
{
  "read": { "who": "...", "surface": "...", "emotional_need": "...", "reply_job": "..." },
  "drafts": [{ "label": "warm", "text": "...", "why": "..." }],
  "missing_details": ["What did you actually eat today?"],
  "flags": { "urgent": false, "pressure_detected": false, "sensitive_request": false },
  "care_note": ""
}
```

Three things your UI should actually render, not just the drafts:

- **`missing_details`** — the model leaves `[bracketed placeholders]` instead of
  inventing facts about your life. Show these as a checklist before the user sends.
- **`flags.urgent`** — the incoming message looks like a real emergency. Show a
  "maybe just call them" prompt instead of a copy button.
- **`care_note`** — the one place the model speaks to the user directly. Usually empty.

## Editing the prompt

`lib/prompt.js` is the whole product; the API route is plumbing. Things worth tuning
after you test it on real messages:

- the **relationship notes** section — add the specific people in your life
- the **three draft strategies** (warm / brief / honest) — rename or replace them
- the **register rules** — the list of phrases it must never use is where most of the
  "this sounds like a robot" problem gets fixed

`PROMPT.md` is a readable copy. If you edit it there, paste it back into
`lib/prompt.js` — that file is what ships.

## Cost

Gemini's free tier covers a class project comfortably. Each request is roughly
2.5k input tokens (the prompt) + ~600 output. The rate limiter in `api/generate.js`
allows 20 requests/min per IP.
