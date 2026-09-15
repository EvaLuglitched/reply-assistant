import React from 'react';
import { SuggestedReply, RelationshipAnalysis } from '../types';
import { ReplyCard } from './ReplyCard';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface SuggestedRepliesProps {
  replies: SuggestedReply[];
  onRegenerate: () => void;
  onModifyInputs: () => void;
}

export const SuggestedReplies: React.FC<SuggestedRepliesProps> = ({
  replies,
  onRegenerate,
  onModifyInputs,
}) => {
  if (replies.length === 0) {
    return (
      <div className="w-full rounded-[28px] frosted-card-subtle p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full frosted-pill flex items-center justify-center text-white/50 mb-3">
          <RotateCcw className="w-5 h-5" />
        </div>
        <h3 className="text-base font-display font-medium text-white mb-1">No Replies Generated Yet</h3>
        <p className="text-xs text-white/45 max-w-sm">
          Paste the message you received on the left and submit to generate three personalized, calibrated drafts.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f3ede2] shadow-[0_0_8px_rgba(243,237,226,0.9)]"></span>
            <h3 className="font-display font-light text-base sm:text-lg text-white tracking-wide drop-shadow-sm">
              Three Suggested Responses
            </h3>
          </div>
          <p className="text-xs text-white/50 font-light mt-1 tracking-wide">
            Calibrated for tone, emotional safety, and natural conversational cadence
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onModifyInputs}
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-full text-xs font-mono font-light text-white/70 hover:text-white frosted-pill transition-colors cursor-pointer text-center whitespace-nowrap"
          >
            Adjust inputs
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-full text-xs font-mono font-light text-black bg-[#f3ede2] hover:bg-white transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh variations
          </button>
        </div>
      </div>

      {/* 3 Replies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {replies.map((reply, idx) => (
          <ReplyCard key={reply.id} reply={reply} index={idx} />
        ))}
      </div>
    </div>
  );
};

