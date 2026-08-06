"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ParticipantInfo {
  name: string;
  teamName: string;
  domain: string;
  mail: string;
  token: string;
  position: "Lead" | "Member";
  counter: number;
  avatar: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already_checked_in" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [scanning, setScanning] = useState<boolean>(true);
  const [manualToken, setManualToken] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Roster state
  const [roster, setRoster] = useState<ParticipantInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCheckin, setFilterCheckin] = useState<string>("all");
  const [loadingRoster, setLoadingRoster] = useState<boolean>(false);

  const REGISTER_KEY = process.env.NEXT_PUBLIC_REGISTER_KEY || "";

  useEffect(() => {
    fetch("/api/register-login/check", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          router.replace("/register/login");
        } else {
          setIsAuthorized(true);
          setIsMounted(true);
          fetchRoster();
        }
      })
      .catch(() => router.replace("/register/login"));
  }, []);

  const fetchRoster = async () => {
    try {
      setLoadingRoster(true);
      const res = await fetch("/api/checkin", {
        headers: { "X-Register-Key": REGISTER_KEY },
      });
      const data = await res.json();
      if (res.ok && data.participants) {
        setRoster(data.participants);
      }
    } catch (e) {
      console.error("Failed to fetch participant roster", e);
    } finally {
      setLoadingRoster(false);
    }
  };

  const processCheckinToken = async (scannedToken: string) => {
    if (!scannedToken.trim()) return;

    setScanning(false);
    setStatus("loading");
    setMessage("Looking up participant...");

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Register-Key": REGISTER_KEY,
        },
        credentials: "include",
        body: JSON.stringify({ token: scannedToken.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "Participant checked in successfully!");
        setParticipant(data.participant);
        fetchRoster();
      } else if (data.status === "already_checked_in") {
        setStatus("already_checked_in");
        setMessage(data.message || "Participant is already checked in.");
        setParticipant(data.participant);
      } else {
        setStatus("error");
        setMessage(data.error || "Participant token not found in registry.");
        setParticipant(null);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to connect to check-in API.");
      setParticipant(null);
    }
  };

  // Setup HTML5 QR Scanner
  useEffect(() => {
    if (!isMounted || !scanning) return;

    let qrCodeInstance: Html5Qrcode | null = null;
    const timer = setTimeout(() => {
      const readerEl = document.getElementById("reader-register");
      if (!readerEl) return;

      try {
        qrCodeInstance = new Html5Qrcode("reader-register");
        setCameraError(null);

        qrCodeInstance
          .start(
            { facingMode },
            { fps: 10, qrbox: { width: 240, height: 240 } },
            async (decodedText) => {
              if (qrCodeInstance && qrCodeInstance.isScanning) {
                await qrCodeInstance.stop().catch((e) => console.error("Error stopping scanner:", e));
              }
              processCheckinToken(decodedText);
            },
            () => {}
          )
          .catch((err) => {
            console.error("Failed to start scanner:", err);
            setCameraError(
              "Failed to access camera. Please ensure permissions are granted and no other application is using it."
            );
          });
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (qrCodeInstance?.isScanning) {
        qrCodeInstance.stop().catch((e) => console.error("Error stopping scanner on cleanup:", e));
      }
    };
  }, [scanning, isMounted, facingMode]);

  const handleNextScan = () => {
    setParticipant(null);
    setMessage("");
    setStatus("idle");
    setManualToken("");
    setScanning(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) processCheckinToken(manualToken.trim());
  };

  const filteredRoster = roster.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.teamName.toLowerCase().includes(q) ||
      p.token.toLowerCase().includes(q) ||
      p.mail.toLowerCase().includes(q);
    if (filterCheckin === "checked") return matchesSearch && p.checkedIn;
    if (filterCheckin === "pending") return matchesSearch && !p.checkedIn;
    return matchesSearch;
  });

  const checkedInCount = roster.filter((p) => p.checkedIn).length;

  // CSV export
  const exportCSV = () => {
    const header = ["Name", "Team", "Domain", "Email", "Token", "Position", "Checked In", "Check-In Time (IST)"];
    const rows = roster.map((p) => [
      p.name,
      p.teamName,
      p.domain,
      p.mail,
      p.token,
      p.position,
      p.checkedIn ? "Yes" : "No",
      p.checkedInAt
        ? new Date(p.checkedInAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        : "",
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkin_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "border-teal-500/40 bg-teal-950/30 text-teal-300 shadow-[0_0_30px_rgba(20,184,166,0.2)]";
      case "already_checked_in":
        return "border-amber-500/40 bg-amber-950/30 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]";
      case "error":
        return "border-red-500/40 bg-red-950/30 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.2)]";
      default:
        return "border-teal-500/20 bg-neutral-900/60 text-neutral-300";
    }
  };

  if (!isMounted || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07080c] text-neutral-100 font-sans flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-teal-200 text-xs tracking-wider uppercase font-serif">
            Verifying Registrar Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-neutral-100 font-sans p-4 md:p-8 relative overflow-hidden">
      {/* Scanner CSS overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        #reader-register {
          border: none !important;
          padding: 0 !important;
          background: #07080c !important;
          position: relative !important;
        }
        #reader-register video {
          width: 100% !important;
          height: auto !important;
          border-radius: 16px !important;
          object-fit: cover !important;
          border: 1px solid rgba(20, 184, 166, 0.2) !important;
        }
      ` }} />

      {/* Ambient backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(20,184,166,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-teal-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative flex flex-col gap-8">

        {/* Header */}
        <header className="liquid-glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider bg-teal-500/10 border border-teal-400/30 text-teal-300">
                Registrar Station
              </span>
            </div>
            <h1 className="text-3xl font-bold font-serif mt-1" style={{ color: '#2dd4bf', textShadow: '0 0 20px rgba(20,184,166,0.4)' }}>
              CHECK-IN SCANNER
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Scan participant QR codes to register their arrival.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-400/20">
              <div className="text-2xl font-bold font-mono text-teal-300">{checkedInCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-teal-400/70 font-mono">Checked In</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700/40">
              <div className="text-2xl font-bold font-mono text-neutral-300">{roster.length - checkedInCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Pending</div>
            </div>
          </div>
        </header>

        {/* Top Grid: Scanner left + Result right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Manual Token Entry (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="liquid-glass-card p-6 flex flex-col gap-4">
              <div className="border-b border-teal-500/15 pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-teal-300 font-mono">
                  Manual Token Entry
                </h2>
                <p className="text-[11px] text-neutral-400 mt-1">
                  If scanning fails, type the participant's token ID manually.
                </p>
              </div>
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="e.g. KalashB."
                  className="liquid-input text-sm font-mono py-3 px-4"
                />
                <button
                  type="submit"
                  disabled={!manualToken.trim() || status === "loading"}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(20,184,166,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Check In Manually
                </button>
              </form>
            </div>
          </div>

          {/* Scanner & Result (7 cols) */}
          <div className="lg:col-span-7">
            <div className="liquid-glass-card p-6 md:p-8 min-h-[380px] flex flex-col justify-center items-center relative overflow-hidden">

              {/* Camera Scanner View */}
              <div className={`w-full flex flex-col items-center gap-4 ${scanning ? "flex" : "hidden"}`}>
                <div className="text-neutral-300 text-xs uppercase font-mono tracking-widest text-center">
                  Align Participant QR Code within Frame
                </div>

                <div
                  id="reader-register"
                  className="w-full max-w-[340px] overflow-hidden rounded-2xl border border-teal-500/20 bg-[#07080c]"
                />

                {cameraError && (
                  <div className="w-full max-w-[340px] text-center p-3.5 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-mono font-medium">
                    {cameraError}
                  </div>
                )}

                <button
                  onClick={() => setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))}
                  type="button"
                  className="py-2.5 px-4 rounded-xl border border-teal-500/30 bg-neutral-900/60 hover:bg-neutral-800/80 text-teal-200 hover:text-teal-100 font-mono text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.79M4 9h4.21m-4.21 0h.01M20 20v-5h-.581m0 0a8.003 8.003 0 01-15.357-2H3m12 2v5" />
                  </svg>
                  Switch to {facingMode === "environment" ? "Front" : "Back"} Camera
                </button>

                <span className="text-[10px] text-teal-300/60 font-mono">
                  Camera feed active • {facingMode === "environment" ? "Rear-Facing" : "Front-Facing"} Lens
                </span>
              </div>

              {/* Result View */}
              <AnimatePresence mode="wait">
                {!scanning && (
                  <motion.div
                    key="result-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`w-full border rounded-2xl p-6 flex flex-col items-center gap-6 text-center ${getStatusColor()}`}
                  >
                    {/* Status Icon */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-current bg-neutral-950/60 shadow-inner">
                      {status === "loading" && (
                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      )}
                      {status === "success" && (
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {status === "already_checked_in" && (
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {status === "error" && (
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    {/* Feedback header */}
                    <div>
                      <h3 className="text-xl font-bold font-serif uppercase tracking-wider mb-1">
                        {status === "loading" && "Looking Up Participant..."}
                        {status === "success" && "Checked In ✓"}
                        {status === "already_checked_in" && "Already Checked In"}
                        {status === "error" && "Not Found"}
                      </h3>
                      <p className="text-xs opacity-90 font-medium px-4">{message}</p>
                    </div>

                    {/* Participant Details */}
                    {participant && (
                      <div className="w-full bg-neutral-950/70 rounded-xl p-4 border border-white/10 text-left flex flex-col gap-2 shadow-md">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Participant</span>
                          <span className="text-xs font-semibold text-neutral-200">{participant.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Team</span>
                          <span className="text-xs font-semibold text-neutral-200">{participant.teamName}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Position</span>
                          <span className={`text-xs font-bold font-mono ${participant.position === "Lead" ? "text-teal-300" : "text-neutral-300"}`}>
                            {participant.position}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Status</span>
                          <span className={`text-xs font-bold font-mono ${participant.checkedIn ? "text-teal-300" : "text-neutral-400"}`}>
                            {participant.checkedIn ? "✓ Checked In" : "Pending"}
                          </span>
                        </div>
                        {participant.checkedInAt && (
                          <div className="flex justify-between">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Time (IST)</span>
                            <span className="text-xs font-mono text-neutral-300">
                              {new Date(participant.checkedInAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                timeZone: "Asia/Kolkata",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reset Button */}
                    {status !== "loading" && (
                      <button
                        onClick={handleNextScan}
                        className="w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-neutral-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(20,184,166,0.25)] cursor-pointer"
                      >
                        Scan Next Participant
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Roster Table */}
        <div className="liquid-glass-card p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-500/15 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold" style={{ color: '#2dd4bf', textShadow: '0 0 16px rgba(20,184,166,0.3)' }}>
                Live Check-In Roster
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real-time arrival tracking across all registered participants.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, team, token..."
                className="liquid-input text-xs font-mono py-2 px-3 w-48"
              />

              <select
                value={filterCheckin}
                onChange={(e) => setFilterCheckin(e.target.value)}
                className="liquid-input text-xs font-mono py-2 px-3 bg-neutral-900"
              >
                <option value="all">All Participants</option>
                <option value="checked">Checked In</option>
                <option value="pending">Pending</option>
              </select>

              <button
                onClick={fetchRoster}
                className="py-2 px-3 rounded-lg border border-teal-500/20 bg-neutral-900 text-teal-300 text-xs font-mono hover:bg-neutral-800 transition-colors"
              >
                {loadingRoster ? "Refreshing..." : "Refresh"}
              </button>

              <button
                onClick={exportCSV}
                disabled={roster.length === 0}
                className="py-2 px-3 rounded-lg border border-teal-400/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-mono font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-neutral-400">
              Showing <strong className="text-neutral-200">{filteredRoster.length}</strong> of <strong className="text-neutral-200">{roster.length}</strong> participants
            </span>
            <span className="text-teal-400">
              <strong>{checkedInCount}</strong> checked in
            </span>
            <span className="text-neutral-500">
              <strong>{roster.length - checkedInCount}</strong> pending
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/60 text-teal-300 font-mono uppercase text-[10px] tracking-wider border-b border-teal-500/15">
                <tr>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Check-In Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      No participants match the specified filter query.
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map((p) => (
                    <tr key={p.token} className="hover:bg-teal-500/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-neutral-100">
                        <div>{p.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{p.mail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-teal-200/80">{p.teamName}</td>
                      <td className="py-3.5 px-4 font-mono text-teal-300">{p.token}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                          p.position === "Lead"
                            ? "bg-teal-500/15 border-teal-400/30 text-teal-300"
                            : "bg-neutral-800 border-neutral-700 text-neutral-400"
                        }`}>
                          {p.position}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.checkedIn ? (
                          <div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-teal-500/15 border border-teal-400/30 text-teal-300">
                              ✓ Checked In
                            </span>
                            {p.checkedInAt && (
                              <div className="text-[9px] text-neutral-500 font-mono mt-1">
                                {new Date(p.checkedInAt).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Kolkata",
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-neutral-800 border border-neutral-700 text-neutral-400">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => processCheckinToken(p.token)}
                          disabled={p.checkedIn}
                          className="py-1.5 px-3 rounded-lg border border-teal-400/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-mono text-[11px] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {p.checkedIn ? "Done" : "Check In"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
