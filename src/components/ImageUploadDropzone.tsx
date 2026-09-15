import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle2, FileText, ScanLine } from 'lucide-react';
import { UploadedScreenshot } from '../types';

interface ImageUploadDropzoneProps {
  screenshots: UploadedScreenshot[];
  onAddScreenshots: (files: File[]) => void;
  onRemoveScreenshot: (id: string) => void;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  screenshots,
  onAddScreenshots,
  onRemoveScreenshot,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = (Array.from(e.dataTransfer.files) as File[]).filter((file: File) =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        onAddScreenshots(imageFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFiles = (Array.from(e.target.files) as File[]).filter((file: File) =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        onAddScreenshots(imageFiles);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-mono tracking-wider uppercase text-white/70 flex items-center gap-1.5">
          <ScanLine className="w-3.5 h-3.5 text-white/50" />
          Previous Text Screenshots & History
          <span className="text-[10px] lowercase text-white/40 font-sans">(optional)</span>
        </label>
        {screenshots.length > 0 && (
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {screenshots.length} screenshot{screenshots.length > 1 ? 's' : ''} loaded
          </span>
        )}
      </div>

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full rounded-2xl transition-all cursor-pointer p-4 flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'frosted-card border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
            : 'frosted-input hover:border-white/25'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full frosted-pill flex items-center justify-center text-white/80 group-hover:text-white transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-white/90">
              Drag & drop chat screenshots or <span className="underline decoration-white/30 hover:decoration-white font-semibold text-[#f3ede2]">browse files</span>
            </p>
            <p className="text-[11px] text-white/45 mt-0.5">
              Analyzes communication patterns, bubble length parity, and response cadence
            </p>
          </div>
        </div>
      </div>

      {/* Previews Grid */}
      {screenshots.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2.5">
          {screenshots.map((item) => (
            <div
              key={item.id}
              className="group relative flex items-center gap-2.5 px-3 py-2 rounded-xl frosted-card-subtle text-xs text-white/80 max-w-full sm:max-w-xs shadow-md"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-black/50">
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate flex-1">
                <p className="truncate text-white/90 text-xs font-mono">{item.name}</p>
                <p className="text-[10px] text-white/45 font-mono">
                  {(item.size / 1024).toFixed(1)} KB · Analyzed
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveScreenshot(item.id);
                }}
                aria-label="Remove screenshot"
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-rose-500/30 hover:text-rose-200 text-white/50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
