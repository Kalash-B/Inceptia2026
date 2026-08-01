"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import MagicalClouds from "../components/magicalClouds";

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = useState({
    mail: "",
    pass: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // Nonce issued by GET /api/login — proves request came from this page
  const [nonce, setNonce] = useState<string | null>(null);

  useEffect(() => {
    // Fetch a fresh nonce whenever the login page mounts
    fetch("/api/login")
      .then((r) => r.json())
      .then((d) => { if (d.nonce) setNonce(d.nonce) })
      .catch(() => { /* nonce unavailable — server will reject the POST */ })
  }, []);

  const onLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!user.mail || !user.pass) {
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
        body: JSON.stringify({ mail: user.mail, pass: user.pass, _nonce: nonce }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const sessionVal = JSON.stringify(data.participant);
        localStorage.setItem("hogwarts_user", sessionVal);
        document.cookie = `hogwarts_session=${encodeURIComponent(sessionVal)}; path=/; max-age=86400; SameSite=Lax`;
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

  return (
    <div className="min-h-screen w-full bg-[#0e0e0e] text-neutral-100 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-amber-400 selection:text-neutral-950">

      {/* Hogwarts Castle Background Image matching Hero page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/hero-bg.webp"
          alt="Hogwarts Castle"
          fill
          priority
          className="object-cover object-top opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-indigo-950/50 to-[#0e0e0e]" />
      </div>

      {/* Floating Lumos Golden Sparkles Canvas */}
      <MagicalClouds />

      {/* Top Navigation Bar */}
      <header className="absolute top-6 left-6 right-6 flex justify-between items-center z-20 max-w-5xl mx-auto">
        <Link
          id="back-to-home-link"
          href="/"
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-200/80 hover:text-amber-300 transition-colors drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]"
        >
          <span>&larr;</span> Back to Sanctuary
        </Link>
      </header>

      {/* Main Login Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10 my-auto"
      >
        {/* Hogwarts Glass Portal Card */}
        <div className="liquid-glass-card p-8 md:p-10 relative overflow-hidden flex flex-col items-center border border-amber-500/30 shadow-[0_0_50px_rgba(255,215,0,0.15)] bg-black/60 backdrop-blur-xl">

          {/* Title Heading */}
          <h1
            className="font-harry-potter text-5xl sm:text-6xl text-white text-center italic tracking-wider mb-8 select-none"
            style={{
              fontWeight: "bold",
              textShadow: "0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)"
            }}
          >
            LOGIN
          </h1>

          {/* Error Message banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full mb-6 p-3.5 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 text-xs text-center font-medium backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={onLogin} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-amber-300/90 font-mono font-medium ml-1 flex items-center gap-1.5">
                <span>✦</span> Magical E-Mail
              </label>
              <input
                id="login-email-input"
                type="email"
                value={user.mail}
                onChange={(e) => setUser({ ...user, mail: e.target.value })}
                placeholder="ahamsamartha@gmail.com"
                className="liquid-input text-sm focus:border-amber-400/80 focus:shadow-[0_0_15px_rgba(255,215,0,0.25)]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-amber-300/90 font-mono font-medium ml-1 flex items-center gap-1.5">
                <span>✦</span> Passphrase
              </label>
              <input
                id="login-password-input"
                type="password"
                value={user.pass}
                onChange={(e) => setUser({ ...user, pass: e.target.value })}
                placeholder="••••••••"
                className="liquid-input text-sm focus:border-amber-400/80 focus:shadow-[0_0_15px_rgba(255,215,0,0.25)]"
                required
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-4 px-6 rounded-full magical-btn flex items-center justify-center gap-2 cursor-pointer font-bold text-sm tracking-widest uppercase transition-all shadow-[0_4px_25px_rgba(255,215,0,0.3)] hover:shadow-[0_6px_35px_rgba(255,215,0,0.5)]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Unlocking Seals...</span>
                </div>
              ) : (
                <span>✦ Enter The Great Hall ✦</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}