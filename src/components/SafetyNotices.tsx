import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, PenLine, Info } from 'lucide-react';
import type { SafetyFlags } from '../types';

interface SafetyNoticesProps {
  flags: SafetyFlags | null;
  careNote: string;
  missingDetails: string[];
}

/**
 * The part of the app that exists because of the role card's boundaries:
 * it never invents facts, it never brushes off an emergency, and it says
 * out loud when it declined to answer something.
 */
export const SafetyNotices: React.FC<SafetyNoticesProps> = ({
  flags,
  careNote,
  missingDetails,
}) => {
  const hasFlag = flags?.urgent || flags?.pressureDetected || flags?.sensitiveRequest;
  if (!hasFlag && !careNote && missingDetails.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {flags?.urgent && (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/[0.07] p-4 flex gap-3">
          <PhoneCall className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-rose-100">This one may need a real call</p>
            <p className="text-xs text-rose-100/70 mt-1 leading-relaxed">
              The message reads as urgent or genuinely distressed. A generated reply is
              probably the wrong tool here — consider calling them instead.
            </p>
          </div>
        </div>
      )}

      {flags?.pressureDetected && (
        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/[0.06] p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-50">There's pressure in this message</p>
            <p className="text-xs text-amber-50/70 mt-1 leading-relaxed">
              The drafts below hold your position calmly. They don't apologise for
              anything you haven't done, and they don't push back either.
            </p>
          </div>
        </div>
      )}

      {flags?.sensitiveRequest && (
        <div className="rounded-2xl border border-sky-300/30 bg-sky-400/[0.06] p-4 flex gap-3">
          <ShieldAlert className="w-4 h-4 text-sky-200 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-sky-50">Something private was asked for</p>
            <p className="text-xs text-sky-50/70 mt-1 leading-relaxed">
              The drafts leave it out on purpose. Money, addresses, health details and
              the like are yours to share or not — add them yourself if you want to.
            </p>
          </div>
        </div>
      )}

      {careNote && (
        <div className="rounded-2xl frosted-card-subtle p-4 flex gap-3">
          <Info className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
          <p className="text-xs text-white/75 leading-relaxed">{careNote}</p>
        </div>
      )}

      {missingDetails.length > 0 && (
        <div className="rounded-2xl frosted-card-subtle p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <PenLine className="w-3.5 h-3.5 text-[#f3ede2]" />
            <p className="text-xs font-mono uppercase tracking-wider text-white/80">
              Fill these in before sending
            </p>
          </div>
          <p className="text-[11px] text-white/45 mb-3 leading-relaxed">
            The drafts use <span className="text-white/70">[brackets]</span> instead of
            making things up about your life. Replace them with what's actually true.
          </p>
          <ul className="flex flex-col gap-1.5">
            {missingDetails.map((detail, i) => (
              <li key={i} className="text-xs text-white/75 flex gap-2 leading-relaxed">
                <span className="text-white/30 font-mono shrink-0">{i + 1}.</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
