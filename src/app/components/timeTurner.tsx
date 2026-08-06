"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TimeTurnerProps {
  onSpellCast?: (spellName: string) => void;
  isSpinning?: boolean;
}

export default function TimeTurner({ onSpellCast, isSpinning = true }: TimeTurnerProps) {
  const [speed, setSpeed] = useState<number>(1);
  const [reverse, setReverse] = useState<boolean>(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Add spark effect when clicked
  const handleRingClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newSparkle = { id: Date.now(), x, y };
    setSparkles((prev) => [...prev.slice(-10), newSparkle]);

    if (onSpellCast) {
      onSpellCast("REVERTO!");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-6 group select-none">
      {/* Outer Glow Halo */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/10 blur-3xl animate-pulse pointer-events-none" />
      
      {/* Magical Rune Circle Background */}
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-amber-500/20 flex items-center justify-center pointer-events-none opacity-40">
        <svg className="w-full h-full animate-spin-slow text-amber-400/40" viewBox="0 0 100 100">
          <path
            id="runePath"
            d="M 50, 50 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
            fill="none"
          />
          <text className="text-[5.5px] fill-amber-300 font-serif tracking-[3px]">
            <textPath href="#runePath">
              ✦ TEMPUS FUGIT ✦ LUMOS MAXIMA ✦ ALOHOMORA ✦ EXPECTO PATRONUM ✦ ACCIO TIME ✦
            </textPath>
          </text>
        </svg>
      </div>

      {/* 3D Time-Turner Frame Container */}
      <div 
        onClick={handleRingClick}
        className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center perspective-1000 cursor-pointer"
      >
        {/* Click Sparkles Overlay */}
        {sparkles.map((sp) => (
          <motion.span
            key={sp.id}
            initial={{ scale: 0.2, opacity: 1, y: 0 }}
            animate={{ scale: 2, opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
            style={{ left: sp.x, top: sp.y }}
            className="absolute z-50 text-amber-300 text-sm pointer-events-none font-serif"
          >
            ✨
          </motion.span>
        ))}

        {/* Outer Gold Ring (Spins on Y Axis) */}
        <motion.div
          animate={{
            rotateY: isSpinning ? (reverse ? -360 : 360) : 0,
            rotateZ: [0, 5, -5, 0],
          }}
          transition={{
            rotateY: { duration: 12 / speed, repeat: Infinity, ease: "linear" },
            rotateZ: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border-4 border-amber-400/80 shadow-[0_0_25px_rgba(255,215,0,0.5),inset_0_0_15px_rgba(255,215,0,0.3)] flex items-center justify-center preserve-3d"
        >
          {/* Outer Ring Gold Knobs */}
          <div className="absolute top-0 w-3 h-3 bg-amber-300 rounded-full border border-amber-600 shadow-[0_0_8px_#ffd700]" />
          <div className="absolute bottom-0 w-3 h-3 bg-amber-300 rounded-full border border-amber-600 shadow-[0_0_8px_#ffd700]" />
          <div className="absolute left-0 w-3 h-3 bg-amber-300 rounded-full border border-amber-600 shadow-[0_0_8px_#ffd700]" />
          <div className="absolute right-0 w-3 h-3 bg-amber-300 rounded-full border border-amber-600 shadow-[0_0_8px_#ffd700]" />

          {/* Middle Gold Ring (Spins on X Axis) */}
          <motion.div
            animate={{
              rotateX: isSpinning ? (reverse ? 360 : -360) : 0,
            }}
            transition={{
              rotateX: { duration: 8 / speed, repeat: Infinity, ease: "linear" },
            }}
            className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border-4 border-yellow-300/90 shadow-[0_0_20px_rgba(255,225,100,0.6)] flex items-center justify-center preserve-3d"
          >
            {/* Inscribed Magical Inscription */}
            <div className="absolute inset-2 rounded-full border border-dashed border-amber-300/40 pointer-events-none" />

            {/* Inner Ring (Spins on Z Axis) */}
            <motion.div
              animate={{
                rotateZ: isSpinning ? (reverse ? -360 : 360) : 0,
              }}
              transition={{
                rotateZ: { duration: 5 / speed, repeat: Infinity, ease: "linear" },
              }}
              className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-amber-200 shadow-[0_0_15px_rgba(255,255,255,0.7)] flex items-center justify-center preserve-3d bg-amber-950/20 backdrop-blur-[2px]"
            >
              {/* Hourglass Glass Core */}
              <div className="relative w-16 h-28 sm:w-20 sm:h-36 flex flex-col items-center justify-between pointer-events-none">
                {/* Top Glass Bulb */}
                <div className="relative w-14 h-12 sm:w-16 sm:h-14 rounded-t-full border-2 border-amber-300/80 bg-gradient-to-b from-amber-200/30 via-yellow-400/20 to-transparent overflow-hidden shadow-[inset_0_2px_10px_rgba(255,255,255,0.5)]">
                  {/* Top Sand Level */}
                  <motion.div
                    animate={{ height: ["80%", "20%", "80%"] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full bg-gradient-to-b from-amber-300 to-amber-500 rounded-t-full opacity-90 shadow-[0_0_10px_#ffd700]"
                  />
                </div>

                {/* Hourglass Waist / Neck */}
                <div className="w-2 h-3 bg-amber-300/90 shadow-[0_0_12px_#ffd700] z-20 my-[-2px] relative flex items-center justify-center">
                  {/* Sand Stream Trickling Down */}
                  {isSpinning && (
                    <motion.div
                      animate={{ y: [0, 20], opacity: [1, 0] }}
                      transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
                      className="w-1 h-3 bg-amber-200 shadow-[0_0_6px_#ffffff]"
                    />
                  )}
                </div>

                {/* Bottom Glass Bulb */}
                <div className="relative w-14 h-12 sm:w-16 sm:h-14 rounded-b-full border-2 border-amber-300/80 bg-gradient-to-t from-amber-200/30 via-yellow-400/20 to-transparent overflow-hidden shadow-[inset_0_-2px_10px_rgba(255,255,255,0.5)] flex items-end">
                  {/* Bottom Sand Accumulation */}
                  <motion.div
                    animate={{ height: ["20%", "80%", "20%"] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full bg-gradient-to-t from-amber-400 to-amber-300 rounded-b-full opacity-90 shadow-[0_0_10px_#ffd700]"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Time-Turner Control Spells Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 z-20">
        <button
          onClick={() => {
            setReverse(!reverse);
            if (onSpellCast) onSpellCast(reverse ? "CHRONO FORWARD" : "TIMELINE REVERSE");
          }}
          className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-black/60 text-amber-300 text-xs font-serif hover:bg-amber-500/20 hover:border-amber-400 transition-all flex items-center gap-1.5 shadow-md"
        >
          <span>🔄</span>
          <span>{reverse ? "FORWARD" : "REVERSE TIME"}</span>
        </button>

        <button
          onClick={() => {
            const nextSpeed = speed === 1 ? 2 : speed === 2 ? 0.5 : 1;
            setSpeed(nextSpeed);
            if (onSpellCast) onSpellCast(`TIME SPEED ${nextSpeed}X`);
          }}
          className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-black/60 text-amber-300 text-xs font-serif hover:bg-amber-500/20 hover:border-amber-400 transition-all flex items-center gap-1.5 shadow-md"
        >
          <span>⚡</span>
          <span>SPEED ({speed}x)</span>
        </button>

        <button
          onClick={() => {
            if (onSpellCast) onSpellCast("TEMPUS INVOCATION!");
          }}
          className="px-3.5 py-1.5 rounded-lg border border-amber-400/80 bg-gradient-to-r from-amber-600/50 to-yellow-600/50 text-white font-bold text-xs font-serif hover:scale-105 transition-all shadow-[0_0_12px_rgba(255,215,0,0.4)]"
        >
          ✨ CAST SPELL ✨
        </button>
      </div>
    </div>
  );
}
