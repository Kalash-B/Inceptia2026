"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();

  const [creds, setCreds] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nonce, setNonce] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, skip login
    fetch("/api/admin-login/check", { credentials: "include" })
      .then((res) => { if (res.ok) router.replace("/admin") })
      .catch(() => { });

    // Fetch a fresh nonce
    fetch("/api/admin-login")
      .then((r) => r.json())
      .then((d) => { if (d.nonce) setNonce(d.nonce) })
      .catch(() => { });
  }, []);

  const onLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!creds.username || !creds.password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: creds.username,
          password: creds.password,
          _nonce: nonce,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin");
      } else {
        setErrorMsg(data.error || "Authentication failed. Check credentials.");
        // Refresh nonce after a failed attempt
        fetch("/api/admin-login")
          .then((r) => r.json())
          .then((d) => { if (d.nonce) setNonce(d.nonce) })
          .catch(() => { });
      }
    } catch (error: any) {
      console.error("Admin login error", error);
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07080c] text-neutral-100 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/hero-bg.webp"
          alt="Hogwarts"
          fill
          priority
          className="object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-amber-950/20 to-[#07080c]" />
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.08),transparent_65%)] pointer-events-none z-0" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-700/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm z-10"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-amber-500/25 rounded-2xl p-8 shadow-[0_0_60px_rgba(255,215,0,0.08)] flex flex-col items-center gap-6">

          {/* Icon / Badge */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.15)]">
              {/* Shield icon */}
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest font-mono text-amber-400/70">
                Restricted Access
              </p>
              <h1 className="text-2xl font-bold font-serif text-white tracking-wide mt-0.5"
                style={{ textShadow: "0 0 20px rgba(255,215,0,0.4)" }}
              >
                Admin Portal
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                Overseer credentials required
              </p>
            </div>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full p-3 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 text-xs text-center font-medium"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={onLogin} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-amber-400/80 ml-0.5">
                Username
              </label>
              <input
                id="admin-username-input"
                type="text"
                value={creds.username}
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                placeholder="SammyK."
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900/80 border border-neutral-700 text-neutral-100 text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/60 focus:shadow-[0_0_12px_rgba(255,215,0,0.15)] transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-amber-400/80 ml-0.5">
                Password
              </label>
              <input
                id="admin-password-input"
                type="password"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900/80 border border-neutral-700 text-neutral-100 text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/60 focus:shadow-[0_0_12px_rgba(255,215,0,0.15)] transition-all"
                required
              />
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-neutral-950 font-bold text-sm tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(255,215,0,0.25)] hover:shadow-[0_6px_28px_rgba(255,215,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Enter Overseer Station"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-[10px] text-neutral-600 font-mono text-center">
            This portal is restricted to authorised personnel only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
