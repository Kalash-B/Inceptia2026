"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Rich, distinct Hogwarts house color themes with calm ambient glows
const AUTOMATED_THEMES = [
  {
    name: "Gryffindor",
    accent: "#ffd700",
    glow: "rgba(255, 215, 0, 0.45)",
    cardBg: "bg-gradient-to-b from-[#2d0000]/95 via-[#1a0000]/95 to-[#0a0000]/95",
    border: "border-amber-500/50",
    bg: "from-[#280000] via-[#120000] to-[#050000]",
  },
  {
    name: "Ravenclaw",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.45)",
    cardBg: "bg-gradient-to-b from-[#001736]/95 via-[#000a1c]/95 to-[#00040d]/95",
    border: "border-sky-500/50",
    bg: "from-[#001c40] via-[#000d21] to-[#00050e]",
  },
  {
    name: "Slytherin",
    accent: "#34d399",
    glow: "rgba(52, 211, 153, 0.45)",
    cardBg: "bg-gradient-to-b from-[#002b1a]/95 via-[#00140c]/95 to-[#000704]/95",
    border: "border-emerald-500/50",
    bg: "from-[#00331f] via-[#00170e] to-[#000805]",
  },
  {
    name: "Hufflepuff",
    accent: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.45)",
    cardBg: "bg-gradient-to-b from-[#301f00]/95 via-[#180f00]/95 to-[#0a0600]/95",
    border: "border-yellow-500/50",
    bg: "from-[#362300] via-[#1a1100] to-[#080500]",
  },
];

