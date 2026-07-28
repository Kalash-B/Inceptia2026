"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Participant {
  name: string;
  team: string;
  email: string;
  token: string;
  counter: number;
  avatar?: string;
}

const MEALS = [
  { digit: 1, name: "Lunch [Day 1]" },
  { digit: 2, name: "Dinner [Day 1]" },
  { digit: 3, name: "Lunch [Day 2]" },
];

const AVATAR_LIST = [
  "/profiles_char/harry.png",
  "/profiles_char/hermoine.png",
  "/profiles_char/ron.png",
  "/profiles_char/sirius.png",
  "/profiles_char/snape.png",
  "/profiles_char/voldemort.png",
];

const RED_CHARACTERS = ["harry", "hermoine", "hermione", "ron"];

function isRedThemeCharacter(avatarPath: string, name?: string): boolean {
  const avatarLower = (avatarPath || "").toLowerCase();
  const nameLower = (name || "").toLowerCase();
  return RED_CHARACTERS.some(
    (char) => avatarLower.includes(char) || nameLower.includes(char)
  );
}

function getParticipantAvatar(participant: Participant): string {
  if (participant.avatar && participant.avatar.trim().length > 0) {
    return participant.avatar;
  }
  let hash = 0;
  const str = (participant.email || participant.name || "default") + (participant.team || "");
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_LIST.length;
  return AVATAR_LIST[index];
}



