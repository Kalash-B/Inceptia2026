"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import MagicalClouds from "../components/magicalClouds";

interface Participant {
  name: string;
  teamName: string;
  mail: string;
  token: string;
  position: 'Lead' | 'Member';
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
  const str = (participant.mail || participant.name || "default") + (participant.teamName || "");
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

  const fetchLatestParticipant = async (mail: string, token: string) => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/participant?mail=${encodeURIComponent(mail)}`);
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
      fetchLatestParticipant(parsed.mail, parsed.token);
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
    <div className="h-screen w-full bg-[#0e0e0e] text-neutral-100 font-sans p-4 md:p-8 flex flex-col justify-between overflow-hidden relative selection:bg-amber-400 selection:text-neutral-950 transition-colors duration-700">
      {/* Hogwarts Castle Background Image matching Hero page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/hero-bg.webp"
          alt="Hogwarts Castle"
          fill
          priority
          className="object-cover object-top opacity-50"
        />
        <div className={`absolute inset-0 transition-colors duration-700 ${isRed ? "bg-gradient-to-b from-red-950/40 via-black/75 to-[#0e0e0e]" : "bg-gradient-to-b from-emerald-950/40 via-black/75 to-[#0e0e0e]"}`} />
      </div>

      {/* Floating Lumos Golden Sparkles Canvas */}
      <MagicalClouds />

      {/* Deep Black Edge Frame (Vignette) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.60)_70%,rgba(0,0,0,0.92)_100%)] pointer-events-none z-0" />

      {/* Minimal Domain-Style Ambient Theme Tint Layer (No Moving Orbs) */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-all duration-700 ${isRed
          ? "bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.18)_0%,rgba(185,28,28,0.06)_50%,transparent_75%)]"
          : "bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.18)_0%,rgba(5,150,105,0.06)_50%,transparent_75%)]"
        }`} />

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
            id="dashboard-sync-btn"
            onClick={() => fetchLatestParticipant(participant.mail, participant.token)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl border border-amber-500/20 bg-neutral-900/50 text-amber-200 text-xs font-mono hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Sync</span>
          </button>


          <button
            id="dashboard-logout-btn"
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
              {participant.position}
            </div>
          </div>

          {/* Info Details (Right inside Section 1) */}
          <div className="flex flex-col text-center sm:text-left gap-2 w-full">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400/70">
                Participant Profile
              </span>
              <h1 className="text-2xl font-bold font-serif gold-spell-text uppercase tracking-wider">
                {participant.name}
              </h1>
              <div className="text-xs font-mono font-semibold text-amber-300">
                Team: <span className="text-neutral-100">{participant.teamName}</span>
              </div>
            </div>

            <div className="border-t border-amber-500/15 pt-2.5 flex flex-col gap-1.5 text-xs font-mono">
              <div>
                <span className="text-neutral-400">Team Email:</span>{" "}
                <span className="text-neutral-200">{participant.mail}</span>
              </div>

              <div>
                <span className="text-neutral-400">Position:</span>{" "}
                <span className={`font-semibold ${
                  participant.position === 'Lead'
                    ? 'text-amber-300'
                    : 'text-neutral-200'
                }`}>
                  {participant.position}
                </span>
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
                id="dashboard-copy-token-btn"
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