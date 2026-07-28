"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import WandCursor from "./components/wandCursor";
import Countdown from "./components/countdown";
import LoadingScreen from "./components/loadingScreen";
import dynamic from "next/dynamic";

const TimelineSection = dynamic(() => import("./components/timelineSection"), { ssr: false });
const PrizesSection = dynamic(() => import("./components/prizeSection"), { ssr: false });
const SponsorsSection = dynamic(() => import("./components/sponsorsSection"), { ssr: false });
const Footer = dynamic(() => import("./components/footer"), { ssr: false });
const AboutSection = dynamic(() => import("./components/aboutSection"), { ssr: false });
const ImageGallerySection = dynamic(() => import("./components/imageGallerySection"), { ssr: false });
const FaqSection = dynamic(() => import("./components/faqSection"), { ssr: false });
const DomainGateSection = dynamic(() => import("./components/domainGateSection"), { ssr: false });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

interface DomainItem {
  house: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  accentColor: string;
  glowColor: string;
  icon: string;
}

const domainList: DomainItem[] = [
  {
    house: "Gryffindor",
    title: "AI & ML",
    description: "Build intelligent machine learning models, neural networks, and self-directing software agents to solve automated challenges.",
    color: "from-red-900/40 via-red-950/60 to-red-950/80",
    borderColor: "border-red-500/50",
    accentColor: "text-red-400",
    glowColor: "rgba(239, 68, 68, 0.45)",
    icon: "/emblems/aiml.svg"
  },
  {
    house: "Ravenclaw",
    title: "Web3 & Fintech",
    description: "Develop decentralized financial protocols, cryptographic ledger applications, custom smart contracts, and secure blockchain code.",
    color: "from-blue-900/40 via-blue-950/60 to-blue-950/80",
    borderColor: "border-blue-500/50",
    accentColor: "text-blue-400",
    glowColor: "rgba(59, 130, 246, 0.45)",
    icon: "/emblems/web3.svg"
  },
  {
    house: "Hufflepuff",
    title: "Healthcare",
    description: "Forge biotech applications, digital diagnostic systems, medical support portals, and assistive technologies to improve patient accessibility.",
    color: "from-yellow-600/30 via-yellow-900/50 to-yellow-950/80",
    borderColor: "border-yellow-500/50",
    accentColor: "text-yellow-400",
    glowColor: "rgba(245, 158, 11, 0.45)",
    icon: "/emblems/healthcare.svg"
  },
  {
    house: "Slytherin",
    title: "Education",
    description: "Design interactive digital classrooms, game-based learning environments, simulation systems, and training interfaces.",
    color: "from-emerald-900/40 via-emerald-950/60 to-emerald-950/80",
    borderColor: "border-emerald-500/50",
    accentColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.45)",
    icon: "/emblems/education.svg"
  },
  {
    house: "Order of Merlin",
    title: "Open Innovation",
    description: "A category dedicated to any groundbreaking technology, software solutions, or physical prototype that does not fit into the other four domains.",
    color: "from-purple-900/40 via-purple-950/60 to-purple-950/80",
    borderColor: "border-purple-500/50",
    accentColor: "text-purple-400",
    glowColor: "rgba(139, 92, 246, 0.45)",
    icon: "/emblems/otherinnovation.svg"
  }
];

