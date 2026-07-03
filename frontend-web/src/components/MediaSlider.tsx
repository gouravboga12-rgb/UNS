import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Film } from 'lucide-react';

interface MediaSliderProps {
  images: string[];
  videos: string[];
  productName: string;
  /** compact = card mode (square aspect, small arrows); full = detail page mode */
  mode?: 'compact' | 'full';
  className?: string;
}

const isVideoUrl = (url: string) =>
  /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url) ||
  url.includes('/video/upload/') ||
  url.includes('video/');

export const MediaSlider: React.FC<MediaSliderProps> = ({
  images,
  videos,
  productName,
  mode = 'compact',
  className = '',
}) => {
  // Merge all media: images first then videos
  const allMedia: { url: string; type: 'image' | 'video' }[] = [
    ...(images || []).map(url => ({ url, type: 'image' as const })),
    ...(videos || []).map(url => ({ url, type: 'video' as const })),
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const total = allMedia.length;
  if (total === 0) return null;

  const activeMedia = allMedia[activeIdx] ?? allMedia[0];
  const isActiveVideo = activeMedia.type === 'video' || isVideoUrl(activeMedia.url);

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    if (videoRef.current) { videoRef.current.pause(); }
    setActiveIdx(i => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    if (videoRef.current) { videoRef.current.pause(); }
    setActiveIdx(i => (i + 1) % total);
  }, [total]);

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    if (videoRef.current) { videoRef.current.pause(); }
    setActiveIdx(idx);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    if (mode !== 'full') return; // card mode: don't intercept, let Link navigate
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const arrowBase =
    'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-900/85 active:scale-95 text-white backdrop-blur-sm border border-white/10 transition-all duration-200 shadow-lg';
  const arrowSm = mode === 'compact' ? 'w-6 h-6' : 'w-9 h-9';

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* ── Main Viewer ── */}
      <div className="relative w-full h-full">
        {isActiveVideo ? (
          <video
            ref={videoRef}
            src={activeMedia.url}
            className="w-full h-full object-cover"
            playsInline
            loop
            muted={mode === 'compact'}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={handleVideoClick}
          />
        ) : (
          <img
            src={activeMedia.url}
            alt={productName}
            className={`w-full h-full object-cover ${mode === 'compact' ? 'group-hover:scale-105 transition-transform duration-500' : ''}`}
            loading="lazy"
          />
        )}

        {/* Video play overlay (compact mode) */}
        {isActiveVideo && mode === 'compact' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-slate-900/60 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
              <Play className="w-5 h-5 text-white fill-white translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Video play/pause overlay (full mode) */}
        {isActiveVideo && mode === 'full' && !isPlaying && (
          <button
            onClick={handleVideoClick}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/30 hover:bg-slate-950/20 transition-colors"
          >
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-slate-900 fill-current translate-x-0.5" />
            </div>
          </button>
        )}

        {/* Media type badge */}
        {isActiveVideo && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-900/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 pointer-events-none">
            <Film className="w-2.5 h-2.5" />
            VIDEO
          </div>
        )}
      </div>

      {/* ── Navigation Arrows (only if more than 1 media) ── */}
      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className={`${arrowBase} ${arrowSm} left-2`}
            aria-label="Previous media"
          >
            <ChevronLeft className={mode === 'compact' ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
          </button>
          <button
            onClick={goNext}
            className={`${arrowBase} ${arrowSm} right-2`}
            aria-label="Next media"
          >
            <ChevronRight className={mode === 'compact' ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 pointer-events-none">
            {allMedia.map((m, i) => (
              <button
                key={i}
                onClick={e => handleDotClick(e, i)}
                aria-label={`Go to media ${i + 1}`}
                className={`pointer-events-auto rounded-full border transition-all duration-200 ${
                  i === activeIdx
                    ? 'w-4 h-1.5 bg-white border-white/50'
                    : `w-1.5 h-1.5 border-white/30 ${m.type === 'video' ? 'bg-emerald-400/80' : 'bg-white/60'}`
                }`}
              />
            ))}
          </div>

          {/* Counter badge */}
          <div className="absolute top-2 right-2 bg-slate-900/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 pointer-events-none">
            {activeIdx + 1}/{total}
          </div>
        </>
      )}
    </div>
  );
};
