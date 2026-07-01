"use client";

import Image from "next/image";
import WandCursor from "./components/wandCursor";
import Countdown from "./components/countdown";
import PrizesSection from "./components/prizeSection";
import SponsorsSection from "./components/sponsorsSection";
import Footer from "./components/footer";


<WandCursor />




function Page() {
  return (
    <div className="relative w-full">
      {/* Custom Magic Wand Cursor */}
      <WandCursor />

      {/* Background Image (optimized next/image, spans full scrollable height) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/hero-bg.png"
          alt="Hogwarts"
          fill
          priority
          className="object-cover object-top"
        />
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-0 z-[-1] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen w-full flex items-center justify-start px-8 md:px-24">
        {/* Hero Content (positioned on the left middle side) */}
        <div className="max-w-2xl flex flex-col items-start text-left gap-8">
          <h1
            className="font-harry-potter leading-tight text-5xl md:text-7xl text-primary drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          >
            INCEPTIA HACKATHON
          </h1>

          <p className="font-body-lg text-lg md:text-xl text-tertiary-fixed max-w-xl leading-relaxed">
            Join Earth's Mightiest Developers! Collaborate, innovate, and compete in
            a coding challenge worthy of heroes.
            <span className="text-error font-semibold"> Whatever it takes.</span>
          </p>

          {/* Properties (stats) on the left-middle side */}
          <div className="flex flex-col gap-4 mt-4 w-full max-w-sm">
            <div
              className="bg-indigo-950/40 backdrop-blur-md p-4 rounded-xl flex items-center justify-between gap-4 border-t-2 border-primary-container float-anim shadow-[0_0_20px_rgba(255,215,0,0.05)]"
              style={{ animationDelay: "0s" }}
            >
              <span className="font-label-md text-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Hours of Hacking
              </span>
              <span className="font-headline-lg text-3xl text-[#e17e45] font-bold">
                24
              </span>
            </div>

            <div
              className="bg-indigo-950/40 backdrop-blur-md p-4 rounded-xl flex items-center justify-between gap-4 border-t-2 border-primary-container float-anim shadow-[0_0_20px_rgba(255,215,0,0.05)]"
              style={{ animationDelay: "1s" }}
            >
              <span className="font-label-md text-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Prize Pool
              </span>
              <span className="font-headline-lg text-3xl text-[#e17e45] font-bold">
                ₹50k+
              </span>
            </div>

            <div
              className="bg-indigo-950/40 backdrop-blur-md p-4 rounded-xl flex items-center justify-between gap-4 border-t-2 border-primary-container float-anim shadow-[0_0_20px_rgba(255,215,0,0.05)]"
              style={{ animationDelay: "2s" }}
            >
              <span className="font-label-md text-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Wizards Assembled
              </span>
              <span className="font-headline-lg text-3xl text-[#e17e45] font-bold">
                400+
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About/Hackathon Info Section (Next page / below fold) */}
      <section className="relative z-10 min-h-screen w-full flex items-center justify-start px-8 md:px-24 py-24">
        <div className="max-w-2xl flex flex-col items-start text-left gap-8">
          <h2 className="font-headline-lg text-4xl text-primary-container font-bold drop-shadow-[0_0_12px_rgba(255,215,0,0.3)]">
            The Magic Behind the Hackathon
          </h2>

          <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">
            Step into the grand halls of innovation. Inceptia 2026 is not just a hackathon; it is a crucible where raw talent is forged into mastery. Over 24 relentless hours, teams will conceptualize, build, and deploy magical solutions to real-world problems. Gather your coven, consult your grimoires (documentation), and prepare for a challenge unlike any other.
          </p>

          {/* Time Countdown block */}
          <div className="bg-indigo-950/40 backdrop-blur-md p-6 rounded-xl border-t-2 border-primary-container shadow-[0_0_20px_rgba(255,215,0,0.05)] w-full max-w-md mt-4">
            <h3 className="font-label-md text-sm text-primary mb-4 text-center tracking-widest uppercase font-semibold">
              Time Until Magic Commences
            </h3>
            <Countdown />
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center mt-24 px-2 md:px-6 py-24">
        <h2 className="font-headline-lg text-4xl md:text-5xl text-primary text-center mb-16 drop-shadow-[0_0_12px_rgba(255,215,0,0.3)] font-bold">
          Choose Your Domain
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 md:gap-x-24 lg:gap-x-36 w-full max-w-none items-stretch">
          {/* Left Column: AI & ML and Web3 & Fintech */}
          <div className="flex flex-col gap-6 justify-center">
            {/* AI & ML */}
            <div className="bg-indigo-950/40 backdrop-blur-md p-6 rounded-xl border-t-2 border-primary-container shadow-[0_0_20px_rgba(255,215,0,0.05)] flex flex-col items-center text-center">
              <svg className="w-12 h-12 text-primary-container mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="font-headline-md text-xl text-primary font-semibold mb-2">
                AI & Machine Learning
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Build intelligent AI systems, autonomous agents, and data-driven solutions that solve complex challenges through automation.
              </p>
            </div>

            {/* Web3 & Fintech */}
            <div className="bg-indigo-950/40 backdrop-blur-md p-6 rounded-xl border-t-2 border-primary-container shadow-[0_0_20px_rgba(255,215,0,0.05)] flex flex-col items-center text-center">
              <svg className="w-12 h-12 text-primary-container mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <h3 className="font-headline-md text-xl text-primary font-semibold mb-2">
                Web3 & Fintech
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Develop decentralized applications, blockchain solutions, smart contracts, and next-generation financial technologies.
              </p>
            </div>
          </div>

          {/* Center Column: Spacer at top (for statue face) and Open Innovation at bottom */}
          <div className="flex flex-col gap-6 justify-between min-h-[500px] md:min-h-[550px]">
            {/* Transparent spacer on desktop to leave the statue face visible */}
            <div className="hidden md:block h-32 md:h-48" />

            {/* Open Innovation (Moved a bit lower on desktop) */}
            <div className="bg-indigo-950/40 backdrop-blur-md p-6 rounded-xl border-t-2 border-primary-container shadow-[0_0_20px_rgba(255,215,0,0.05)] flex flex-col items-center text-center mt-auto md:translate-y-16">
              <svg className="w-12 h-12 text-primary-container mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h3 className="font-headline-md text-xl text-primary font-semibold mb-2">
                Open Innovation
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Have a groundbreaking idea beyond conventional domains? Bring your bold vision to life with complete creative freedom.
              </p>
            </div>
          </div>

          {/* Right Column: Healthcare and Education */}
          <div className="flex flex-col gap-6 justify-center">
            {/* Healthcare */}
            <div className="bg-indigo-950/40 backdrop-blur-md p-6 rounded-xl border-t-2 border-primary-container shadow-[0_0_20px_rgba(255,215,0,0.05)] flex flex-col items-center text-center">
              <svg className="w-12 h-12 text-primary-container mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="font-headline-md text-xl text-primary font-semibold mb-2">
                Healthcare
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Create innovative technologies that improve patient care, diagnostics, medical accessibility, and healthcare management.
              </p>
            </div>

            {/* Education */}
            <div className="bg-indigo-950/40 backdrop-blur-md p-6 rounded-xl border-t-2 border-primary-container shadow-[0_0_20px_rgba(255,215,0,0.05)] flex flex-col items-center text-center">
              <svg className="w-12 h-12 text-primary-container mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="font-headline-md text-xl text-primary font-semibold mb-2">
                Education
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Reimagine learning with interactive platforms, AI-powered education, and accessible technologies that empower learners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative z-10 mt-32 w-full" style={{ minHeight: "100vh" }}>
        {/* Heading — positioned above the node layout */}
        <h2 className="font-display-lg text-4xl md:text-5xl text-primary-container text-center italic pt-10 relative z-10 drop-shadow-[0_0_12px_rgba(255,215,0,0.3)]">
          Event Schedule
        </h2>

        <div className="absolute inset-0">

          {/* ─ Central spine ─ */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: "10%",
            height: "80%",
            width: "2px",
            transform: "translateX(-50%)",
            background: "linear-gradient(to bottom, transparent 0%, rgba(255,215,0,0.18) 8%, rgba(255,215,0,0.22) 50%, rgba(255,215,0,0.18) 92%, transparent 100%)",
          }} />

          {/* ══ Node 1 — 17% | RIGHT ══ */}
          {/* node */}
          <div className="timeline-node" style={{ position: "absolute", top: "17%", left: "50%", transform: "translate(-50%,-50%)", animationDelay: "0s", zIndex: 2 }}>
            <div className="timeline-node-inner" />
          </div>
          {/* horizontal arm */}
          <div style={{ position: "absolute", top: "17%", left: "calc(50% + 14px)", width: "7%", height: "2px", transform: "translateY(-50%)", background: "rgba(255,215,0,0.28)" }} />
          {/* vertical drop at end of arm */}
          <div style={{ position: "absolute", top: "calc(17% - 30px)", left: "calc(57% + 14px)", width: "2px", height: "60px", background: "rgba(255,215,0,0.18)" }} />
          {/* card */}
          <div className="timeline-card" style={{ position: "absolute", top: "calc(17% - 30px)", left: "calc(57% + 16px)", width: "26%", height: "60px" }} />

          {/* ══ Node 2 — 33% | LEFT ══ */}
          <div className="timeline-node" style={{ position: "absolute", top: "33%", left: "50%", transform: "translate(-50%,-50%)", animationDelay: "0.6s", zIndex: 2 }}>
            <div className="timeline-node-inner" />
          </div>
          <div style={{ position: "absolute", top: "33%", right: "calc(50% + 14px)", width: "7%", height: "2px", transform: "translateY(-50%)", background: "rgba(255,215,0,0.28)" }} />
          <div style={{ position: "absolute", top: "calc(33% - 30px)", right: "calc(57% + 14px)", width: "2px", height: "60px", background: "rgba(255,215,0,0.18)" }} />
          <div className="timeline-card" style={{ position: "absolute", top: "calc(33% - 30px)", right: "calc(57% + 16px)", width: "26%", height: "60px" }} />

          {/* ══ Node 3 — 50% | RIGHT ══ */}
          <div className="timeline-node" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animationDelay: "1.2s", zIndex: 2 }}>
            <div className="timeline-node-inner" />
          </div>
          <div style={{ position: "absolute", top: "50%", left: "calc(50% + 14px)", width: "7%", height: "2px", transform: "translateY(-50%)", background: "rgba(255,215,0,0.28)" }} />
          <div style={{ position: "absolute", top: "calc(50% - 30px)", left: "calc(57% + 14px)", width: "2px", height: "60px", background: "rgba(255,215,0,0.18)" }} />
          <div className="timeline-card" style={{ position: "absolute", top: "calc(50% - 30px)", left: "calc(57% + 16px)", width: "26%", height: "60px" }} />

          {/* ══ Node 4 — 66% | LEFT ══ */}
          <div className="timeline-node" style={{ position: "absolute", top: "66%", left: "50%", transform: "translate(-50%,-50%)", animationDelay: "1.8s", zIndex: 2 }}>
            <div className="timeline-node-inner" />
          </div>
          <div style={{ position: "absolute", top: "66%", right: "calc(50% + 14px)", width: "7%", height: "2px", transform: "translateY(-50%)", background: "rgba(255,215,0,0.28)" }} />
          <div style={{ position: "absolute", top: "calc(66% - 30px)", right: "calc(57% + 14px)", width: "2px", height: "60px", background: "rgba(255,215,0,0.18)" }} />
          <div className="timeline-card" style={{ position: "absolute", top: "calc(66% - 30px)", right: "calc(57% + 16px)", width: "26%", height: "60px" }} />

          {/* ══ Node 5 — 82% | RIGHT ══ */}
          <div className="timeline-node" style={{ position: "absolute", top: "82%", left: "50%", transform: "translate(-50%,-50%)", animationDelay: "2.4s", zIndex: 2 }}>
            <div className="timeline-node-inner" />
          </div>
          <div style={{ position: "absolute", top: "82%", left: "calc(50% + 14px)", width: "7%", height: "2px", transform: "translateY(-50%)", background: "rgba(255,215,0,0.28)" }} />
          <div style={{ position: "absolute", top: "calc(82% - 30px)", left: "calc(57% + 14px)", width: "2px", height: "60px", background: "rgba(255,215,0,0.18)" }} />
          <div className="timeline-card" style={{ position: "absolute", top: "calc(82% - 30px)", left: "calc(57% + 16px)", width: "26%", height: "60px" }} />

        </div>
      </section>

      {/* Prize Pool Section */}
      <PrizesSection />

      {/* Sponsors Section */}
      <SponsorsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Page;