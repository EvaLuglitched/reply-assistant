/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FormState,
  LENGTH_OPTIONS,
  RELATIONSHIP_OPTIONS,
  RelationshipAnalysis,
  RelationshipType,
  ReplyLength,
  SafetyFlags,
  SuggestedReply,
  UploadedScreenshot,
  WARMTH_LABELS,
} from './types';
import { generateReplies } from './api';
import { Header } from './components/Header';
import { SidebarWidgets } from './components/SidebarWidgets';
import { ImageUploadDropzone } from './components/ImageUploadDropzone';
import { RelationshipAnalysisCard } from './components/RelationshipAnalysisCard';
import { SuggestedReplies } from './components/SuggestedReplies';
import { SafetyNotices } from './components/SafetyNotices';
import {
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  Sliders,
  CheckSquare,
  Square,
  Send,
  Loader2,
  Wifi,
  Zap,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const [form, setForm] = useState<FormState>({
    receivedMessage: '',
    senderRelationship: 'distant_friend',
    length: 'medium',
    warmth: 3,
    promiseCatchUp: false,
    additionalContext: '',
  });

  const [screenshots, setScreenshots] = useState<UploadedScreenshot[]>([]);
  const [replies, setReplies] = useState<SuggestedReply[]>([]);
  const [analysis, setAnalysis] = useState<RelationshipAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingDetails, setMissingDetails] = useState<string[]>([]);
  const [flags, setFlags] = useState<SafetyFlags | null>(null);
  const [careNote, setCareNote] = useState('');
  const [activeTab, setActiveTab] = useState<'generator' | 'analysis' | 'replies'>('generator');
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // Handle preset selection
  const handleSelectPreset = (preset: 'parent' | 'distant_friend' | 'classmate') => {
    if (preset === 'parent') {
      setForm({
        receivedMessage:
          "Hey sweetheart, haven't heard from you in a couple weeks! Hope work isn't overwhelming and you're eating well. Give me a call when you have a free minute!",
        senderRelationship: 'parent',
        length: 'medium',
        warmth: 4,
        promiseCatchUp: true,
        additionalContext: 'Just finished a big sprint at work and sleeping in this weekend',
      });
    } else if (preset === 'distant_friend') {
      setForm({
        receivedMessage:
          "Hey! Saw your recent photos, looks like you've been having fun! Can't believe it's been almost two years since we caught up. We should grab coffee or a drink sometime soon!",
        senderRelationship: 'distant_friend',
        length: 'short',
        warmth: 3,
        promiseCatchUp: true,
        additionalContext: 'Moved to a new apartment in the city last month',
      });
    } else {
      setForm({
        receivedMessage:
          "Hey! Super random question, do you happen to remember the name of that professor from our capstone project? Also hope you've been doing awesome!",
        senderRelationship: 'old_classmate',
        length: 'short',
        warmth: 2,
        promiseCatchUp: false,
        additionalContext: 'Pretty sure it was Professor Henderson',
      });
    }
  };

  // Add screenshots
  const handleAddScreenshots = (files: File[]) => {
    const newItems: UploadedScreenshot[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setScreenshots((prev) => [...prev, ...newItems]);
  };

  // Remove screenshot
  const handleRemoveScreenshot = (id: string) => {
    setScreenshots((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered;
    });
  };

  // Submit to /api/generate
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.receivedMessage.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await generateReplies({ ...form, screenshots });

      setReplies(data.replies ?? []);
      setAnalysis(data.relationshipAnalysis ?? null);
      setMissingDetails(data.missingDetails ?? []);
      setFlags(data.flags ?? null);
      setCareNote(data.careNote ?? '');
      setSubmittedOnce(true);
      setActiveTab('replies');
    } catch (err) {
      // No silent fake replies: if the service failed, say so.
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setReplies([]);
      setAnalysis(null);
      setMissingDetails([]);
      setFlags(null);
      setCareNote('');
    } finally {
      setIsLoading(false);
    }
  };

  const warmthMeta = WARMTH_LABELS[form.warmth] || WARMTH_LABELS[3];

  return (
    <div className="min-h-screen atmospheric-bg text-[#dcdfe5] flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 selection:bg-white/20 relative">
      {/* Global atmospheric depth highlights matching reference image */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-35 z-0">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-amber-100/[0.04] rounded-full blur-3xl"></div>
        <div className="absolute -top-20 right-1/4 w-[500px] h-80 bg-slate-300/[0.05] rounded-full blur-3xl"></div>
      </div>

      {/* Container holding the interface */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasReplies={replies.length > 0}
          onSelectPreset={handleSelectPreset}
        />

        {/* Main Dashboard Layout (Responsive on all screen sizes) */}
        <div className="w-full flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
          {/* Left Sidebar Bento Column (order-2 on mobile/tablet so input is immediately accessible, order-1 on desktop) */}
          <div className="w-full lg:w-[280px] xl:w-[310px] order-2 lg:order-1 shrink-0">
            <SidebarWidgets
              relationship={form.senderRelationship}
              warmth={form.warmth}
              onWarmthChange={(val) => setForm((prev) => ({ ...prev, warmth: val }))}
              analysis={analysis}
              promiseCatchUp={form.promiseCatchUp}
              hasScreenshots={screenshots.length > 0}
            />
          </div>

          {/* Center Main Stage Frame (Rounded Cockpit Window from screenshot) */}
          <main className="order-1 lg:order-2 flex-1 w-full rounded-[24px] sm:rounded-[32px] frosted-card p-4 sm:p-7 lg:p-9 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Atmospheric perspective depth background with soft misty light and glowing city nodes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
              <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-gradient-to-br from-white/[0.08] via-amber-200/[0.03] to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-1/4 w-[400px] h-[250px] bg-gradient-to-t from-slate-400/[0.06] to-transparent rounded-full blur-2xl"></div>
              
              {/* Subtle architectural depth grid lines & soft bokeh nodes */}
              <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(245, 240, 230, 0.7)" />
                    <stop offset="60%" stopColor="rgba(215, 205, 185, 0.2)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                {/* Node coordinates reminiscent of smart living city nodes in reference image */}
                <circle cx="82%" cy="22%" r="2.5" fill="#f5ede0" />
                <circle cx="82%" cy="22%" r="14" fill="url(#nodeGlow)" />
                <circle cx="91%" cy="38%" r="1.5" fill="#e8dfce" />
                <circle cx="75%" cy="54%" r="2" fill="#d9cfbd" />
                <circle cx="75%" cy="54%" r="10" fill="url(#nodeGlow)" />
                <circle cx="65%" cy="18%" r="1.5" fill="#ffffff" opacity="0.6" />
                <circle cx="88%" cy="65%" r="1.5" fill="#ffffff" opacity="0.4" />
                {/* Micro horizon connective line */}
                <line x1="65%" y1="18%" x2="82%" y2="22%" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <line x1="82%" y1="22%" x2="75%" y2="54%" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="82%" y1="22%" x2="91%" y2="38%" stroke="rgba(255,255,255,0.07)" />
              </svg>
            </div>

            {/* Top Right Floating Capsule Controls (matching the vertical power & wifi pill in screenshot) */}
            <div className="absolute top-5 sm:top-7 right-5 sm:right-7 hidden sm:flex items-center gap-2 z-10">
              <div className="flex flex-col gap-1.5 p-1.5 rounded-full frosted-pill shadow-xl">
                <div
                  title="Backend API Connected"
                  className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div
                  title="Context Stream Online"
                  className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  <Wifi className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Content Tabs Navigation Switcher */}
            <div className="w-full relative z-10">
              {/* Display Heading matching "Smart Living in a Digital World" typography in screenshot */}
              <div className="mb-5 sm:mb-7 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full frosted-pill text-xs text-white/80 mb-2.5 sm:mb-3.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f3ede2] shadow-[0_0_8px_rgba(243,237,226,0.9)] animate-ping"></span>
                  <span className="font-mono font-light uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[9px] sm:text-[10px]">Response Engineering Engine</span>
                </div>
                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extralight sm:font-light tracking-tight text-white leading-[1.15] drop-shadow-sm">
                  Thoughtful Replies for Every Connection
                </h1>
                <p className="text-xs sm:text-sm text-white/55 font-light mt-2 sm:mt-2.5 leading-relaxed tracking-wide">
                  Calibrate personal warmth, analyze unspoken relationship dynamics, and draft
                  graceful responses in seconds.
                </p>
              </div>

              {/* Quick Preset Selector for Mobile and Small Screens */}
              <div className="flex xl:hidden items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-2 mb-4 -mt-1">
                <span className="text-[11px] font-mono text-white/40 whitespace-nowrap pr-1">Try example:</span>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('parent')}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs whitespace-nowrap transition-colors border border-white/10 cursor-pointer"
                >
                  Parent
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('distant_friend')}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs whitespace-nowrap transition-colors border border-white/10 cursor-pointer"
                >
                  Distant Friend
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('classmate')}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs whitespace-nowrap transition-colors border border-white/10 cursor-pointer"
                >
                  Classmate
                </button>
              </div>

              {/* View 1: Main Form Input */}
              {activeTab === 'generator' && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {error && (
                    <div className="rounded-2xl border border-rose-400/40 bg-rose-500/[0.07] p-4 flex gap-3">
                      <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-rose-100">Couldn't generate replies</p>
                        <p className="text-xs text-rose-100/75 mt-1 leading-relaxed">{error}</p>
                      </div>
                    </div>
                  )}
                  {/* 1. Received Message Textarea (Required) */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="received-message"
                        className="text-xs font-mono tracking-wider uppercase text-white/80 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-white/60" />
                        The Message You Received
                        <span className="text-rose-400 font-sans">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-white/45">
                        {form.receivedMessage.length} characters
                      </span>
                    </div>

                    <div className="relative rounded-2xl frosted-input transition-all">
                      <textarea
                        id="received-message"
                        required
                        rows={4}
                        placeholder="Paste the message you received from a parent, distant friend, or relative..."
                        value={form.receivedMessage}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, receivedMessage: e.target.value }))
                        }
                        className="w-full bg-transparent p-4 text-sm text-white/95 placeholder:text-white/30 focus:outline-none resize-y leading-relaxed font-sans"
                      />

                      {/* Quick paste helper */}
                      {form.receivedMessage.length === 0 && (
                        <div className="px-4 pb-3 flex items-center gap-2 text-xs text-white/45">
                          <span className="text-[11px]">Tip: Select a preset from the top bar to test instantly</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Dropdowns Row: "Who is it from" & "Length" */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Who is it from Dropdown */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="sender-relationship"
                        className="text-xs font-mono tracking-wider uppercase text-white/80 flex items-center justify-between"
                      >
                        <span>Who is it from?</span>
                        <span className="text-[10px] text-white/45 font-sans">10 connection types</span>
                      </label>

                      <div className="relative">
                        <select
                          id="sender-relationship"
                          value={form.senderRelationship}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              senderRelationship: e.target.value as RelationshipType,
                            }))
                          }
                          className="w-full appearance-none rounded-2xl frosted-input px-4 py-3 text-sm text-white/90 focus:outline-none cursor-pointer pr-10 font-sans"
                        >
                          {RELATIONSHIP_OPTIONS.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              className="bg-[#181a22] text-white"
                            >
                              {opt.label} — {opt.description}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Length Dropdown */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="reply-length"
                        className="text-xs font-mono tracking-wider uppercase text-white/80 flex items-center justify-between"
                      >
                        <span>Length</span>
                        <span className="text-[10px] text-white/45 font-sans">Response depth</span>
                      </label>

                      <div className="relative">
                        <select
                          id="reply-length"
                          value={form.length}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              length: e.target.value as ReplyLength,
                            }))
                          }
                          className="w-full appearance-none rounded-2xl frosted-input px-4 py-3 text-sm text-white/90 focus:outline-none cursor-pointer pr-10 font-sans"
                        >
                          {LENGTH_OPTIONS.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              className="bg-[#181a22] text-white"
                            >
                              {opt.label} — {opt.detail}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Warmth Slider (1 to 5) in frosted glass container */}
                  <div className="rounded-2xl frosted-card-subtle p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="warmth-slider"
                        className="text-xs font-mono tracking-wider uppercase text-white/80 flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5 text-white/60" />
                        Warmth Level:
                        <span className="text-[#f3ede2] font-semibold font-mono text-sm ml-1">
                          {form.warmth} / 5
                        </span>
                      </label>

                      <span className="text-xs font-mono text-white/80 px-3 py-0.5 rounded-full frosted-pill">
                        {warmthMeta.title}
                      </span>
                    </div>

                    <div className="px-1 py-2">
                      <input
                        id="warmth-slider"
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={form.warmth}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, warmth: parseInt(e.target.value, 10) }))
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Stepper notches */}
                    <div className="flex justify-between items-center px-1 text-[11px] font-mono text-white/45">
                      <span className={form.warmth === 1 ? 'text-[#f3ede2] font-bold' : ''}>1 Reserved</span>
                      <span className={form.warmth === 2 ? 'text-[#f3ede2] font-bold' : ''}>2 Measured</span>
                      <span className={form.warmth === 3 ? 'text-[#f3ede2] font-bold' : ''}>3 Friendly</span>
                      <span className={form.warmth === 4 ? 'text-[#f3ede2] font-bold' : ''}>4 Caring</span>
                      <span className={form.warmth === 5 ? 'text-[#f3ede2] font-bold' : ''}>5 Loving</span>
                    </div>
                  </div>

                  {/* 4. Checkbox: "I'm willing to promise a proper catch-up later" */}
                  <div
                    onClick={() =>
                      setForm((prev) => ({ ...prev, promiseCatchUp: !prev.promiseCatchUp }))
                    }
                    className={`rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer transition-all ${
                      form.promiseCatchUp
                        ? 'frosted-card border-white/30 text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                        : 'frosted-input text-white/75 hover:border-white/20'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                      {form.promiseCatchUp ? (
                        <CheckSquare className="w-5 h-5 text-[#f3ede2] drop-shadow-sm" />
                      ) : (
                        <Square className="w-5 h-5 text-white/35" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-medium select-none">
                        I'm willing to promise a proper catch-up later
                      </span>
                      <p className="text-[11px] text-white/45 select-none mt-0.5">
                        Will naturally integrate a gentle, low-pressure offer to call or meet when things settle down.
                      </p>
                    </div>
                  </div>

                  {/* 5. Text Input: "Anything true I should include" (optional) */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="additional-context"
                      className="text-xs font-mono tracking-wider uppercase text-white/80 flex items-center justify-between"
                    >
                      <span>Anything true I should include</span>
                      <span className="text-[10px] text-white/45 font-sans">(optional context)</span>
                    </label>

                    <input
                      id="additional-context"
                      type="text"
                      placeholder="e.g. Just moved into a new place, traveling next week, swamped with work sprint..."
                      value={form.additionalContext}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, additionalContext: e.target.value }))
                      }
                      className="w-full rounded-2xl frosted-input px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none font-sans"
                    />
                  </div>

                  {/* 6. Image upload area for previous text screenshots */}
                  <ImageUploadDropzone
                    screenshots={screenshots}
                    onAddScreenshots={handleAddScreenshots}
                    onRemoveScreenshot={handleRemoveScreenshot}
                  />

                  {/* 7. Submit Button (Matching the sleek pill arrow button in screenshot) */}
                  <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-xs text-white/45 font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Target: POST /api/generate</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !form.receivedMessage.trim()}
                      className="group relative px-7 py-3.5 rounded-full bg-gradient-to-b from-[#2a2d37] to-[#1a1c24] hover:from-[#f3ede2] hover:to-[#dfd4bf] text-white hover:text-black border border-white/20 hover:border-white transition-all duration-300 shadow-[0_12px_28px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white group-hover:text-black" />
                          <span className="text-xs font-light font-mono uppercase tracking-[0.15em]">
                            Synthesizing Replies...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-light font-mono uppercase tracking-[0.15em]">
                            Generate 3 Suggested Replies
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* View 2: Relationship Lens & Analysis */}
              {activeTab === 'analysis' && (
                <div className="flex flex-col gap-6">
                  {analysis ? (
                    <RelationshipAnalysisCard
                      analysis={analysis}
                      hasScreenshots={screenshots.length > 0}
                      screenshotCount={screenshots.length}
                    />
                  ) : (
                    <div className="rounded-3xl frosted-card-subtle p-10 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full frosted-pill flex items-center justify-center text-white/50 mb-3">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-display font-medium text-white mb-1">
                        Analysis Ready on Request
                      </h3>
                      <p className="text-xs text-white/45 max-w-sm mb-5">
                        Submit a message or upload chat screenshots to analyze communication cadence,
                        emotional stakes, and unspoken dynamics.
                      </p>
                    </div>
                  )}

                  {/* Return to form button */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('generator')}
                      className="px-4 py-2 rounded-full text-xs font-mono text-white/70 hover:text-white frosted-pill transition-colors"
                    >
                      ← Back to Message Editor
                    </button>
                    {replies.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('replies')}
                        className="px-5 py-2 rounded-full text-xs font-mono text-black bg-[#f3ede2] hover:bg-white font-semibold transition-colors shadow-md"
                      >
                        View 3 Replies →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* View 3: Suggested Replies */}
              {activeTab === 'replies' && (
                <div className="flex flex-col gap-6">
                  <SafetyNotices
                    flags={flags}
                    careNote={careNote}
                    missingDetails={missingDetails}
                  />

                  <SuggestedReplies
                    replies={replies}
                    onRegenerate={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    onModifyInputs={() => setActiveTab('generator')}
                  />

                  {/* Inline Relationship Analysis Summary */}
                  {analysis && (
                    <div className="mt-4">
                      <RelationshipAnalysisCard
                        analysis={analysis}
                        hasScreenshots={screenshots.length > 0}
                        screenshotCount={screenshots.length}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Sub-panel details matching the screenshot footer caption */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/45 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                <span className="font-mono text-[11px] text-white/70">Interface Engine Active</span>
                <span className="mx-1 text-white/25">·</span>
                <span>No API keys required</span>
              </div>
              <p className="text-[11px] text-white/35 max-w-md">
                Strict client-side frontend interface routing to <code className="text-white/60">/api/generate</code>.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
