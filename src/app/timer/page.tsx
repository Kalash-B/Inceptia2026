"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const TOTAL_24_HOURS_MS = 24 * 60 * 60 * 1000;
const STORAGE_END_KEY = "inceptia_24h_timer_end_time";

export default function InceptiaTimer() {
  const [isClient, setIsClient] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Admin login credentials state
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nonce, setNonce] = useState<string | null>(null);

  // Time state (milliseconds)
  const [remainingMs, setRemainingMs] = useState(TOTAL_24_HOURS_MS);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Server synchronization refs
  const targetEndMsRef = useRef<number | null>(null);
  const clockOffsetRef = useRef<number>(0);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check admin session authentication on mount
  useEffect(() => {
    fetch("/api/admin-login/check", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
          // Fetch fresh nonce for login
          fetch("/api/admin-login")
            .then((r) => r.json())
            .then((d) => {
              if (d.nonce) setNonce(d.nonce);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        setIsAdminAuthenticated(false);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // -------------------------------------------------------------
  // FETCH SERVER-SYNCHRONIZED TIMER STATE FROM /api/timer
  // -------------------------------------------------------------
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch("/api/timer");
      if (!res.ok) return;
      const data = await res.json();

      if (data.success) {
        const serverTime = data.serverTime || Date.now();
        const clientNow = Date.now();
        const offset = serverTime - clientNow;
        clockOffsetRef.current = offset;

        if (data.isRunning && data.endTime) {
          const endMs = new Date(data.endTime).getTime();
          const syncedClientNow = clientNow + offset;
          const remaining = Math.max(0, endMs - syncedClientNow);

          targetEndMsRef.current = endMs;
          setRemainingMs(remaining);
          setIsRunning(true);
          setHasStarted(true);

          localStorage.setItem(STORAGE_END_KEY, endMs.toString());
        } else if (data.endTime && !data.isRunning && data.remainingMs === 0) {
          targetEndMsRef.current = null;
          setRemainingMs(0);
          setIsRunning(false);
          setHasStarted(true);
        } else {
          const savedEndTime = localStorage.getItem(STORAGE_END_KEY);
          if (savedEndTime) {
            const endMs = parseInt(savedEndTime, 10);
            const syncedClientNow = clientNow + offset;
            const remaining = Math.max(0, endMs - syncedClientNow);
            if (remaining > 0) {
              targetEndMsRef.current = endMs;
              setRemainingMs(remaining);
              setIsRunning(true);
              setHasStarted(true);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not sync with server timer API, using local clock fallback.", err);
    }
  }, []);

  // Sync with server periodically when authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    syncWithServer();
    const syncInterval = setInterval(syncWithServer, 10000);
    return () => clearInterval(syncInterval);
  }, [isAdminAuthenticated, syncWithServer]);

  // -------------------------------------------------------------
  // CONTINUOUS TICK LOOP (IN SYNC WITH SERVER CLOCK)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isRunning || !isAdminAuthenticated) return;

    const tick = () => {
      if (!targetEndMsRef.current) return;
      const syncedNow = Date.now() + clockOffsetRef.current;
      const remaining = Math.max(0, targetEndMsRef.current - syncedNow);

      setRemainingMs(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        targetEndMsRef.current = null;
      }
    };

    tick();
    const interval = setInterval(tick, 100);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
        syncWithServer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isRunning, isAdminAuthenticated, syncWithServer]);

  // -------------------------------------------------------------
  // ADMIN LOGIN SUBMISSION
  // -------------------------------------------------------------
  const onAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!creds.username || !creds.password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    try {
      setLoginLoading(true);
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
        setIsAdminAuthenticated(true);
      } else {
        setErrorMsg(data.error || "Authentication failed. Check credentials.");
        fetch("/api/admin-login")
          .then((r) => r.json())
          .then((d) => {
            if (d.nonce) setNonce(d.nonce);
          })
          .catch(() => {});
      }
    } catch (error: any) {
      console.error("Admin login error", error);
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // -------------------------------------------------------------
  // START & RESET HANDLERS
  // -------------------------------------------------------------
  const handleStart = async () => {
    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", durationMs: TOTAL_24_HOURS_MS }),
      });
      const data = await res.json();
      if (data.success && data.endTime) {
        const endMs = new Date(data.endTime).getTime();
        targetEndMsRef.current = endMs;
        const now = Date.now();
        clockOffsetRef.current = (data.serverTime || now) - now;
        setRemainingMs(TOTAL_24_HOURS_MS);
        setIsRunning(true);
        setHasStarted(true);
        localStorage.setItem(STORAGE_END_KEY, endMs.toString());
      } else {
        const endMs = Date.now() + TOTAL_24_HOURS_MS;
        targetEndMsRef.current = endMs;
        setRemainingMs(TOTAL_24_HOURS_MS);
        setIsRunning(true);
        setHasStarted(true);
        localStorage.setItem(STORAGE_END_KEY, endMs.toString());
      }
    } catch {
      const endMs = Date.now() + TOTAL_24_HOURS_MS;
      targetEndMsRef.current = endMs;
      setRemainingMs(TOTAL_24_HOURS_MS);
      setIsRunning(true);
      setHasStarted(true);
      localStorage.setItem(STORAGE_END_KEY, endMs.toString());
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset the global timer?")) {
      try {
        await fetch("/api/timer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset" }),
        });
      } catch {}
      localStorage.removeItem(STORAGE_END_KEY);
      targetEndMsRef.current = null;
      setIsRunning(false);
      setHasStarted(false);
      setRemainingMs(TOTAL_24_HOURS_MS);
    }
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
  const totalSecs = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");

  if (!isClient || isCheckingAuth) {
    return (
      <main className="min-h-screen w-full bg-black text-white flex items-center justify-center font-display-lg">
        <div className="text-amber-400 font-label-md text-sm tracking-widest animate-pulse">
          VERIFYING ACCESS...
        </div>
      </main>
    );
  }

  // =============================================================
  // ADMIN LOGIN VIEW (IF NOT AUTHENTICATED)
  // =============================================================
  if (!isAdminAuthenticated) {
    return (
      <main
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-white relative bg-cover bg-center bg-no-repeat overflow-hidden select-none"
        style={{ backgroundImage: "url('/timer-bg.png')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90 pointer-events-none z-0" />

        {/* Login Card */}
        <div className="w-full max-w-sm z-10">
          <div className="bg-black/70 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(255,215,0,0.12)] flex flex-col items-center gap-6">
            
            {/* Header / Shield Icon */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest font-label-md text-amber-400/80">
                  Restricted Access
                </p>
                <h1 className="text-2xl font-bold font-display-lg text-white tracking-wide mt-1">
                  TIMER PORTAL
                </h1>
                <p className="text-xs text-neutral-400 font-label-md mt-1">
                  Overseer credentials required
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="w-full p-3 rounded-xl border border-red-500/40 bg-red-950/60 text-red-300 text-xs text-center font-label-md">
                {errorMsg}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={onAdminLogin} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-label-md text-amber-400/90 ml-0.5">
                  Username
                </label>
                <input
                  type="text"
                  value={creds.username}
                  onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                  placeholder="SammyK."
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-700 text-neutral-100 text-sm font-label-md placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-label-md text-amber-400/90 ml-0.5">
                  Password
                </label>
                <input
                  type="password"
                  value={creds.password}
                  onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-700 text-neutral-100 text-sm font-label-md placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="magical-btn mt-2 w-full py-3.5 rounded-full text-black font-display-lg text-xs tracking-widest uppercase disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loginLoading ? "VERIFYING..." : "ENTER TIMER STATION"}
              </button>
            </form>

            <p className="text-[10px] text-neutral-500 font-label-md text-center">
              Authorised personnel only
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =============================================================
  // AUTHENTICATED TIMER VIEW (ULTRA-MINIMALIST & SERVER-SYNCED)
  // =============================================================
  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 text-white select-none relative bg-cover bg-center bg-no-repeat overflow-hidden cursor-default"
      style={{ backgroundImage: "url('/timer-bg.png')" }}
    >
      {/* High-Contrast Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/90 pointer-events-none z-0" />

      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-6 right-6 z-30 opacity-30 hover:opacity-100 transition-opacity p-2 text-amber-300 hover:text-white"
        title="Toggle Fullscreen"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              isFullscreen
                ? "M9 9L4 4m0 0l5 0M4 4l0 5m11 5l5 5m0 0l-5 0m5 0l0-5M9 15l-5 5m0 0l5 0m-5 0l0-5m15-11l-5 5m5-5l-5 0m5 0l0 5"
                : "M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            }
          />
        </svg>
      </button>

      {/* CENTERED COUNTDOWN WRAPPER */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl text-center">
        
        {/* COUNTDOWN HEADING (FONT FROM HERO SECTION) */}
        <h1 className="font-display-lg text-4xl sm:text-7xl tracking-[0.2em] uppercase text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] mb-8 sm:mb-12">
          COUNTDOWN
        </h1>

        {/* DIGIT CARDS GRID (HOURS : MINUTES : SECONDS) */}
        <div className="grid grid-flow-col auto-cols-max gap-3 sm:gap-8 items-center justify-center my-2">
          
          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-36 sm:w-60 sm:h-72 rounded-3xl border-2 border-white/20 bg-black/70 backdrop-blur-2xl flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
              <span className="font-display-lg text-6xl sm:text-[10rem] text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
                {hoursStr}
              </span>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/15" />
            </div>
            <span className="text-[11px] sm:text-sm font-label-md font-bold tracking-[0.4em] text-amber-400 uppercase mt-4">
              HOURS
            </span>
          </div>

          <span className="font-display-lg text-4xl sm:text-7xl mb-8 text-amber-400/80">
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-36 sm:w-60 sm:h-72 rounded-3xl border-2 border-white/20 bg-black/70 backdrop-blur-2xl flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
              <span className="font-display-lg text-6xl sm:text-[10rem] text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
                {minutesStr}
              </span>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/15" />
            </div>
            <span className="text-[11px] sm:text-sm font-label-md font-bold tracking-[0.4em] text-amber-400 uppercase mt-4">
              MINUTES
            </span>
          </div>

          <span className="font-display-lg text-4xl sm:text-7xl mb-8 text-amber-400/80">
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-36 sm:w-60 sm:h-72 rounded-3xl border-2 border-white/20 bg-black/70 backdrop-blur-2xl flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
              <span className="font-display-lg text-6xl sm:text-[10rem] text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
                {secondsStr}
              </span>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/15" />
            </div>
            <span className="text-[11px] sm:text-sm font-label-md font-bold tracking-[0.4em] text-amber-400 uppercase mt-4">
              SECONDS
            </span>
          </div>

        </div>

        {/* START BUTTON (Displayed if not started on server yet) */}
        {!hasStarted && (
          <button
            onClick={handleStart}
            className="magical-btn mt-10 px-10 py-4 rounded-full text-black font-display-lg text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            START COUNTDOWN
          </button>
        )}

        {/* Discreet Reset option on hover at bottom */}
        {hasStarted && (
          <button
            onClick={handleReset}
            className="mt-12 text-[10px] font-label-md text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest opacity-30 hover:opacity-100"
          >
            Reset Timer
          </button>
        )}

      </div>
    </main>
  );
}
