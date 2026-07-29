"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// All assets that need to be preloaded before the page reveals
const PRELOAD_IMAGES = [
  "/hero-bg.webp",
  "/stick.webp",
  "/emblems/aiml.svg",
  "/emblems/web3.svg",
  "/emblems/healthcare.svg",
  "/emblems/education.svg",
  "/emblems/otherinnovation.svg",
  "/gallery/1.jpg",
  "/gallery/2.jpg",
];

interface Props {
  onComplete: () => void;
}

// Typed shape for spark positioning data
interface SparkStyle {
  left: string;
  top: string;
  animationDuration: number;
  animationDelay: number;
}

// Floating magical spark particle
function Spark({ style }: { style: SparkStyle }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 3,
        height: 3,
        background: "radial-gradient(circle, #ffd700, #ff8c00)",
        boxShadow: "0 0 6px 2px rgba(255,215,0,0.7)",
        left: style.left,
        top: style.top,
      }}
      animate={{
        y: [0, -60, -120],
        opacity: [0, 1, 0],
        scale: [0.5, 1.2, 0.3],
      }}
      transition={{
        duration: style.animationDuration,
        repeat: Infinity,
        delay: style.animationDelay,
        ease: "easeOut",
      }}
    />
  );
}

const SPARKS: SparkStyle[] = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 5.8 + Math.sin(i) * 4) % 100}%`,
  top: `${60 + Math.cos(i * 1.3) * 20}%`,
  animationDuration: 2 + (i % 5) * 0.4,
  animationDelay: (i * 0.18) % 2.4,
}));

export default function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Summoning the Great Hall…");
  const [done, setDone] = useState(false);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let settled = false;

    // Smoothly animate the displayed progress bar
    function animateTo(target: number, onReach?: () => void) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      function tick() {
        const current = progressRef.current;
        if (current >= target) {
          progressRef.current = target;
          setProgress(target);
          onReach?.();
          return;
        }
        const next = Math.min(target, current + Math.max(0.4, (target - current) * 0.04));
        progressRef.current = next;
        setProgress(Math.round(next));
        rafRef.current = requestAnimationFrame(tick);
      }
      tick();
    }

    // Phase labels
    function setPhase(p: number) {
      if (p < 30) setStatusText("Casting charms on assets…");
      else if (p < 60) setStatusText("Opening the Chamber of Secrets…");
      else if (p < 85) setStatusText("Consulting the Marauder's Map…");
      else if (p < 100) setStatusText("Almost there, young wizard…");
      else setStatusText("Welcome to Inceptia!");
    }

    // Preload a single image, resolves regardless of error
    function preloadImage(src: string): Promise<void> {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // don't block on missing assets
        img.src = src;
      });
    }

    async function load() {
      const total = PRELOAD_IMAGES.length + 1; // +1 for fonts
      let loaded = 0;

      // Reserve 0–10 for initial spin-up
      animateTo(10);
      setPhase(10);

      // Load images one by one, advancing the bar proportionally
      for (const src of PRELOAD_IMAGES) {
        await preloadImage(src);
        if (settled) return;
        loaded++;
        const target = 10 + Math.round((loaded / total) * 80); // 10 → 90
        setPhase(target);
        animateTo(target);
      }

      // Fonts
      try { await document.fonts.ready; } catch { /* ignore */ }
      if (settled) return;

      setPhase(95);
      animateTo(95);

      // Brief pause so user sees near-complete state
      await new Promise((r) => setTimeout(r, 300));
      if (settled) return;

      setPhase(100);
      animateTo(100, () => {
        // Wait for the bar to visually fill before fading out
        setTimeout(() => {
          setDone(true);
          // Give the exit animation time, then call onComplete
          setTimeout(onComplete, 700);
        }, 400);
      });
    }

    load();

    return () => {
      settled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loading-screen"
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0a0a0f" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
        >
          {/* Deep vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,4,0.85) 100%)",
            }}
          />

          {/* Ambient gold glow behind content */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 520,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(255,215,0,0.07) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Floating sparks */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {SPARKS.map((s, i) => (
              <Spark key={i} style={s} />
            ))}
          </div>

          {/* ── Main content ── */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-lg">

            {/* Spinning magic rings */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Outer ring */}
              <div
                className="absolute w-28 h-28 rounded-full animate-spin"
                style={{
                  border: "3px solid transparent",
                  borderTopColor: "rgba(255,215,0,0.9)",
                  borderBottomColor: "rgba(255,140,0,0.6)",
                  animationDuration: "2.4s",
                  boxShadow: "0 0 16px rgba(255,215,0,0.25)",
                }}
              />
              {/* Inner ring (counter-spin) */}
              <div
                className="absolute w-20 h-20 rounded-full animate-spin"
                style={{
                  border: "2px solid transparent",
                  borderLeftColor: "rgba(255,215,0,0.5)",
                  borderRightColor: "rgba(255,100,0,0.4)",
                  animationDuration: "1.8s",
                  animationDirection: "reverse",
                }}
              />
              {/* Center star */}
              <div
                className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, #1a1400 60%, #0a0a0f 100%)",
                  boxShadow: "0 0 28px rgba(255,215,0,0.5), inset 0 0 12px rgba(255,215,0,0.08)",
                }}
              >
                <motion.svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <path
                    d="M12 2l2.4 7.4L22 9.6l-6 4.8 2.3 7.6L12 17.2l-6.3 4.8 2.3-7.6-6-4.8 7.6-.2z"
                    fill="url(#star-grad)"
                  />
                  <defs>
                    <linearGradient id="star-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffd700" />
                      <stop offset="100%" stopColor="#ff8c00" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h1
                className="text-4xl font-bold tracking-wider"
                style={{
                  fontFamily: "HarryPotter, serif",
                  color: "#ffd700",
                  textShadow: "0 0 24px rgba(255,215,0,0.5), 0 0 60px rgba(255,140,0,0.2)",
                }}
              >
                Inceptia
              </h1>
              <p
                className="text-sm uppercase tracking-[0.25em]"
                style={{ color: "rgba(255,215,0,0.45)", fontFamily: "HarryPotter, serif" }}
              >
                2026
              </p>
            </div>

            {/* Progress bar container */}
            <div className="w-full space-y-3">
              {/* Bar track */}
              <div
                className="relative w-full h-[6px] rounded-full overflow-hidden"
                style={{
                  background: "rgba(255,215,0,0.08)",
                  boxShadow: "inset 0 0 8px rgba(0,0,0,0.6)",
                }}
              >
                {/* Filled portion */}
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #b8860b 0%, #ffd700 50%, #ffe680 100%)",
                    boxShadow: "0 0 12px rgba(255,215,0,0.7), 0 0 24px rgba(255,140,0,0.4)",
                  }}
                  transition={{ type: "spring", stiffness: 60, damping: 20 }}
                />
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute top-0 h-full w-20 rounded-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                    left: `${progress - 10}%`,
                  }}
                />
              </div>

              {/* Percentage + status */}
              <div className="flex items-center justify-between">
                <motion.p
                  key={statusText}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs tracking-widest"
                  style={{ color: "rgba(255,215,0,0.55)", fontFamily: "HarryPotter, serif" }}
                >
                  {statusText}
                </motion.p>
                <span
                  className="text-xs font-mono tabular-nums"
                  style={{ color: "rgba(255,215,0,0.7)" }}
                >
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,215,0,0.25) 30%, rgba(255,215,0,0.5) 50%, rgba(255,215,0,0.25) 70%, transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
