"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ParticipantInfo {
  name: string;
  team: string;
  counter: number;
}

export default function Page() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [digit, setDigit] = useState<number>(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_scanned' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [scanning, setScanning] = useState<boolean>(true);

  const digitRef = useRef(1);

  // Set isMounted to true after the component mounts on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    digitRef.current = digit;
  }, [digit]);

  useEffect(() => {
    if (!isMounted || !scanning) return;

    let scanner: Html5QrcodeScanner | null = null;
    const timer = setTimeout(() => {
      const readerEl = document.getElementById("reader");
      if (!readerEl) {
        console.warn("HTML Element with id=reader not found, retrying...");
        return;
      }

      try {
        scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          false
        );

        scanner.render(
          async (decodedText) => {
            // Immediately stop scanner and clear
            if (scanner) {
              await scanner.clear().catch(() => { });
            }
            setScanning(false);
            setStatus('loading');
            setMessage("Checking credentials in the Great Hall records...");

            try {
              const res = await fetch("/api/scan", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: decodedText, digit: digitRef.current }),
              });
              const data = await res.json();
              if (res.status === 200) {
                if (data.success) {
                  setStatus('success');
                  setMessage(data.message || 'Check-in approved!');
                  setParticipant(data.participant);
                } else if (data.status === 'already_scanned') {
                  setStatus('already_scanned');
                  setMessage(data.message || 'Duplicate scan warning.');
                  setParticipant(data.participant);
                } else {
                  setStatus('error');
                  setMessage(data.error || 'Failed to process check-in.');
                  setParticipant(null);
                }
              } else {
                setStatus('error');
                setMessage(data.error || 'Check-in failed with server status.');
                setParticipant(null);
              }
            } catch (err: any) {
              setStatus('error');
              setMessage(err.message || 'Failed to communicate with Server.');
              setParticipant(null);
            }
          },
          (error) => {
            // Ignore scanning errors
          }
        );
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(() => { });
      }
    };
  }, [scanning, isMounted]);

  const handleNextScan = () => {
    setParticipant(null);
    setMessage('');
    setStatus('idle');
    setScanning(true);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
      case 'already_scanned':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
      case 'error':
        return 'border-red-500/40 bg-red-950/20 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
      default:
        return 'border-amber-500/20 bg-neutral-900/40 text-neutral-300';
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-neutral-100 font-sans flex flex-col items-center justify-center p-4">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 text-amber-400 border-2 border-current border-t-transparent rounded-full" />
          <p className="text-amber-200 text-sm tracking-wider uppercase font-serif">
            Summoning scanner module...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-neutral-100 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Magic Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,165,32,0.06),transparent_70%)] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-900/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Embedded CSS overrides for html5-qrcode library UI components without using styled-jsx */}
      <style dangerouslySetInnerHTML={{ __html: `
        #reader {
          border: none !important;
          padding: 0 !important;
        }
        #reader__dashboard_section_csr button {
          background-color: #ffd700 !important;
          color: #131313 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: none !important;
          font-weight: bold !important;
          font-size: 0.875rem !important;
          cursor: pointer !important;
          transition: background-color 0.2s;
        }
        #reader__dashboard_section_csr button:hover {
          background-color: #ffe16d !important;
        }
        #reader__dashboard_section_csr select {
          background-color: #201f1f !important;
          color: #e5e2e1 !important;
          border: 1px solid rgba(255,215,0,0.3) !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
          outline: none !important;
        }
        #reader__camera_permission_button {
          background-color: #ffd700 !important;
          color: #131313 !important;
          border-radius: 8px !important;
          padding: 10px 20px !important;
          border: none !important;
          font-weight: bold !important;
          cursor: pointer !important;
          transition: transform 0.2s;
        }
        #reader__camera_permission_button:hover {
          transform: scale(1.02);
        }
        #reader__scan_region {
          border: 2px dashed rgba(255,215,0,0.2) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        #reader__scan_region video {
          border-radius: 12px !important;
        }
      ` }} />

      <div className="w-full max-w-lg z-10 flex flex-col gap-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-[0_2px_8px_rgba(255,215,0,0.2)] font-serif mb-2">
            THE GREAT HALL
          </h1>
          <p className="text-neutral-400 text-xs tracking-widest uppercase">
            Food Counter Scanner
          </p>
        </div>

        {/* Counter select */}
        <div className="bg-[#1c1b1b]/80 border border-amber-500/15 rounded-2xl p-6 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <h2 className="text-amber-200 text-xs font-semibold tracking-widest uppercase mb-4 text-center">
            Active Food Counter
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setDigit(num)}
                className={`py-3 rounded-xl border text-lg font-bold transition-all duration-300 ${digit === num
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    : "bg-[#131313] border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Scanner Panel */}
        <div className="bg-[#1c1b1b]/80 border border-amber-500/15 rounded-2xl p-6 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] min-h-[360px] flex flex-col justify-center items-center relative overflow-hidden">
          
          {/* Scanner View: Always mounted to avoid mount delay race conditions, toggled via display classes */}
          <div className={`w-full flex flex-col items-center gap-4 ${scanning ? "flex" : "hidden"}`}>
            <div className="text-neutral-300 text-sm font-medium tracking-wide">
              Hold QR code inside the frame
            </div>
            <div
              id="reader"
              className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-neutral-800 bg-[#131313]"
            ></div>
          </div>

          <AnimatePresence mode="wait">
            {!scanning && (
              <motion.div
                key="result-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full border rounded-2xl p-6 flex flex-col items-center gap-6 text-center ${getStatusColor()}`}
              >
                {/* Result Indicator Icon */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-current bg-neutral-950/40 shadow-inner">
                  {status === 'loading' && (
                    <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {status === 'success' && (
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {status === 'already_scanned' && (
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {status === 'error' && (
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                {/* Main feedback text */}
                <div>
                  <h3 className="text-2xl font-bold tracking-wide uppercase mb-1">
                    {status === 'loading' && 'Verifying...'}
                    {status === 'success' && 'Access Approved'}
                    {status === 'already_scanned' && 'Duplicate Scan'}
                    {status === 'error' && 'Access Denied'}
                  </h3>
                  <p className="text-sm opacity-90 font-medium px-4">{message}</p>
                </div>

                {/* Participant Details Card */}
                {participant && (
                  <div className="w-full bg-neutral-950/60 rounded-xl p-4 border border-white/5 text-left flex flex-col gap-2.5 shadow-md">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-xs text-neutral-400 uppercase tracking-widest">Participant</span>
                      <span className="text-sm font-semibold text-neutral-200">{participant.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-xs text-neutral-400 uppercase tracking-widest">Team</span>
                      <span className="text-sm font-semibold text-neutral-200">{participant.team}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-neutral-400 uppercase tracking-widest">Food Counter Status</span>
                      <span className="text-sm font-semibold text-amber-300">
                        {participant.counter === digit ? `Updated to Counter ${digit}` : `Last eaten: Counter ${participant.counter}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Clear/Next Button */}
                {status !== 'loading' && (
                  <button
                    onClick={handleNextScan}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 rounded-xl font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(245,158,11,0.2)] hover:scale-[1.01]"
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
  );
}