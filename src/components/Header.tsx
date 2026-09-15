import React from 'react';
import { Sparkles, Layers, ShieldCheck, Zap, MessageSquare, Box, Diamond, Hexagon, Maximize2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generator' | 'analysis' | 'replies';
  setActiveTab: (tab: 'generator' | 'analysis' | 'replies') => void;
  hasReplies: boolean;
  onSelectPreset: (preset: 'parent' | 'distant_friend' | 'classmate') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasReplies,
  onSelectPreset,
}) => {
  return (
    <header className="w-full flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 pt-1 sm:pt-2 border-b border-white/[0.08]">
      {/* Brand logo & mobile top bar */}
      <div className="w-full lg:w-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#323642]/80 via-[#20222a]/90 to-[#14151a] border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)] shrink-0">
            <div className="grid grid-cols-2 gap-1.5 p-2">
              <span className="w-2 h-2 rounded-sm bg-white/95 shadow-sm"></span>
              <span className="w-2 h-2 rounded-sm bg-white/35"></span>
              <span className="w-2 h-2 rounded-sm bg-white/45"></span>
              <span className="w-2 h-2 rounded-sm bg-white/85 shadow-sm"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-light tracking-[0.18em] sm:tracking-[0.2em] text-base sm:text-lg text-white drop-shadow-sm whitespace-nowrap">
                NEXUS REPLY
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono font-light tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15 backdrop-blur-md shadow-sm">
                v3.0
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/45 font-light tracking-wider truncate max-w-[210px] sm:max-w-none">
              Relationship Intelligence & Context Calibrator
            </p>
          </div>
        </div>

        {/* Mobile status indicator */}
        <div className="flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded-full frosted-pill text-[10px] font-mono text-white/80 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
          <span>Online</span>
        </div>
      </div>

      {/* Center Nav Pills with responsive overflow handling */}
      <div className="w-full sm:w-auto overflow-x-auto no-scrollbar scrollbar-none py-0.5 flex justify-center">
        <nav className="flex items-center gap-1 p-1 sm:p-1.5 rounded-full frosted-pill shadow-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-light tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-[#f3ede2] text-black font-normal shadow-[0_2px_10px_rgba(243,237,226,0.35)]'
                : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span className="sm:hidden">Context</span>
            <span className="hidden sm:inline">Message & Context</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-light tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analysis'
                ? 'bg-[#f3ede2] text-black font-normal shadow-[0_2px_10px_rgba(243,237,226,0.35)]'
                : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span className="sm:hidden">Analysis</span>
            <span className="hidden sm:inline">Relationship Lens</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('replies')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-light tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'replies'
                ? 'bg-[#f3ede2] text-black font-normal shadow-[0_2px_10px_rgba(243,237,226,0.35)]'
                : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span className="sm:hidden">Replies</span>
            <span className="hidden sm:inline">Suggested Replies</span>
            {hasReplies && (
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            )}
          </button>
        </nav>
      </div>

      {/* Right Action & Crystalline Icons matching the website screenshot */}
      <div className="hidden lg:flex items-center gap-2.5">
        {/* Quick sample loader presets on desktop */}
        <div className="hidden xl:flex items-center gap-1.5 frosted-pill px-3 py-1 text-xs text-white/60">
          <span className="text-[11px] text-white/40 pr-1">Try example:</span>
          <button
            type="button"
            onClick={() => onSelectPreset('parent')}
            className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/75 hover:text-white text-[11px] transition-colors"
          >
            Parent
          </button>
          <button
            type="button"
            onClick={() => onSelectPreset('distant_friend')}
            className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/75 hover:text-white text-[11px] transition-colors"
          >
            Distant Friend
          </button>
          <button
            type="button"
            onClick={() => onSelectPreset('classmate')}
            className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/75 hover:text-white text-[11px] transition-colors"
          >
            Classmate
          </button>
        </div>

        {/* Status capsule pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full frosted-pill text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
          <span className="text-[11px] font-mono text-white/75">/api/generate</span>
        </div>

        {/* 3 Frosted faceted geometric badges */}
        <div className="flex items-center gap-1.5">
          <div
            title="Geometric Crystal Mesh"
            className="w-8 h-8 rounded-full frosted-pill flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all cursor-pointer"
          >
            <Diamond className="w-3.5 h-3.5" />
          </div>
          <div
            title="Faceted Hexagonal Node"
            className="w-8 h-8 rounded-full frosted-pill flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all cursor-pointer"
          >
            <Hexagon className="w-3.5 h-3.5" />
          </div>
          <div
            title="Dimensional Spatial Frame"
            className="w-8 h-8 rounded-full frosted-pill flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all cursor-pointer"
          >
            <Box className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </header>
  );
};