export default function HarryPotterTimer() {
  // Automated 12-second calm color cycling theme index
  const [themeIndex, setThemeIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Time state (milliseconds)
  const [totalMs, setTotalMs] = useState(25 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(25 * 60 * 1000);
  const [isRunning, setIsRunning] = useState(false);

  // Customization modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(25);
  const [inputS, setInputS] = useState(0);

  // Reference for timestamp tracking
  const targetEndRef = useRef<number | null>(null);

  const theme = AUTOMATED_THEMES[themeIndex];

  // -------------------------------------------------------------
  // CALM, SLOW AUTOMATIC GRADIENT ROTATION (EVERY 12 SECONDS)
  // -------------------------------------------------------------
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setThemeIndex((prev) => (prev + 1) % AUTOMATED_THEMES.length);
    }, 12000); // 12 seconds per theme for a calm, slow ambient feel

    return () => clearInterval(cycleInterval);
  }, []);

  // Detect native browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // -------------------------------------------------------------
  // BACKGROUND ACCURATE TIMER LOGIC
  // Timestamp math (Date.now()) so switching browser tabs never drifts
  // -------------------------------------------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!targetEndRef.current) {
        targetEndRef.current = Date.now() + remainingMs;
      }

      const update = () => {
        if (!targetEndRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, targetEndRef.current - now);

        setRemainingMs(diff);

        if (diff <= 0) {
          setIsRunning(false);
          targetEndRef.current = null;
          playCompletionChime();
        }
      };

      update();
      interval = setInterval(update, 200);
    } else {
      targetEndRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Window visibilitychange re-sync
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isRunning && targetEndRef.current) {
        const diff = Math.max(0, targetEndRef.current - Date.now());
        setRemainingMs(diff);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning]);

  // Synthesized Web Audio chime on completion
  const playCompletionChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch (e) {}
  };

  // Handlers
  const handleStartPause = () => {
    if (remainingMs <= 0) return;
    if (!isRunning) {
      targetEndRef.current = Date.now() + remainingMs;
      setIsRunning(true);
    } else {
      setIsRunning(false);
      targetEndRef.current = null;
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    targetEndRef.current = null;
    setRemainingMs(totalMs);
  };

  const handleApplyCustomTime = () => {
    const newTotal = (inputH * 3600 + inputM * 60 + inputS) * 1000;
    if (newTotal > 0) {
      setTotalMs(newTotal);
      setRemainingMs(newTotal);
      setIsRunning(false);
      targetEndRef.current = null;
      setIsModalOpen(false);
    }
  };

  const handlePresetSelect = (minutes: number) => {
    const newTotal = minutes * 60 * 1000;
    setTotalMs(newTotal);
    setRemainingMs(newTotal);
    setIsRunning(false);
    targetEndRef.current = null;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Format strictly into Hours, Minutes, Seconds (HH : MM : SS)
  const totalSecs = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");

  // =============================================================
  // FULLSCREEN MODE VIEW (NUMBERS ONLY WITH HARRY POTTER FONT)
  // =============================================================
  if (isFullscreen) {
    return (
      <main
        className={`fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b ${theme.bg} text-white font-sans select-none overflow-hidden transition-colors duration-[4000ms] ease-in-out`}
      >
        {/* Exit Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-6 right-6 z-50 px-4 py-2 rounded-full border border-white/20 bg-black/60 text-xs font-mono tracking-widest text-amber-200 hover:border-amber-400/60 hover:bg-black/80 transition-all opacity-40 hover:opacity-100"
        >
          EXIT FULLSCREEN
        </button>

        {/* Ambient Backdrop Glow with 4-Second Slow Smooth Transition */}
        <div
          className="absolute w-[65vw] h-[65vw] rounded-full blur-[180px] pointer-events-none opacity-40 transition-all duration-[4000ms] ease-in-out"
          style={{ backgroundColor: theme.glow }}
        />

        {/* FULLSCREEN NUMBERS DISPLAY (HOURS : MINUTES : SECONDS IN HARRY POTTER FONT) */}
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-6">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span
              className="font-harry-potter-bold text-[18vw] sm:text-[22vw] leading-none tracking-normal transition-colors duration-[4000ms]"
              style={{
                color: theme.accent,
                textShadow: `0 0 35px ${theme.glow}, 0 0 70px ${theme.glow}`,
              }}
            >
              {hoursStr}
            </span>
            <span className="text-xs sm:text-sm font-mono tracking-[0.3em] text-gray-400 uppercase mt-2">
              HOURS
            </span>
          </div>

          <span
            className="font-harry-potter-bold text-[14vw] sm:text-[16vw] leading-none opacity-60 mb-6 transition-colors duration-[4000ms]"
            style={{ color: theme.accent }}
          >
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span
              className="font-harry-potter-bold text-[18vw] sm:text-[22vw] leading-none tracking-normal transition-colors duration-[4000ms]"
              style={{
                color: theme.accent,
                textShadow: `0 0 35px ${theme.glow}, 0 0 70px ${theme.glow}`,
              }}
            >
              {minutesStr}
            </span>
            <span className="text-xs sm:text-sm font-mono tracking-[0.3em] text-gray-400 uppercase mt-2">
              MINUTES
            </span>
          </div>

          <span
            className="font-harry-potter-bold text-[14vw] sm:text-[16vw] leading-none opacity-60 mb-6 transition-colors duration-[4000ms]"
            style={{ color: theme.accent }}
          >
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span
              className="font-harry-potter-bold text-[18vw] sm:text-[22vw] leading-none tracking-normal transition-colors duration-[4000ms]"
              style={{
                color: theme.accent,
                textShadow: `0 0 35px ${theme.glow}, 0 0 70px ${theme.glow}`,
              }}
            >
              {secondsStr}
            </span>
            <span className="text-xs sm:text-sm font-mono tracking-[0.3em] text-gray-400 uppercase mt-2">
              SECONDS
            </span>
          </div>
        </div>
      </main>
    );
  }

  // =============================================================
  // NORMAL SCREEN VIEW (SLOW AMBIENT GRADIENT & HARRY POTTER FONT)
  // =============================================================
  return (
    <main
      className={`min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b ${theme.bg} text-white font-sans overflow-hidden select-none transition-colors duration-[4000ms] ease-in-out relative`}
    >
      {/* Ambient Backdrop Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[170px] transition-all duration-[4000ms] ease-in-out"
          style={{ backgroundColor: theme.glow }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HEADER CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full max-w-5xl z-20 flex items-center justify-between py-2">
        <Link
          href="/"
          className="text-xs font-serif tracking-[0.2em] text-amber-200/80 hover:text-amber-200 transition-colors uppercase font-semibold"
        >
          INCEPTIA 2K26
        </Link>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="px-3.5 py-1.5 rounded-full border border-white/15 bg-black/40 text-[11px] font-mono tracking-wider text-amber-200 hover:border-amber-400/50 transition-all"
          >
            {soundEnabled ? "AUDIO ON" : "AUDIO MUTED"}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-black/40 text-[11px] font-mono tracking-wider text-amber-300 hover:bg-amber-500/20 transition-all"
          >
            FULLSCREEN
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* HEADING: TIMER */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full max-w-5xl">
        
        {/* Title Heading: TIMER */}
        <h1
          className="font-harry-potter text-4xl sm:text-6xl text-amber-200 tracking-[0.2em] uppercase font-bold mb-10 text-center transition-colors duration-[4000ms]"
          style={{ textShadow: `0 0 25px ${theme.glow}` }}
        >
          TIMER
        </h1>

        {/* DIGIT CARDS GRID (HOURS : MINUTES : SECONDS WITH HARRY POTTER FONT) */}
        <div className="grid grid-flow-col auto-cols-max gap-3 sm:gap-6 items-center justify-center">
          
          {/* Hours Card */}
          <div className="flex flex-col items-center">
            <div
              className={`w-28 h-32 sm:w-44 sm:h-52 rounded-2xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-[4000ms]`}
            >
              <span
                className="font-harry-potter-bold text-6xl sm:text-9xl font-bold tracking-normal transition-colors duration-[4000ms]"
                style={{ color: theme.accent, textShadow: `0 0 25px ${theme.glow}` }}
              >
                {hoursStr}
              </span>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono tracking-widest text-gray-400 uppercase mt-3">
              HOURS
            </span>
          </div>

          <span
            className="font-harry-potter-bold text-4xl sm:text-6xl font-bold mb-8 transition-colors duration-[4000ms]"
            style={{ color: theme.accent }}
          >
            :
          </span>

          {/* Minutes Card */}
          <div className="flex flex-col items-center">
            <div
              className={`w-28 h-32 sm:w-44 sm:h-52 rounded-2xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-[4000ms]`}
            >
              <span
                className="font-harry-potter-bold text-6xl sm:text-9xl font-bold tracking-normal transition-colors duration-[4000ms]"
                style={{ color: theme.accent, textShadow: `0 0 25px ${theme.glow}` }}
              >
                {minutesStr}
              </span>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono tracking-widest text-gray-400 uppercase mt-3">
              MINUTES
            </span>
          </div>

          <span
            className="font-harry-potter-bold text-4xl sm:text-6xl font-bold mb-8 transition-colors duration-[4000ms]"
            style={{ color: theme.accent }}
          >
            :
          </span>

          {/* Seconds Card (Clean transition without popping) */}
          <div className="flex flex-col items-center">
            <div
              className={`w-28 h-32 sm:w-44 sm:h-52 rounded-2xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-[4000ms]`}
            >
              <span
                className="font-harry-potter-bold text-6xl sm:text-9xl font-bold tracking-normal transition-colors duration-[4000ms]"
                style={{ color: theme.accent, textShadow: `0 0 25px ${theme.glow}` }}
              >
                {secondsStr}
              </span>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono tracking-widest text-gray-400 uppercase mt-3">
              SECONDS
            </span>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* TIMER ACTION CONTROLS */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-10 flex items-center justify-center gap-4 z-20">
          <button
            onClick={handleStartPause}
            className="magical-btn px-8 py-3.5 rounded-full font-serif font-bold text-xs sm:text-sm tracking-widest shadow-xl transition-all duration-[4000ms]"
            style={{ borderColor: theme.accent }}
          >
            {isRunning ? "PAUSE" : "START"}
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3.5 rounded-full border border-white/20 bg-black/40 text-amber-200 font-serif text-xs sm:text-sm tracking-wider hover:bg-white/10 transition-all"
          >
            RESET
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-full border border-white/20 bg-black/40 text-amber-200 font-serif text-xs sm:text-sm tracking-wider hover:bg-white/10 transition-all"
          >
            CUSTOMISE
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[15, 25, 45, 60].map((mVal) => (
            <button
              key={mVal}
              onClick={() => handlePresetSelect(mVal)}
              className="px-4 py-1.5 rounded-full border border-white/10 bg-black/40 text-gray-300 text-xs font-mono tracking-wider hover:border-amber-400 hover:text-amber-200 transition-all"
            >
              {mVal} MIN
            </button>
          ))}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* CUSTOMISATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-amber-500/40 bg-[#0e0a16] shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-harry-potter text-2xl text-amber-300">
                CUSTOMISE TIMER DURATION
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                CLOSE
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center">
                <label className="text-[10px] font-mono text-amber-300 uppercase mb-1">HOURS</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={inputH}
                  onChange={(e) => setInputH(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center p-3 rounded-xl border border-amber-500/30 bg-black/60 font-mono text-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col items-center">
                <label className="text-[10px] font-mono text-amber-300 uppercase mb-1">MINUTES</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputM}
                  onChange={(e) => setInputM(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center p-3 rounded-xl border border-amber-500/30 bg-black/60 font-mono text-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col items-center">
                <label className="text-[10px] font-mono text-amber-300 uppercase mb-1">SECONDS</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputS}
                  onChange={(e) => setInputS(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center p-3 rounded-xl border border-amber-500/30 bg-black/60 font-mono text-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleApplyCustomTime}
              className="magical-btn w-full py-3 rounded-xl text-xs font-bold tracking-widest"
            >
              APPLY SETTINGS
            </button>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="w-full max-w-5xl z-20 flex justify-between items-center py-2 text-[10px] font-mono text-gray-500 tracking-wider">
        <span>INCEPTIA 2026 TIMER</span>
        <span>BACKGROUND ACCURATE</span>
      </footer>
    </main>
  );
}