export default function DashboardPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchLatestParticipant = async (email: string, token: string) => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/participant?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok && data.success && data.participant) {
        setParticipant(data.participant);
        localStorage.setItem("hogwarts_user", JSON.stringify(data.participant));
        generateQR(data.participant.token);
      } else {
        generateQR(token);
      }
    } catch (err) {
      console.error("Failed to refresh participant status", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedUserStr = localStorage.getItem("hogwarts_user");
    if (!cachedUserStr) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(cachedUserStr) as Participant;
      setParticipant(parsed);
      document.cookie = `hogwarts_session=${encodeURIComponent(cachedUserStr)}; path=/; max-age=86400; SameSite=Lax`;
      generateQR(parsed.token);
      fetchLatestParticipant(parsed.email, parsed.token);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  const generateQR = async (tokenStr: string) => {
    try {
      const url = await QRCode.toDataURL(tokenStr, {
        width: 220,
        margin: 1,
        color: {
          dark: "#ffd700",
          light: "#07080c",
        },
      });
      setQrUrl(url);
    } catch (err) {
      console.error("QR Generation error:", err);
    }
  };

  const handleCopyToken = () => {
    if (!participant?.token) return;
    navigator.clipboard.writeText(participant.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("hogwarts_user");
    document.cookie = "hogwarts_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "hogwarts_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    router.push("/login");
  };

  if (loading || !participant) {
    return (
      <div className="min-h-screen bg-[#07080c] text-neutral-100 font-sans flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatarSrc = getParticipantAvatar(participant);
  const isRed = isRedThemeCharacter(avatarSrc, participant.name);

  return (
    <div className={`h-screen w-full ${isRed ? "bg-[#2b0408]" : "bg-[#041a10]"} text-neutral-100 font-sans p-4 md:p-8 flex flex-col justify-between overflow-hidden relative selection:bg-amber-400 selection:text-neutral-950 transition-colors duration-700`}>
      <div className={`absolute inset-0 transition-colors duration-700 pointer-events-none ${isRed ? "bg-[#2b0408]" : "bg-[#041a10]"}`} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-45 mix-blend-overlay">
        <filter id="natural-paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="5" stitchTiles="stitch" result="pulp" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#natural-paper-grain)" />
      </svg>

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60 mix-blend-multiply">
        <filter id="black-charcoal-stipple">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="
            0 0 0 0 0
            0 0 0 0 0
            0 0 0 0 0
            0 0 0 10 -3.5" />
        </filter>
        <rect width="100%" height="100%" filter="url(#black-charcoal-stipple)" fill="#000000" />
      </svg>

      {/* Natural Handmade Paper Flecks Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-25 mix-blend-soft-light">
        <filter id="paper-fibres">
          <feTurbulence type="turbulence" baseFrequency="0.25 0.75" numOctaves="4" stitchTiles="stitch" result="fibres" />
          <feColorMatrix type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 5 -2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-fibres)" fill={isRed ? "#ff8899" : "#88ffcc"} />
      </svg>

      {/* Deep Black Paper Edge Frame (Shades of Black Vignette) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.60)_70%,rgba(0,0,0,0.92)_100%)] pointer-events-none z-0" />

      {/* 3 Ultra-Massive Screen-Covering Theme Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Massive Orb 1: Primary Full-Screen Theme Atmosphere */}
        <motion.div
          animate={{
            x: ["-20vw", "40vw", "-10vw", "50vw", "-20vw"],
            y: ["-20vh", "30vh", "50vh", "-5vh", "-20vh"],
            scale: [1, 1.25, 0.95, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute w-[100vw] h-[100vw] max-w-[1350px] max-h-[1350px] rounded-full blur-[160px] opacity-60 mix-blend-screen ${isRed
            ? "bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.85)_0%,rgba(185,28,28,0.5)_50%,rgba(127,29,29,0.2)_75%,transparent_100%)] shadow-[0_0_250px_rgba(239,68,68,0.6)]"
            : "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.85)_0%,rgba(5,150,105,0.5)_50%,rgba(4,120,87,0.2)_75%,transparent_100%)] shadow-[0_0_250px_rgba(16,185,129,0.6)]"
            }`}
        />

        {/* Massive Orb 2: Counter Full-Screen Deep Atmosphere */}
        <motion.div
          animate={{
            x: ["60vw", "-15vw", "45vw", "-25vw", "60vw"],
            y: ["45vh", "-10vh", "-20vh", "35vh", "45vh"],
            scale: [1.15, 0.9, 1.3, 0.95, 1.15],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className={`absolute w-[110vw] h-[110vw] max-w-[1450px] max-h-[1450px] rounded-full blur-[180px] opacity-55 mix-blend-screen ${isRed
            ? "bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.75)_0%,rgba(153,27,27,0.45)_50%,rgba(88,28,28,0.18)_75%,transparent_100%)] shadow-[0_0_220px_rgba(225,29,72,0.55)]"
            : "bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.75)_0%,rgba(13,148,136,0.45)_50%,rgba(15,118,110,0.18)_75%,transparent_100%)] shadow-[0_0_220px_rgba(20,184,166,0.55)]"
            }`}
        />

        {/* Massive Orb 3: Full-Screen Glow Wash */}
        <motion.div
          animate={{
            x: ["10vw", "65vw", "-20vw", "25vw", "10vw"],
            y: ["65vh", "-25vh", "20vh", "60vh", "65vh"],
            scale: [0.95, 1.35, 0.9, 1.15, 0.95],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className={`absolute w-[90vw] h-[90vw] max-w-[1250px] max-h-[1250px] rounded-full blur-[150px] opacity-55 mix-blend-screen ${isRed
            ? "bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.7)_0%,rgba(190,18,60,0.4)_50%,rgba(136,19,55,0.15)_75%,transparent_100%)] shadow-[0_0_200px_rgba(244,63,94,0.5)]"
            : "bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.7)_0%,rgba(6,78,59,0.4)_50%,rgba(2,44,34,0.15)_70%,transparent_100%)] shadow-[0_0_200px_rgba(52,211,153,0.5)]"
            }`}
        />
      </div>

      {/* Top Header Bar */}
      <header className="flex justify-between items-center z-20 shrink-0 max-w-6xl mx-auto w-full px-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isRed ? "bg-red-400 shadow-[0_0_10px_#ef4444]" : "bg-emerald-400 shadow-[0_0_10px_#10b981]"} animate-pulse`} />
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300/80">
            User Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLatestParticipant(participant.email, participant.token)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl border border-amber-500/20 bg-neutral-900/50 text-amber-200 text-xs font-mono hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Sync</span>
          </button>


          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-950/30 text-red-300 text-xs font-mono hover:bg-red-950/50 transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard divided strictly into 2 Sections */}
      <main className="my-auto z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

        {/* ========================================================
            SECTION 1 (LEFT SIDE): Profile Photo on Left, Info on Right
           ======================================================== */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-6 liquid-glass-card p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden"
        >
          {/* Circular Harry Potter Character Profile Photo Container (Left inside Section 1) */}
          <div className={`w-32 h-32 shrink-0 rounded-full border-2 ${isRed ? "border-red-500/90 shadow-[0_0_25px_rgba(239,68,68,0.35)]" : "border-emerald-500/90 shadow-[0_0_25px_rgba(16,185,129,0.35)]"} bg-[#07080c] flex items-center justify-center p-1 relative group my-auto transition-all duration-500`}>
            <img
              src={avatarSrc}
              alt={participant.name}
              className={`w-full h-full rounded-full object-cover object-center border ${isRed ? "border-red-400/40" : "border-emerald-400/40"} shadow-inner group-hover:scale-105 transition-transform duration-300`}
            />
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r ${isRed ? "from-red-600 to-rose-700" : "from-emerald-600 to-teal-700"} text-white font-mono font-extrabold text-[9px] uppercase px-3 py-0.5 rounded-full shadow z-10 whitespace-nowrap`}>
              LEAD
            </div>
          </div>

          {/* Info Details (Right inside Section 1) */}
          <div className="flex flex-col text-center sm:text-left gap-2 w-full">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400/70">
                Participant Profile
              </span>
              <h2 className="text-2xl font-bold font-serif gold-spell-text uppercase tracking-wider">
                {participant.name}
              </h2>
              <div className="text-xs font-mono font-semibold text-amber-300">
                Team: <span className="text-neutral-100">{participant.team}</span>
              </div>
            </div>

            <div className="border-t border-amber-500/15 pt-2.5 flex flex-col gap-1.5 text-xs font-mono">
              <div>
                <span className="text-neutral-400">Team Email:</span>{" "}
                <span className="text-neutral-200">{participant.email}</span>
              </div>

              <div>
                <span className="text-neutral-400">Team Members:</span>
                <div className="text-amber-200/90 font-medium text-[11px] mt-0.5 leading-relaxed">
                  • {participant.name} (Lead)<br />
                  • Hermione Granger<br />
                  • Ron Weasley
                </div>
              </div>

              <div>
                <span className="text-neutral-400">House Assignment:</span>{" "}
                <span className={isRed ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                  {isRed ? "Gryffindor Elite" : "Slytherin House"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================
            SECTION 2 (RIGHT SIDE): QR Code + Minimal Meal Table
           ======================================================== */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-6 liquid-glass-card p-6 md:p-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center"
        >

          {/* QR Code Pass */}
          <div className="sm:col-span-5 flex flex-col items-center text-center justify-center border-b sm:border-b-0 sm:border-r border-amber-500/15 sm:pr-6 pb-6 sm:pb-0">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300/80 mb-2">
              QR Pass
            </span>

            <div className="p-2.5 rounded-2xl border-2 border-amber-400/40 bg-[#07080c] shadow-[0_0_20px_rgba(255,215,0,0.15)] mb-2">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Code" className="w-36 h-36 rounded-lg" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-amber-300 text-xs">
                  Loading QR...
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-neutral-900/80 border border-amber-500/20 text-xs font-mono">
              <span className="text-amber-300 font-bold truncate">{participant.token}</span>
              <button
                onClick={handleCopyToken}
                className="text-[10px] uppercase font-bold text-amber-400 hover:text-amber-200 ml-1.5 cursor-pointer"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Minimal Meal Table */}
          <div className="sm:col-span-7 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-amber-500/15 pb-2">
              <h3 className="text-sm font-serif font-bold gold-spell-text">
                Food Receivables
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                {Math.min(participant.counter, 3)}/3 Claimed
              </span>
            </div>

            {/* Minimal Meal Rows with Status Dots */}
            <div className="flex flex-col gap-2">
              {MEALS.map((meal) => {
                const isClaimed = participant.counter >= meal.digit;

                return (
                  <div
                    key={meal.digit}
                    className="flex justify-between items-center px-3.5 py-2.5 rounded-xl bg-neutral-900/60 border border-amber-500/15"
                  >
                    <span className="text-xs font-medium text-neutral-200">
                      {meal.name}
                    </span>

                    {/* Status Circle Dot: Green if claimed, Gray if unclaimed */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">
                        {isClaimed ? "Claimed" : "Pending"}
                      </span>
                      <span
                        className={`w-3 h-3 rounded-full transition-all ${isClaimed
                          ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                          : "bg-neutral-600"
                          }`}
                        title={isClaimed ? "Claimed" : "Unclaimed"}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </motion.div>

      </main>



    </div>
  );
}