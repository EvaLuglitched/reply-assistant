export type RelationshipType =
  | 'parent'
  | 'parent_figure'
  | 'sibling'
  | 'relative'
  | 'close_friend'
  | 'distant_friend'
  | 'old_classmate'
  | 'mentor'
  | 'acquaintance'
  | 'other';

export type ReplyLength = 'short' | 'medium' | 'long';

export interface FormState {
  receivedMessage: string;
  senderRelationship: RelationshipType;
  length: ReplyLength;
  warmth: number; // 1 to 5
  promiseCatchUp: boolean;
  additionalContext: string;
}

export interface UploadedScreenshot {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  timestamp: string;
}

/** What actually gets sent to the API for each screenshot. */
export interface ScreenshotPayload {
  mimeType: string;
  data: string; // base64, without the data: prefix
}

export interface RelationshipAnalysis {
  connectionTier: string;
  relationshipDynamic: string;
  /** 0-100: how strongly THIS MESSAGE invites a reply. Not a score of the people. */
  reciprocityScore: number;
  emotionalTone: string;
  cadenceSummary: string;
  keyThemes: string[];
  suggestedStrategy: string;
  screenshotInsights?: string;
}

export interface SuggestedReply {
  id: string;
  label: 'warm' | 'brief' | 'honest';
  title: string;
  styleTag: string;
  text: string;
  /** One sentence on why this draft works — shown under the text. */
  why: string;
  toneBadges: string[];
  wordCount: number;
  charCount: number;
}

export interface SafetyFlags {
  urgent: boolean;
  pressureDetected: boolean;
  sensitiveRequest: boolean;
}

export interface GenerateResponse {
  replies: SuggestedReply[];
  relationshipAnalysis: RelationshipAnalysis | null;
  /** Bracketed placeholders the model left rather than inventing facts. */
  missingDetails: string[];
  flags: SafetyFlags;
  careNote: string;
}

export const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string; description: string }[] = [
  { value: 'parent', label: 'Parent', description: 'Mom or Dad — usually wants reassurance' },
  { value: 'parent_figure', label: 'Parent figure', description: 'Guardian, stepparent, elder relative' },
  { value: 'sibling', label: 'Sibling', description: 'Brother or sister — shorthand is fine' },
  { value: 'relative', label: 'Relative', description: 'Aunt, uncle, cousin, grandparent' },
  { value: 'close_friend', label: 'Close friend', description: 'High trust, casual and open' },
  { value: 'distant_friend', label: 'Distant friend', description: 'Long gap, reconnecting gently' },
  { value: 'old_classmate', label: 'Old classmate', description: 'Shared history, cordial' },
  { value: 'mentor', label: 'Mentor', description: 'Professional or personal advisor' },
  { value: 'acquaintance', label: 'Acquaintance', description: 'Polite, low-obligation' },
  { value: 'other', label: 'Other', description: 'General or custom relationship' },
];

export const LENGTH_OPTIONS: { value: ReplyLength; label: string; detail: string }[] = [
  { value: 'short', label: 'Short', detail: '1-2 brief sentences' },
  { value: 'medium', label: 'Medium', detail: 'A balanced, natural paragraph' },
  { value: 'long', label: 'Long', detail: 'A detailed, thoughtful response' },
];

export const WARMTH_LABELS: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Polite & Reserved', subtitle: 'Courteous, guarded, no emotional exposure' },
  2: { title: 'Measured & Cordial', subtitle: 'Friendly but structured and calm' },
  3: { title: 'Warm & Friendly', subtitle: 'Natural, easygoing everyday tone' },
  4: { title: 'Affectionate & Caring', subtitle: 'Attentive, heartfelt, emotionally present' },
  5: { title: 'Deeply Loving & Intimate', subtitle: 'High tenderness, zero reservations' },
};
