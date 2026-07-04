import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronRight } from 'lucide-react';

interface IntroVideoOverlayProps {
  onClose?: () => void;
}

export const IntroVideoOverlay: React.FC<IntroVideoOverlayProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the intro has already played during this browser session
    const hasPlayed = sessionStorage.getItem('uns_intro_played');
    if (!hasPlayed) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || !videoRef.current) return;

    // Synchronize mute state
    videoRef.current.muted = isMuted;

    // Attempt autoplay
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayFailed(false);
        })
        .catch((error) => {
          console.warn("Autoplay unmuted prevented, trying muted fallback...", error);
          if (videoRef.current) {
            // Fallback: try muted autoplay
            videoRef.current.muted = true;
            setIsMuted(true);
            
            videoRef.current.play()
              .then(() => {
                setIsPlaying(true);
                setAutoplayFailed(false);
              })
              .catch((fallbackError) => {
                console.error("Muted autoplay also failed:", fallbackError);
                setAutoplayFailed(true);
                setIsPlaying(false);
              });
          }
        });
    }
  }, [isVisible]);

  // Unmute automatically on first user interaction with the document
  useEffect(() => {
    if (!isVisible) return;
    
    const handleFirstInteraction = () => {
      if (videoRef.current && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return cleanup;
  }, [isVisible]);

  const handleClose = () => {
    setIsExiting(true);
    // Persist that the intro played so we don't show it again this session
    sessionStorage.setItem('uns_intro_played', 'true');
    
    // Allow fade-out animation to complete before unmounting
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 600); // matching duration-500 + buffer
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // If manually played, unmute it as user action is guaranteed
      if (videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayFailed(false);
        })
        .catch(() => {
          setAutoplayFailed(true);
        });
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuteState = !videoRef.current.muted;
    videoRef.current.muted = nextMuteState;
    setIsMuted(nextMuteState);
  };

  const handleOverlayClick = () => {
    if (videoRef.current && videoRef.current.muted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };


  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (total) {
      setProgress((current / total) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(formatTime(videoRef.current.duration));
  };

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background ambient glowing lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Container */}
      <div 
        className={`relative w-full h-full overflow-hidden bg-black transition-transform duration-500 ease-out ${
          isExiting ? 'scale-95' : 'scale-100'
        }`}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src="/intro-video.mp4"
          className="w-full h-full object-cover cursor-pointer"
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleClose}
          onClick={handleTogglePlay}
        />

        {/* Top Control Bar: Skip Button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-950 text-white rounded-full border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300 font-medium text-sm hover:scale-105 shadow-lg shadow-black/20"
          >
            Skip Intro
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center Mute indicator / Click to turn on sound button */}
        {isPlaying && isMuted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
            <button
              onClick={handleToggleMute}
              className="pointer-events-auto flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full shadow-2xl shadow-emerald-500/50 transition-all duration-300 font-bold text-sm hover:scale-105 active:scale-95"
            >
              <VolumeX className="w-5 h-5" />
              Click to Turn On Sound
            </button>
          </div>
        )}

        {/* Big Center Play Button (shown if autoplay failed or paused) */}
        {(!isPlaying || autoplayFailed) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlay();
              }}
              className="pointer-events-auto w-20 h-20 flex items-center justify-center bg-emerald-500 text-slate-950 rounded-full shadow-2xl shadow-emerald-500/50 hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all duration-300 group"
            >
              <Play className="w-10 h-10 fill-current translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Bottom Control Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-6 flex flex-col gap-4 opacity-100 transition-opacity duration-300">
          {/* Progress bar */}
          <div className="w-full flex items-center gap-3">
            <span className="text-xs font-mono text-white/60 select-none min-w-[32px]">{currentTime}</span>
            <div 
              className="flex-grow h-1.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group/progress"
              onClick={(e) => {
                if (!videoRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPosition = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = clickPosition * videoRef.current.duration;
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-75 relative" 
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-md" />
              </div>
            </div>
            <span className="text-xs font-mono text-white/60 select-none min-w-[32px]">{duration}</span>
          </div>

          {/* Lower controls: Play/Pause, Mute/Unmute, Brand tagline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={handleTogglePlay}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white backdrop-blur-md transition-all duration-200 hover:scale-105"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
              </button>

              {/* Mute/Unmute Button */}
              <button
                onClick={handleToggleMute}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-105 ${
                  isMuted 
                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Brand watermark / Info */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                UNS Cleaning Products
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
