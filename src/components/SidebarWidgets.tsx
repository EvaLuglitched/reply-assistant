import React from 'react';
import {
  RELATIONSHIP_OPTIONS,
  RelationshipType,
  WARMTH_LABELS,
  RelationshipAnalysis,
} from '../types';
import { Users, Shield, ArrowUpRight, Compass, HeartHandshake, Sparkles } from 'lucide-react';

interface SidebarWidgetsProps {
  relationship: RelationshipType;
  warmth: number;
  onWarmthChange: (warmth: number) => void;
  analysis: RelationshipAnalysis | null;
  promiseCatchUp: boolean;
  hasScreenshots: boolean;
}

export const SidebarWidgets: React.FC<SidebarWidgetsProps> = ({
  relationship,
  warmth,
  onWarmthChange,
  analysis,
  promiseCatchUp,
  hasScreenshots,
}) => {
  const currentRel = RELATIONSHIP_OPTIONS.find((r) => r.value === relationship);
  const warmthInfo = WARMTH_LABELS[warmth] || WARMTH_LABELS[3];

  // Calculate arc for circular gauge (Streamline style from screenshot)
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  // 240 degree arc gauge
  const strokeDashoffset = circumference - (circumference * 0.75 * (warmth / 5));

  const reciprocityVal = analysis ? analysis.reciprocityScore : 78;

  return (
    <aside className="w-full lg:w-[280px] xl:w-[310px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-col gap-3 sm:gap-4 shrink-0">
      {/* Widget 1: Profile Matrix (matching top left card in screenshot) */}
      <div className="rounded-[22px] sm:rounded-[28px] frosted-card p-4 sm:p-5 relative overflow-hidden group">
        {/* Subtle corner sheen */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/[0.03] rounded-full blur-2xl pointer-events-none"></div>

        {/* Minimal dot pagination like screenshot */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"></span>
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">Nexus Lens</span>
        </div>

        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-display text-2xl sm:text-3xl font-light tracking-tight text-white drop-shadow-sm">
            {relationship === 'parent' ? 'Kin' : relationship.replace('_', ' ').split(' ')[0]}
          </span>
          <div className="flex flex-col border-l border-white/10 pl-3">
            <span className="text-[10px] uppercase tracking-wider text-white/45 font-mono font-light">Channel</span>
            <span className="text-xs text-white/90 font-light tracking-wide capitalize">{currentRel?.label}</span>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/50 font-light">
          <span>Catch-up pledge</span>
          <span className={`font-mono text-xs ${promiseCatchUp ? 'text-emerald-400 font-normal drop-shadow-sm' : 'text-white/40'}`}>
            {promiseCatchUp ? 'Active' : 'None'}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-white/50 font-light">
          <span>Screenshot context</span>
          <span className={`font-mono text-xs ${hasScreenshots ? 'text-sky-400 font-normal drop-shadow-sm' : 'text-white/40'}`}>
            {hasScreenshots ? 'Analyzed' : 'Not attached'}
          </span>
        </div>
      </div>

      {/* Widget 2: Circular Dial Gauge (Streamline +25 in reference screenshot) */}
      <div className="rounded-[22px] sm:rounded-[28px] frosted-card p-4 sm:p-5 flex flex-col items-center justify-between relative overflow-hidden">
        {/* Soft warm champagne halo glow behind dial matching screenshot */}
        <div className="absolute inset-0 bg-radial from-amber-200/[0.04] via-transparent to-transparent pointer-events-none"></div>

        <div className="w-full flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs font-mono font-light tracking-[0.2em] uppercase text-white/60">Streamline</span>
          <span className="text-[11px] font-mono font-light text-white/40">Tone Dial</span>
        </div>

        {/* Circular Gauge Graphic with Champagne/Gold gradient ring */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center my-1 sm:my-2">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
            {/* Background track circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeLinecap="round"
            />
            {/* Value progress circle with warm champagne/platinum metallic gradient */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#streamlineDialGradient)"
              strokeWidth="7"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out drop-shadow-[0_0_8px_rgba(230,218,198,0.3)]"
            />
            <defs>
              <linearGradient id="streamlineDialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3eee3" />
                <stop offset="45%" stopColor="#dfd4bf" />
                <stop offset="85%" stopColor="#9e9480" />
                <stop offset="100%" stopColor="#696252" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text in dial with subtle warm depth */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-display font-light tracking-tight text-white drop-shadow-sm">
              +{warmth * 15}
            </span>
            <span className="text-[10px] font-mono font-light tracking-wider uppercase text-white/55 mt-0.5">
              Warmth {warmth}/5
            </span>
          </div>
        </div>

        <div className="text-center w-full px-2 mt-0.5">
          <p className="text-xs font-normal text-white/90 truncate tracking-wide">{warmthInfo.title}</p>
          <p className="text-[11px] font-light text-white/45 leading-tight mt-0.5">{warmthInfo.subtitle}</p>
        </div>

        {/* Tactile micro warmth stepper buttons */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-white/[0.08] w-full">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onWarmthChange(lvl)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-mono font-light transition-all flex items-center justify-center touch-manipulation ${
                warmth === lvl
                  ? 'bg-[#f3ede2] text-black font-normal shadow-[0_2px_8px_rgba(243,237,226,0.5)] scale-105'
                  : 'bg-white/[0.05] border border-white/10 text-white/60 hover:bg-white/[0.1] hover:text-white active:bg-white/20'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Widget 3: Connected Communities 80% (matching bottom left card in screenshot) */}
      <div className="rounded-[22px] sm:rounded-[28px] frosted-card p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between sm:col-span-2 md:col-span-1">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/70 font-light tracking-wide">Relationship dynamic</span>
            <div className="w-6 h-6 rounded-full frosted-pill flex items-center justify-center text-white/80">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="font-display text-4xl sm:text-5xl font-extralight tracking-tight text-white drop-shadow-sm">
              {reciprocityVal}
            </span>
            <span className="text-xl font-display font-light text-white/40">%</span>
          </div>
          <p className="text-[11px] text-white/45 font-mono font-light tracking-wide mb-3">
            {analysis ? analysis.emotionalTone : 'Equilibrium Index'}
          </p>
        </div>

        {/* Segmented step bar graph matching screenshot bottom corner */}
        <div className="w-full flex items-end gap-1.5 h-4 bg-black/40 rounded-lg p-1 border border-white/[0.08] shadow-inner">
          <div className="h-full bg-white/90 rounded-sm flex-1 transition-all duration-500 shadow-sm"></div>
          <div
            className={`h-full rounded-sm flex-1 transition-all duration-500 ${
              reciprocityVal >= 40 ? 'bg-white/80' : 'bg-white/10'
            }`}
          ></div>
          <div
            className={`h-full rounded-sm flex-1 transition-all duration-500 ${
              reciprocityVal >= 60 ? 'bg-white/70' : 'bg-white/10'
            }`}
          ></div>
          <div
            className={`h-full rounded-sm flex-1 transition-all duration-500 ${
              reciprocityVal >= 75 ? 'bg-white/60' : 'bg-white/10'
            }`}
          ></div>
          <div
            className={`h-full rounded-sm flex-1 transition-all duration-500 ${
              reciprocityVal >= 90 ? 'bg-white/50' : 'bg-white/10'
            }`}
          ></div>
        </div>

        <div className="mt-3 text-[11px] text-white/55 leading-relaxed">
          {analysis ? analysis.relationshipDynamic : 'Adaptive calibration ensures responses fit the unspoken social contract.'}
        </div>
      </div>
    </aside>
  );
};

