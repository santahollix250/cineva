// src/components/LoadingScreen.jsx
import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   🎨 "Emerald C Play" logo — same as Navbar
═══════════════════════════════════════════════════════════ */
const EmeraldCPlayLogo = ({ size = 96 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="55%" stopColor="#065f46" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="splashArc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="45%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
      <linearGradient id="splashPlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <radialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
      </radialGradient>
    </defs>

    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#splashBg)" />
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#splashGlow)" />
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="16"
      fill="none"
      stroke="url(#splashArc)"
      strokeWidth="1.5"
      opacity="0.7"
    />

    {[
      { x: 12, y: 32 },
      { x: 15, y: 20 },
      { x: 22, y: 12 },
      { x: 32, y: 8 },
      { x: 42, y: 12 },
      { x: 49, y: 20 },
      { x: 52, y: 32 },
      { x: 49, y: 44 },
      { x: 42, y: 52 },
      { x: 32, y: 56 },
      { x: 22, y: 52 },
      { x: 15, y: 44 },
    ].map((dot, i) => (
      <circle
        key={i}
        cx={dot.x}
        cy={dot.y}
        r="1.2"
        fill="url(#splashArc)"
        opacity={i % 2 === 0 ? 0.9 : 0.55}
      />
    ))}

    <path
      d="M 44 20 A 16 16 0 1 0 44 44"
      stroke="url(#splashArc)"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 42 20 A 16 16 0 0 0 26 15"
      stroke="#a7f3d0"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.75"
    />
    <path
      d="M 26 24 L 40 32 L 26 40 Z"
      fill="url(#splashPlay)"
      stroke="#065f46"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path d="M 28 27 L 28 37 L 35 32 Z" fill="#ecfdf5" opacity="0.35" />
    <circle cx="20" cy="18" r="1" fill="#a7f3d0" opacity="0.9" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   LoadingScreen — CINEVA Cinematic Splash
═══════════════════════════════════════════════════════════ */
export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger mount animations
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const loadingSteps = [
      { text: "Initializing CINEVA...", duration: 700 },
      { text: "Loading content library...", duration: 900 },
      { text: "Preparing your experience...", duration: 800 },
      { text: "Almost ready...", duration: 500 },
      { text: "Welcome!", duration: 400 },
    ];

    let currentStep = 0;
    const tick = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setLoadingText(step.text);

        const totalDuration = loadingSteps.reduce((sum, s) => sum + s.duration, 0);
        const elapsedDuration = loadingSteps
          .slice(0, currentStep + 1)
          .reduce((sum, s) => sum + s.duration, 0);
        const newProgress = Math.min(99, (elapsedDuration / totalDuration) * 100);
        setProgress(newProgress);
        currentStep++;

        if (currentStep === loadingSteps.length) {
          setTimeout(() => {
            setProgress(100);
            setLoadingText("Ready to stream!");
          }, 400);
        } else {
          intervalId = setTimeout(tick, step.duration);
        }
      }
    };

    let intervalId = setTimeout(tick, loadingSteps[0].duration);

    return () => clearTimeout(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#060d0a] overflow-hidden flex items-center justify-center">
      {/* ───────── Background layers ───────── */}
      {/* Deep radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a2218_0%,_#060d0a_45%,_#000_100%)]" />

      {/* Big emerald glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[520px] h-[520px] bg-emerald-500/15 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {/* Soft teal glow bottom-right */}
      <div className="absolute bottom-[-15%] right-[-10%] w-[380px] h-[380px] bg-teal-500/10 rounded-full blur-[120px] animate-blob" />

      {/* Cyan glow top-left */}
      <div className="absolute top-[-15%] left-[-10%] w-[380px] h-[380px] bg-cyan-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          animation: "grain 8s steps(10) infinite",
        }}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />

      {/* ───────── Content ───────── */}
      <div className="relative z-10 text-center px-6 w-full max-w-md">

        {/* Logo with pulsing rings */}
        <div
          className={`relative mx-auto mb-8 flex items-center justify-center transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Outer spinning arc ring */}
          <div className="absolute w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] rounded-full border border-emerald-500/20" />
          <div className="absolute w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] rounded-full border-t-2 border-emerald-400 animate-spin" style={{ animationDuration: "3s" }} />

          {/* Inner spinning arc (opposite direction) */}
          <div className="absolute w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-full border border-teal-500/20" />
          <div className="absolute w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-full border-b-2 border-teal-400 animate-spin-reverse" style={{ animationDuration: "2.5s" }} />

          {/* Glow behind logo */}
          <div className="absolute w-[140px] h-[140px] bg-emerald-500/40 rounded-full blur-3xl animate-pulse-slow" />

          {/* The logo */}
          <div className="relative drop-shadow-[0_0_25px_rgba(52,211,153,0.5)]">
            <EmeraldCPlayLogo size={110} />
          </div>

          {/* Orbiting dots */}
          <div className="absolute w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] animate-orbit">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          </div>
          <div className="absolute w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] animate-orbit-reverse">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.9)]" />
          </div>
        </div>

        {/* Brand name */}
        <div
          className={`transition-all duration-1000 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-5xl sm:text-6xl font-black tracking-[0.22em] leading-none">
            <span
              className="bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
              style={{
                textShadow:
                  "0 0 30px rgba(52,211,153,0.5), 0 0 60px rgba(20,184,166,0.25)",
              }}
            >
              CINEVA
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-3 text-[10px] sm:text-xs font-semibold tracking-[0.35em] uppercase
                       bg-gradient-to-r from-emerald-500/80 via-teal-400/80 to-emerald-500/80
                       bg-clip-text text-transparent animate-pulse-slow"
            style={{
              textShadow:
                "0 0 12px rgba(16,185,129,0.4), 0 1px 2px rgba(0,0,0,0.9)",
            }}
          >
            Premium Streaming
          </p>
        </div>

        {/* Divider */}
        <div
          className={`mt-6 mb-6 mx-auto h-px max-w-[220px] transition-all duration-1000 delay-400 ${
            mounted ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`}
          style={{
            background:
              "linear-gradient(90deg, transparent, #10b981 40%, #14b8a6 60%, transparent)",
          }}
        />

        {/* Progress */}
        <div
          className={`transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Loading text */}
          <p className="text-sm sm:text-base text-emerald-200/90 font-medium mb-3 h-5 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {loadingText}
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-[320px] mx-auto">
            <div className="relative h-1 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-900/60">
              {/* Filled */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/25 blur-sm" />
              </div>
              {/* Running shine */}
              <div
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-progress-shine"
                style={{ left: `calc(${progress}% - 32px)` }}
              />
            </div>

            {/* Percentage + tick markers */}
            <div className="flex justify-between items-center mt-2 text-[10px] font-mono">
              <span className="text-emerald-700/80 tracking-widest">LOADING</span>
              <span className="text-emerald-400 font-bold tracking-widest">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Feature chips */}
        <div
          className={`mt-8 grid grid-cols-3 gap-2 max-w-[340px] mx-auto transition-all duration-1000 delay-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {[
            { label: "4K HDR", sub: "Ultra HD" },
            { label: "No Ads", sub: "Pure cinema" },
            { label: "Offline", sub: "Download" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl py-2.5 px-2 bg-emerald-950/40 border border-emerald-900/50 backdrop-blur-sm"
            >
              <div className="text-[11px] font-bold text-emerald-300 tracking-wide">
                {f.label}
              </div>
              <div className="text-[9px] text-gray-500 mt-0.5 tracking-wider uppercase">
                {f.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom brand strip */}
        <div
          className={`mt-10 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-emerald-700/70 transition-all duration-1000 delay-1000 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          CINEVA • {new Date().getFullYear()}
        </div>
      </div>

      {/* ───────── Animations ───────── */}
      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-2%, 0); }
          40% { transform: translate(2%, 2%); }
          50% { transform: translate(-1%, 2%); }
          60% { transform: translate(2%, -1%); }
          70% { transform: translate(-2%, 1%); }
          80% { transform: translate(2%, -1%); }
          90% { transform: translate(-1%, -2%); }
        }

        @keyframes gradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }

        @keyframes blob {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(20px, -30px) scale(1.08); }
          66%  { transform: translate(-20px, 20px) scale(0.94); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }

        @keyframes orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes orbit-reverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }

        @keyframes progress-shine {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }

        .animate-gradient       { animation: gradient 3s ease infinite; }
        .animate-pulse-slow     { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-blob           { animation: blob 9s ease-in-out infinite; }
        .animate-spin-reverse   { animation: spin-reverse 2.5s linear infinite; }
        .animate-orbit          { animation: orbit 8s linear infinite; }
        .animate-orbit-reverse  { animation: orbit-reverse 6s linear infinite; }
        .animate-progress-shine { animation: progress-shine 1.6s ease-in-out infinite; }

        .animation-delay-2000   { animation-delay: 2s; }
        .animation-delay-4000   { animation-delay: 4s; }

        .drop-shadow-\\[0_0_25px_rgba\\(52\\,211\\,153\\,0\\.5\\)\\] {
          filter: drop-shadow(0 0 25px rgba(52,211,153,0.5));
        }
      `}</style>
    </div>
  );
}