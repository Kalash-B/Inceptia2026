"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = useState({
    email: "",
    pass: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!user.email || !user.pass) {
      setErrorMsg("Please enter both email and password passphrase.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, pass: user.pass }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save participant data to client storage for dashboard access
        localStorage.setItem("hogwarts_user", JSON.stringify(data.participant));
        router.push("/dashboard");
      } else {
        setErrorMsg(data.error || "Authentication failed. Verify your passphrase.");
      }
    } catch (error: any) {
      console.error("Error logging in", error);
      setErrorMsg("Connection error to Great Hall servers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (email: string, pass: string) => {
    setUser({ email, pass });
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-neutral-100 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glow & atmospheric glass particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation link to Home & Admin */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-200/70 hover:text-amber-300 transition-colors">
          <span>&larr;</span> Back to Sanctuary
        </Link>
        <Link href="/admin" className="text-xs font-mono uppercase tracking-widest text-amber-400/80 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-neutral-900/40 backdrop-blur-md transition-all">
          Admin Portal &rarr;
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Hogwarts Seal Card */}
        <div className="liquid-glass-card p-8 md:p-10 relative overflow-hidden flex flex-col items-center">
          
          {/* Magical Header Emblem */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-400/20 to-amber-900/40 border border-amber-400/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,215,0,0.15)]">
            <svg className="w-8 h-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold tracking-wider font-serif gold-spell-text text-center mb-1">
            GREAT HALL ACCESS
          </h1>
          <p className="text-neutral-400 text-xs tracking-widest uppercase mb-8 text-center">
            Identify Yourself to the Marauder Registry
          </p>

          {/* Error Message banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full mb-6 p-3.5 rounded-xl border border-red-500/30 bg-red-950/30 text-red-300 text-xs text-center font-medium backdrop-blur-md"
            >
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={onLogin} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-amber-200/80 font-medium ml-1">
                Magical E-Mail
              </label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="kazbrekker898@gmail.com"
                className="liquid-input text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-amber-200/80 font-medium ml-1">
                Passphrase
              </label>
              <input
                type="password"
                value={user.pass}
                onChange={(e) => setUser({ ...user, pass: e.target.value })}
                placeholder="••••••••"
                className="liquid-input text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 px-6 rounded-xl magical-btn flex items-center justify-center gap-2 cursor-pointer font-bold text-sm tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(255,215,0,0.25)] hover:shadow-[0_6px_30px_rgba(255,215,0,0.4)]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Unlocking Seals...</span>
                </div>
              ) : (
                <span>Enter The Great Hall</span>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill options */}
          <div className="w-full mt-8 pt-6 border-t border-amber-500/10 flex flex-col gap-2">
            <span className="text-[10px] text-neutral-400 tracking-widest uppercase text-center font-mono">
              Quick Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleDemoFill("kazbrekker898@gmail.com", "trial")}
                className="py-2 px-3 rounded-lg border border-amber-500/15 bg-neutral-900/50 text-[11px] text-amber-200/80 hover:border-amber-400/40 hover:text-amber-200 transition-all text-left truncate"
              >
                <div className="font-semibold">Samarth Kapse</div>
                <div className="text-[9px] text-neutral-500">Kremlin Spies</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("harry@hogwarts.edu", "potterhead")}
                className="py-2 px-3 rounded-lg border border-amber-500/15 bg-neutral-900/50 text-[11px] text-amber-200/80 hover:border-amber-400/40 hover:text-amber-200 transition-all text-left truncate"
              >
                <div className="font-semibold">Harry Potter</div>
                <div className="text-[9px] text-neutral-500">Gryffindor</div>
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}