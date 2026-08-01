"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ParticipantInfo {
  name: string;
  teamName: string;
  mail: string;
  token: string;
  position: 'Lead' | 'Member';
  counter: number;
}

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [digit, setDigit] = useState<number>(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_scanned' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [scanning, setScanning] = useState<boolean>(true);
  const [manualToken, setManualToken] = useState<string>('');
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Roster state
  const [roster, setRoster] = useState<ParticipantInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCounter, setFilterCounter] = useState<string>('all');
  const [loadingRoster, setLoadingRoster] = useState<boolean>(false);

  const digitRef = useRef(1);

  useEffect(() => {
    setIsMounted(true);
    fetchRoster();
  }, []);

  useEffect(() => {
    digitRef.current = digit;
  }, [digit]);

  const fetchRoster = async () => {
    try {
      setLoadingRoster(true);
      const res = await fetch("/api/scan", {
        headers: {
          "X-Admin-Key": process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        },
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

  const processScanToken = async (scannedToken: string) => {
    if (!scannedToken.trim()) return;

    setScanning(false);
    setStatus('loading');
    setMessage("Searching for token signature...");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        },
        body: JSON.stringify({ token: scannedToken.trim(), digit: digitRef.current }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || `Food ration approved for Counter ${digitRef.current}!`);
        setParticipant(data.participant);
        fetchRoster();
      } else if (data.status === 'already_scanned') {
        setStatus('already_scanned');
        setMessage(data.message || 'Participant has already claimed food at this level.');
        setParticipant(data.participant);
      } else {
        setStatus('error');
        setMessage(data.error || 'Participant token not found in Hogwarts database.');
        setParticipant(null);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to connect to scanner API.');
      setParticipant(null);
    }
  };

  // Setup HTML5 Scanner
  useEffect(() => {
    if (!isMounted || !scanning) return;

    let qrCodeInstance: Html5Qrcode | null = null;
    const timer = setTimeout(() => {
      const readerEl = document.getElementById("reader");
      if (!readerEl) return;

      try {
        qrCodeInstance = new Html5Qrcode("reader");
        setCameraError(null);

        qrCodeInstance.start(
          { facingMode: facingMode },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          async (decodedText) => {
            if (qrCodeInstance && qrCodeInstance.isScanning) {
              await qrCodeInstance.stop().catch((e) => console.error("Error stopping scanner:", e));
            }
            processScanToken(decodedText);
          },
          () => {} // silent error callback for scanning frame failures
        ).catch((err) => {
          console.error("Failed to start scanner:", err);
          setCameraError("Failed to access camera. Please ensure permissions are granted and no other application is using it.");
        });
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (qrCodeInstance) {
        if (qrCodeInstance.isScanning) {
          qrCodeInstance.stop().catch((e) => console.error("Error stopping scanner on cleanup:", e));
        }
      }
    };
  }, [scanning, isMounted, facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleNextScan = () => {
    setParticipant(null);
    setMessage('');
    setStatus('idle');
    setManualToken('');
    setScanning(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken) {
      processScanToken(manualToken);
    }
  };

  const filteredRoster = roster.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mail.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterCounter === 'all') return matchesSearch;
    if (filterCounter === 'counter1') return matchesSearch && p.counter >= 1;
    if (filterCounter === 'counter2') return matchesSearch && p.counter >= 2;
    if (filterCounter === 'counter3') return matchesSearch && p.counter >= 3;
    if (filterCounter === 'unclaimed') return matchesSearch && p.counter === 0;

    return matchesSearch;
  });

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]';
      case 'already_scanned':
        return 'border-amber-500/40 bg-amber-950/30 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]';
      case 'error':
        return 'border-red-500/40 bg-red-950/30 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.2)]';
      default:
        return 'border-amber-500/20 bg-neutral-900/60 text-neutral-300';
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#07080c] text-neutral-100 font-sans flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-amber-200 text-xs tracking-wider uppercase font-serif">
            Initializing Admin Camera Module...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-neutral-100 font-sans p-4 md:p-8 relative overflow-hidden">
      {/* Embedded CSS overrides for html5-qrcode library UI components */}
      <style dangerouslySetInnerHTML={{ __html: `
        #reader {
          border: none !important;
          padding: 0 !important;
          background: #07080c !important;
          position: relative !important;
        }
        #reader video {
          width: 100% !important;
          height: auto !important;
          border-radius: 16px !important;
          object-fit: cover !important;
          border: 1px solid rgba(255, 215, 0, 0.2) !important;
        }
      ` }} />

      {/* Ambient backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(212,175,55,0.06),transparent_70%)] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative flex flex-col gap-8">
        
        {/* Navigation & Header */}
        <header className="liquid-glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider bg-amber-500/10 border border-amber-400/30 text-amber-300">
                Official Overseer Station
              </span>
            </div>
            <h1 className="text-3xl font-bold font-serif gold-spell-text mt-1">
              ADMIN SCANNER
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Scan participant QR codes.
            </p>
          </div>

        </header>

        {/* Top Grid: Counter Selector & Scanner Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Food Counter Selector & Manual Entry (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Active Counter Box */}
            <div className="liquid-glass-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-amber-500/15 pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-300 font-mono">
                  1. Select Active Food Counter
                </h2>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  Active: Counter {digit}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setDigit(num)}
                    className={`py-3.5 rounded-xl border text-sm font-bold transition-all duration-300 flex flex-col items-center gap-1 cursor-pointer ${
                      digit === num
                        ? "bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-400 text-neutral-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]"
                        : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-amber-500/30 hover:text-neutral-200"
                    }`}
                  >
                    <span className="text-xs uppercase opacity-80">Counter</span>
                    <span className="text-xl font-extrabold">{num}</span>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-neutral-400 text-center mt-1">
                Scans will update the participant's ration counter to Level {digit}.
              </p>
            </div>

            {/* Manual Token Entry Box */}
            

          </div>

          {/* Scanner View & Live Feedback Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="liquid-glass-card p-6 md:p-8 min-h-[380px] flex flex-col justify-center items-center relative overflow-hidden">
              
              {/* Camera Scanner View */}
              <div className={`w-full flex flex-col items-center gap-4 ${scanning ? "flex" : "hidden"}`}>
                <div className="text-neutral-300 text-xs uppercase font-mono tracking-widest text-center">
                  Align Participant QR Code within Frame
                </div>
                
                <div
                  id="reader"
                  className="w-full max-w-[340px] overflow-hidden rounded-2xl border border-amber-500/20 bg-[#07080c]"
                />

                {cameraError && (
                  <div className="w-full max-w-[340px] text-center p-3.5 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-mono font-medium backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    {cameraError}
                  </div>
                )}

                {/* Switch Camera Button */}
                <button
                  onClick={toggleCamera}
                  type="button"
                  className="py-2.5 px-4 rounded-xl border border-amber-500/30 bg-neutral-900/60 hover:bg-neutral-800/80 text-amber-200 hover:text-amber-100 font-mono text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_2px_10px_rgba(255,215,0,0.1)] active:scale-95"
                >
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.79M4 9h4.21m-4.21 0h.01M20 20v-5h-.581m0 0a8.003 8.003 0 01-15.357-2H3m12 2v5" />
                  </svg>
                  Switch to {facingMode === "environment" ? "Front" : "Back"} Camera
                </button>

                <span className="text-[10px] text-amber-300/60 font-mono">
                  Camera feed active • {facingMode === "environment" ? "Rear-Facing" : "Front-Facing"} Lens
                </span>
              </div>

              {/* Result View Overlay */}
              <AnimatePresence mode="wait">
                {!scanning && (
                  <motion.div
                    key="result-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`w-full border rounded-2xl p-6 flex flex-col items-center gap-6 text-center ${getStatusColor()}`}
                  >
                    {/* Status Indicator Icon */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-current bg-neutral-950/60 shadow-inner">
                      {status === 'loading' && (
                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      )}
                      {status === 'success' && (
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {status === 'already_scanned' && (
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {status === 'error' && (
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    {/* Feedback header */}
                    <div>
                      <h3 className="text-xl font-bold font-serif uppercase tracking-wider mb-1">
                        {status === 'loading' && 'Checking Hogwarts Registry...'}
                        {status === 'success' && 'Food Ration Approved'}
                        {status === 'already_scanned' && 'Duplicate Scan Warning'}
                        {status === 'error' && 'Verification Failed'}
                      </h3>
                      <p className="text-xs opacity-90 font-medium px-4">{message}</p>
                    </div>

                    {/* Participant Details Card */}
                    {participant && (
                      <div className="w-full bg-neutral-950/70 rounded-xl p-4 border border-white/10 text-left flex flex-col gap-2 shadow-md">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Participant</span>
                          <span className="text-xs font-semibold text-neutral-200">{participant.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Team</span>
                          <span className="text-xs font-semibold text-neutral-200">{participant.team}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Updated Food Counter</span>
                          <span className="text-xs font-bold text-amber-300 font-mono">
                            Counter {participant.counter} / 3
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reset Button */}
                    {status !== 'loading' && (
                      <button
                        onClick={handleNextScan}
                        className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(245,158,11,0.25)] cursor-pointer"
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

        {/* Bottom Section: Live Roster & Food Audit Table */}
        <div className="liquid-glass-card p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold gold-spell-text">
                Live Participant Food Audit Directory
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real-time tracking of food claims across all registered participants in MongoDB.
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, team, token..."
                className="liquid-input text-xs font-mono py-2 px-3 w-48"
              />

              <select
                value={filterCounter}
                onChange={(e) => setFilterCounter(e.target.value)}
                className="liquid-input text-xs font-mono py-2 px-3 bg-neutral-900"
              >
                <option value="all">All Rations</option>
                <option value="unclaimed">Unclaimed (0)</option>
                <option value="counter1">Counter 1+ Claimed</option>
                <option value="counter2">Counter 2+ Claimed</option>
                <option value="counter3">Counter 3 Claimed</option>
              </select>

              <button
                onClick={fetchRoster}
                className="py-2 px-3 rounded-lg border border-amber-500/20 bg-neutral-900 text-amber-300 text-xs font-mono hover:bg-neutral-800"
              >
                {loadingRoster ? "Refreshing..." : "Refresh List"}
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/60 text-amber-300 font-mono uppercase text-[10px] tracking-wider border-b border-amber-500/15">
                <tr>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Secret Token</th>
                  <th className="py-3 px-4">Counter Status</th>
                  <th className="py-3 px-4 text-right">Direct Claim Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500">
                      No participants match the specified filter query.
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map((p) => (
                    <tr key={p.token} className="hover:bg-amber-500/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-neutral-100">
                        <div>{p.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{p.mail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-amber-200/80">{p.teamName}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-300">{p.token}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                          p.counter >= digit
                            ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300"
                            : p.counter > 0
                            ? "bg-amber-500/15 border border-amber-400/30 text-amber-300"
                            : "bg-neutral-800 border border-neutral-700 text-neutral-400"
                        }`}>
                          Counter Status: Level {p.counter} / 3
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => processScanToken(p.token)}
                          className="py-1.5 px-3 rounded-lg border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-[11px] transition-all cursor-pointer"
                        >
                          Claim Counter {digit}
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