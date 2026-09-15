import type {
  FormState,
  GenerateResponse,
  ScreenshotPayload,
  UploadedScreenshot,
} from './types';

/**
 * Same-origin by default: the deployed site calls its own /api/generate.
 * Only set VITE_API_BASE if the UI is hosted somewhere other than the API.
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

const MAX_EDGE = 1400; // px — plenty for a legible chat screenshot
const JPEG_QUALITY = 0.82;

/**
 * Shrinks a screenshot in the browser before upload.
 * Phone screenshots are often 3-8MB; Vercel caps a request body at ~4.5MB,
 * and the model does not read the extra pixels anyway.
 */
export async function prepareScreenshot(file: File): Promise<ScreenshotPayload> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not read that image.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  const comma = dataUrl.indexOf(',');

  return { mimeType: 'image/jpeg', data: dataUrl.slice(comma + 1) };
}

export interface GenerateArgs extends FormState {
  screenshots: UploadedScreenshot[];
}

export async function generateReplies(
  args: GenerateArgs,
  opts: { signal?: AbortSignal } = {},
): Promise<GenerateResponse> {
  const screenshots: ScreenshotPayload[] = [];
  for (const shot of args.screenshots.slice(0, 4)) {
    try {
      screenshots.push(await prepareScreenshot(shot.file));
    } catch {
      throw new Error(`Couldn't read "${shot.name}". Try a PNG or JPEG.`);
    }
  }

  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receivedMessage: args.receivedMessage,
      senderRelationship: args.senderRelationship,
      length: args.length,
      warmth: args.warmth,
      promiseCatchUp: args.promiseCatchUp,
      additionalContext: args.additionalContext,
      screenshots,
    }),
    signal: opts.signal,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error('The server returned something unreadable. Try again.');
  }

  if (!res.ok) {
    const message = (data as { error?: string })?.error;
    throw new Error(message || `Request failed (${res.status}).`);
  }

  return data as GenerateResponse;
}
