import React from 'react';
import { RelationshipAnalysis } from '../types';
import { Sparkles, Activity, ShieldAlert, CheckCircle, Info, MessageCircle, Clock, Heart } from 'lucide-react';

interface RelationshipAnalysisCardProps {
  analysis: RelationshipAnalysis;
  hasScreenshots: boolean;
  screenshotCount: number;
}

export const RelationshipAnalysisCard: React.FC<RelationshipAnalysisCardProps> = ({
  analysis,
  hasScreenshots,
  screenshotCount,
}) => {
  return (
    <div className="w-full rounded-[22px] sm:rounded-[28px] frosted-card p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/[0.03] rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f3ede2] shadow-[0_0_8px_rgba(243,237,226,0.8)]"></span>
            <h3 className="font-display font-light text-base sm:text-lg text-white tracking-wide drop-shadow-sm">
              Relationship Context & Dynamic Analysis
            </h3>
          </div>
          <p className="text-xs text-white/50 font-light mt-1 tracking-wide">
            Grounded assessment of social stakes, communication cadence, and emotional undertone
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1 rounded-full text-xs font-mono font-light frosted-pill text-white/80">
            {analysis.connectionTier}
          </span>
        </div>
      </div>

      {/* Main Analysis Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 my-4 sm:my-5">
        {/* Metric 1 */}
        <div className="rounded-2xl frosted-card-subtle p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono font-light uppercase tracking-wider text-[10px]">Cadence Pattern</span>
            <Clock className="w-3.5 h-3.5 text-white/60" />
          </div>
          <p className="text-xs sm:text-sm font-light text-white/95 leading-snug">
            {analysis.cadenceSummary}
          </p>
          <div className="mt-3 text-[11px] text-white/45 border-t border-white/[0.06] pt-2 font-mono font-light">
            Pacing matches relationship gravity
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl frosted-card-subtle p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono font-light uppercase tracking-wider text-[10px]">Emotional Undertone</span>
            <Heart className="w-3.5 h-3.5 text-white/60" />
          </div>
          <p className="text-xs sm:text-sm font-light text-white/95 leading-snug">
            {analysis.emotionalTone}
          </p>
          <div className="mt-3 text-[11px] text-white/45 border-t border-white/[0.06] pt-2 font-mono font-light">
            Reciprocity Index: {analysis.reciprocityScore}%
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl frosted-card-subtle p-3.5 sm:p-4 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono font-light uppercase tracking-wider text-[10px]">Detected Key Themes</span>
            <Activity className="w-3.5 h-3.5 text-white/60" />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {analysis.keyThemes.map((theme, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-white/80 text-[11px] font-mono font-light"
              >
                {theme}
              </span>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-white/45 border-t border-white/[0.06] pt-2 font-mono font-light">
            Primary conversation drivers
          </div>
        </div>
      </div>

      {/* Core Dynamic Description */}
      <div className="rounded-2xl frosted-input p-4 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-white/70" />
          <span className="text-xs font-mono uppercase tracking-wider text-white/70">
            Psychological & Social Dynamic
          </span>
        </div>
        <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
          {analysis.relationshipDynamic}
        </p>
      </div>

      {/* Recommended Tactical Strategy */}
      <div className="rounded-2xl frosted-card-subtle p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full frosted-pill flex items-center justify-center text-[#f3ede2] shrink-0 mt-0.5 sm:mt-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/55 block">
              Recommended Strategy
            </span>
            <p className="text-xs sm:text-sm text-white/90 leading-normal mt-0.5">
              {analysis.suggestedStrategy}
            </p>
          </div>
        </div>
      </div>

      {/* Screenshot Insights if provided */}
      {hasScreenshots && analysis.screenshotInsights && (
        <div className="mt-3.5 rounded-2xl bg-sky-950/30 border border-sky-400/25 p-3.5 flex items-start gap-2.5 text-xs text-sky-200 backdrop-blur-md">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-sky-400 block">
              Screenshot Analysis Matrix ({screenshotCount} images)
            </span>
            <p className="text-[11px] text-sky-200/90 leading-relaxed mt-0.5">
              {analysis.screenshotInsights}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

