import React, { useState } from 'react';
import { SuggestedReply } from '../types';
import { Copy, Check, Edit2, CheckCircle, Share2 } from 'lucide-react';

interface ReplyCardProps {
  reply: SuggestedReply;
  index: number;
}

export const ReplyCard: React.FC<ReplyCardProps> = ({ reply, index }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(reply.text);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="rounded-[22px] sm:rounded-[28px] frosted-card p-4 sm:p-6 shadow-2xl relative flex flex-col justify-between group hover:border-white/25 transition-all duration-300">
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full frosted-pill text-[#f3ede2] flex items-center justify-center text-[10px] font-mono font-light shadow-sm">
              0{index + 1}
            </span>
            <h4 className="font-display font-light text-white text-base tracking-wide drop-shadow-sm">
              {reply.title}
            </h4>
          </div>

          <span className="text-[10px] font-mono font-light uppercase tracking-wider px-3 py-0.5 rounded-full frosted-pill text-white/70">
            {reply.styleTag}
          </span>
        </div>

        {/* Tone Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {reply.toneBadges.map((badge, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono font-light px-2.5 py-0.5 rounded-md bg-white/[0.04] text-white/60 border border-white/[0.08]"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Reply Message Box */}
        <div className="rounded-2xl frosted-input p-4 my-2 relative">
          {isEditing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-transparent text-sm font-light text-white/95 focus:outline-none resize-none leading-relaxed font-sans"
              autoFocus
            />
          ) : (
            <p className="text-sm sm:text-base font-light text-white/90 leading-relaxed whitespace-pre-wrap font-sans">
              {text}
            </p>
          )}

          {/* Why this draft works */}
          {reply.why && (
            <p className="text-[11px] text-white/45 leading-relaxed mt-3 pt-3 border-t border-white/[0.06] italic font-sans">
              {reply.why}
            </p>
          )}

          {/* Quick Edit Toggle in corner */}
          <div className="flex justify-end mt-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] text-white/45 hover:text-white flex items-center gap-1 font-mono font-light transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              {isEditing ? 'Done editing' : 'Tweak text'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Controls & Copy Button */}
      <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
        <div className="text-[11px] font-mono font-light text-white/45">
          <span>{wordCount} words</span>
          <span className="mx-1.5 text-white/20">·</span>
          <span>{text.length} chars</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`px-4 py-2 rounded-full text-xs font-light font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
            copied
              ? 'bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.5)]'
              : 'bg-[#f3ede2] hover:bg-white text-black active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy reply
            </>
          )}
        </button>
      </div>
    </div>
  );
};

