# Reply Assistant

Generates replies to parents and distant friends when you're busy and don't want to
answer. Reads the incoming message — and optionally screenshots of the earlier
conversation — works out what the sender actually needs underneath the words, and
returns three drafts you could send as yourself.

Live: https://reply-assistant-three.vercel.app

## Layout

```
reply-assistant/
├── lib/prompt.js          ← the system prompt. This is the product.
├── lib/schema.js          ← forces Gemini to return parseable JSON
├── lib/validate.js        ← input guards, including image size limits
├── api/generate.js        ← the serverless endpoint
├── index.html             ← Vite entry
├── src/                   ← the React interface (designed in AI Studio)
│   ├── App.tsx            ← form, tabs, submit
│   ├── api.ts             ← fetch wrapper + client-side image downscaling
│   ├── types.ts           ← the request/response contract
│   └── components/
│       └── SafetyNotices.tsx  ← urgent / pressure / private-request warnings
├── test/dryrun.js         ← offline checks, no API key needed
└── PROMPT.md              ← readable copy of the prompt
```

`public/` holds the original single-file demo. Nothing uses it; `vite.config.ts`
ignores the folder. Delete it when you're ready.

## Running it locally

```bash
cd ~/Projects/reply-assistant
npm install
vercel dev          # http://localhost:3000
```

Use `vercel dev`, not `npm run dev`. Plain `vite` serves the interface but not
`/api/generate`, so every request will fail.

```bash
node test/dryrun.js   # 18 offline checks, no key or network needed
npx tsc --noEmit      # typecheck
```

## Environment variables

`vercel dev` does **not** read `.env.local`. It reads `.vercel/.env.development.local`,
which `vercel pull` writes from your Vercel project. So:

```bash
vercel env add GEMINI_API_KEY development   # paste the key at the prompt
vercel env add GEMINI_API_KEY production    # same key, second command
vercel pull
```

`GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`. Google retires model
names; if the API starts returning 404, the error message names the replacement —
set `GEMINI_MODEL` in Vercel rather than editing code.

## Deploying

Connected to GitHub, so:

```bash
git add .
git commit -m "what changed"
git push
```

Vercel rebuilds automatically. `vercel --prod` still works for a manual deploy.

## The API

`POST /api/generate`

```json
{
  "receivedMessage": "did you eat today",
  "senderRelationship": "parent",
  "warmth": 4,
  "length": "short",
  "promiseCatchUp": true,
  "additionalContext": "finals week, had noodles",
  "screenshots": [{ "mimeType": "image/jpeg", "data": "<base64>" }]
}
```

`senderRelationship` is one of `parent`, `parent_figure`, `sibling`, `relative`,
`close_friend`, `distant_friend`, `old_classmate`, `mentor`, `acquaintance`, `other`.

`additionalContext` is treated as the only true facts about your life.

`screenshots` are optional, at most 4. The browser downscales them to 1400px and
re-encodes as JPEG before upload, because phone screenshots are often 3–8MB and
Vercel caps a request body at about 4.5MB.

Response:

```json
{
  "replies": [{ "id", "label", "title", "styleTag", "text", "why", "toneBadges", "wordCount", "charCount" }],
  "relationshipAnalysis": { "connectionTier", "relationshipDynamic", "reciprocityScore", "emotionalTone", "cadenceSummary", "keyThemes", "suggestedStrategy", "screenshotInsights" },
  "missingDetails": ["What did you actually eat today?"],
  "flags": { "urgent": false, "pressureDetected": false, "sensitiveRequest": false },
  "careNote": ""
}
```

Three parts of that response are the reason this app is different from a generic
reply generator, and the UI renders all three:

- **`missingDetails`** — the model leaves `[bracketed placeholders]` rather than
  inventing facts about your life. These are the questions you need to answer
  before sending.
- **`flags.urgent`** — the incoming message reads as a real emergency, so the UI
  suggests calling instead of sending a draft.
- **`careNote`** — the one place the model speaks to you directly. Usually empty.

`reciprocityScore` rates *the message* — how strongly it invites a reply — not the
people. It is deliberately not a score of who owes whom.

## Editing the prompt

`lib/prompt.js` is the whole product; everything else is plumbing. Worth tuning
after testing on real messages:

- **relationship notes** — add the specific people in your life
- **the three strategies** (warm / brief / honest) — rename or replace them
- **the register rules** — the list of phrases it must never use is where most of
  the "this sounds like a robot" problem gets fixed

`PROMPT.md` is a readable copy. Edit there if you like, but paste it back into
`lib/prompt.js` — that file is what ships.

## Cost

Gemini's free tier covers a class project comfortably. A text request is roughly
3k input tokens plus ~800 output. Screenshots cost noticeably more — each image is
several hundred to a couple of thousand extra input tokens. The endpoint rate-limits
to 20 requests per minute per IP.