function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading-screen" onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div id="main-scroll-container" className={`relative w-full h-screen overflow-y-scroll scroll-smooth snap-y snap-mandatory bg-surface ${isLoading ? 'overflow-hidden' : ''}`}>
        {/* Background Image (covers all 7 sections and scrolls naturally) */}
        <div className="absolute top-0 left-0 w-full h-[700vh] z-0 pointer-events-none">
          <Image
            src="/hero-bg.webp"
            alt="Hogwarts"
            fill
            priority
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/40 to-surface" />
        </div>

        {/* Custom Magic Wand Cursor */}
        {/* <WandCursor /> */}

        {/* 1. Hero Section */}
        <div className="w-full h-screen snap-start snap-always shrink-0 overflow-hidden flex flex-col justify-center items-start relative z-10">
          <section className="relative w-full flex flex-col items-center md:items-start justify-center text-center md:text-left px-4 sm:px-8 md:px-24 py-12">
            {/* Hero Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl flex flex-col items-center md:items-start justify-center gap-4 mt-12 w-full"
            >
              {/* College & Dept Badge - place above the title inside containerVariants */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-white/5 backdrop-blur-md px-4 py-2"
              >
                <img
                  src="/pccoer-logo.png"
                  alt="College Logo"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.9)]"
                />
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-white/90 text-xs sm:text-sm font-bold tracking-wide">
                    Pimpri Chinchwad College of Engineering and Research, Ravet, Pune.
                  </span>
                  <span className="text-yellow-400/80 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
                    Department of Information Technology
                  </span>
                </div>
              </motion.div>
              {/* Logo / Title animation */}
              <motion.div variants={itemVariants} className="text-center md:text-left pt-1">
                <h1
                  className="font-harry-potter text-[3.5rem] leading-[1.1] sm:text-7xl md:text-[110px] lg:text-[125px] text-white select-none italic pt-4 md:leading-tight"
                  style={{
                    fontWeight: "bold",
                    textShadow: "0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.4), 0 0 80px rgba(255,215,0,0.2)"
                  }}
                >
                  INCEPTIA <br /> HACKATHON
                </h1>
              </motion.div>

              {/* Date & Timer */}
              <motion.div
                variants={itemVariants}
                className="mb-6 flex flex-col items-center md:items-start px-4 w-full"
              >
                <span className="inline-block mb-4 rounded-xl border border-yellow-500/30 bg-black/40 px-4 py-2 text-center font-semibold uppercase tracking-[0.08em] text-xs sm:text-sm lg:text-base text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                  7th - 8th August 2026
                </span>

                <div className="w-full flex justify-center md:justify-start">
                  <div className="scale-90 origin-center md:origin-left md:scale-100">
                    <Countdown />
                  </div>
                </div>
              </motion.div>

              {/* Golden Register & Dashboard Buttons with high click priority */}
              <motion.div variants={itemVariants} className="relative z-50 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  className="magical-btn px-8 py-4 rounded-full sm:text-base text-sm tracking-widest flex items-center gap-2 group cursor-pointer"
                >
                  <span>✦ REGISTER NOW ✦</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </button>


              </motion.div>
            </motion.div>
          </section>
          <AnimatePresence>
            {showRegistrationModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-3xl rounded-3xl border border-yellow-500/30 bg-[#120d22]/95 backdrop-blur-xl py-6 px-4 sm:py-8 sm:px-6 shadow-[0_0_60px_rgba(255,215,0,0.2)] max-h-[90vh] overflow-y-auto"
                >
                  {/* Heading */}
                  <div className="flex justify-between items-center mb-6 sm:mb-8 sticky top-0 bg-[#120d22]/90 backdrop-blur-md pb-2 z-10 -mt-2">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400">
                      Registration Details
                    </h2>

                    <button
                      onClick={() => setShowRegistrationModal(false)}
                      className="text-3xl text-white hover:text-yellow-400 p-1"
                    >
                      ×
                    </button>
                  </div>

                  {/* Registration Fee */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                      💰 Registration Fee
                    </h3>

                    <div className="rounded-xl bg-black/30 border border-yellow-500/20 p-2 text-lg text-gray-200">
                      ₹549 per person
                      <br />
                      <span className="text-sm text-yellow-300">
                        Applicable only for teams shortlisted for Round 2
                      </span>
                    </div>
                  </div>

                  {/* Round 1 */}
                  <div className="mb-8">
                    <h3 className="sm:text-2xl text-xl text-yellow-300 mb-2">
                      🪄 Round 1 - Idea Submission
                    </h3>

                    <p className="text-gray-300 mb-4">
                      Submit your project idea in the form of a PowerPoint Presentation
                      (PPT). Teams will be evaluated on:
                    </p>

                    <ul className="space-y-2 text-gray-200 list-disc pl-6">
                      <li>Innovation & Originality</li>
                      <li>Problem Statement</li>
                      <li>Technical Feasibility</li>
                      <li>Potential Impact</li>
                      <li>Presentation Quality</li>
                    </ul>

                    <p className="mt-4 text-yellow-300 font-medium">
                      Only shortlisted teams will advance to Round 2.
                    </p>
                  </div>

                  {/* Round 2 */}
                  <div className="mb-8">
                    <h3 className="sm:text-2xl text-xl text-yellow-300 mb-3">
                      ⚡ Round 2 - 24-Hour Hackathon
                    </h3>

                    <ul className="space-y-3 text-gray-200 list-disc pl-6">
                      <li>Build and present a functional prototype.</li>
                      <li>Registration fee is payable only after selection.</li>
                      <li>Projects will be evaluated by renowned industry experts.</li>
                      <li>Outstanding performers may receive internship opportunities.</li>
                    </ul>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                      onClick={() => setShowRegistrationModal(false)}
                      className="px-6 py-3 rounded-xl border border-gray-600 text-white hover:bg-white/10"
                    >
                      Close
                    </button>

                    <a
                      href="https://unstop.com/o/KxwXi86?utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Logged_out_user"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="magical-btn px-8 py-3 rounded-xl text-center"
                    >
                      ✦ Proceed to Registration ✦
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. About Section */}
        <div id="about" className="w-full h-screen snap-start snap-always shrink-0 overflow-hidden flex items-center justify-center relative z-10">
          <AboutSection />
        </div>

        {/* 3. Domains Section */}
        <div id="domains" className="w-full h-screen snap-start snap-always shrink-0 overflow-hidden mt-30 flex items-center justify-center relative z-10">
          <DomainGateSection />
        </div>

        {/* 4. Timeline Section */}
        <div id="timeline" className="w-full min-h-screen h-auto snap-start snap-always shrink-0 flex items-center justify-center relative z-10 bg-black/20">
          <TimelineSection />
        </div>

        {/* 5. Prize Pool Section */}
        <div className="w-full min-h-screen h-auto snap-start snap-always shrink-0 flex items-center justify-center relative z-10">
          <PrizesSection />
        </div>

        {/* 6. Sponsors Section */}
        <div className="w-full min-h-screen h-auto snap-start snap-always shrink-0 flex items-center justify-center relative z-10">
          <SponsorsSection />
        </div>

        <div id="faq" className="w-full min-h-screen snap-start snap-always shrink-0 relative z-10">
          <ImageGallerySection />
          <FaqSection />
          <Footer />
        </div>
      </div>
    </>
  );
}


export default Page;