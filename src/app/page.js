"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useReducedMotion,
} from "framer-motion";

// Helper components

// 1. Magnetic Button Component
export function CastSpellButton({ children, className, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 15 });
  const springY = useSpring(y, { stiffness: 120, damping: 15 });

  const shouldReduce = useReducedMotion();

  function handleMouseMove(event) {
    if (shouldReduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - (rect.left + rect.width / 2);
    const mouseY = event.clientY - (rect.top + rect.height / 2);
    // Multiply by 0.35 for a controlled magnetic pull
    x.set(mouseX * 0.35);
    y.set(mouseY * 0.35);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={shouldReduce ? {} : { x: springX, y: springY }}
      className="relative inline-block overflow-hidden rounded-lg group"
    >
      {/* Continuous Pulse Glow Glow ring */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-primary-container to-secondary rounded-lg blur opacity-35 group-hover:opacity-75 transition duration-500 group-hover:duration-200 animate-pulse" />

      {/* Glow aura */}
      {!shouldReduce && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isHovered ? { opacity: 0.5, scale: 1.2 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-primary-container blur-xl rounded-lg pointer-events-none"
        />
      )}

      {/* Light flare overlay */}
      {!shouldReduce && (
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
          initial={{ x: "-100%" }}
          animate={isHovered ? { x: "100%" } : { x: "-100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-20" />
        </motion.div>
      )}

      <motion.button
        animate={shouldReduce ? {} : { scale: isHovered ? 1.05 : 1 }}
        onClick={onClick}
        className={`${className} relative z-10`}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

// 2. 3D Cursor Tilting Card Component (About Section)
export function Card3D({ children, className }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [15, -15]);
  const rotateY = useTransform(x, [0, 1], [-15, 15]);

  const springRotateX = useSpring(rotateX, { damping: 25, stiffness: 200 });
  const springRotateY = useSpring(rotateY, { damping: 25, stiffness: 200 });

  const shouldReduce = useReducedMotion();

  function handleMouseMove(event) {
    if (shouldReduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 cursor-pointer ${className}`}
    >
      <motion.div
        style={
          shouldReduce
            ? {}
            : {
              rotateX: springRotateX,
              rotateY: springRotateY,
              transformStyle: "preserve-3d",
            }
        }
        className="w-full h-full preserve-3d"
      >
        {children}
      </motion.div>
    </div>
  );
}

// 3. Domain Card with SNAPPY Hover Micro-interactions
export function DomainCard({ icon, title, description, shouldReduce, variants }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={variants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-card p-8 rounded-xl flex flex-col items-center text-center cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.1)]"
    >
      <motion.span
        animate={shouldReduce ? {} : { y: isHovered ? -6 : 0, scale: isHovered ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 12 }}
        className="material-symbols-outlined text-6xl text-primary-container mb-4 select-none"
      >
        {icon}
      </motion.span>
      <motion.h3
        animate={{ color: isHovered ? "#ffd700" : "#fff6df" }}
        transition={{ duration: 0.15 }}
        className="font-headline-md text-headline-md font-semibold mb-2"
      >
        {title}
      </motion.h3>
      <p className="font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>
    </motion.div>
  );
}

// 4. Timeline Node component with footprint/snappy interactions
export function TimelineNode({ time, title, subtitle, alignRight, delay, shouldReduce }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex items-center w-full ${alignRight ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-1/2 ${alignRight ? "pl-8 text-left" : "pr-8 text-right"}`}>
        <motion.h4
          animate={{ color: isHovered ? "#ffd700" : "#fff6df" }}
          transition={{ duration: 0.15 }}
          className="font-headline-md text-headline-md font-semibold"
        >
          {title}
        </motion.h4>
        <p className="font-body-md text-on-surface-variant">{subtitle}</p>
      </div>

      <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0 z-10">
        <motion.div
          animate={shouldReduce ? {} : { scale: isHovered ? 1.3 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="w-8 h-8 rounded-full bg-primary-container border-4 border-background flex-shrink-0 z-10 footprints"
          style={{ animationDelay: `${delay}s` }}
        />
        {isHovered && !shouldReduce && (
          <motion.div
            layoutId="glowCircle"
            className="absolute inset-0 bg-primary-container rounded-full blur-sm opacity-50 z-0"
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        )}
      </div>

      <div className={`w-1/2 ${alignRight ? "pr-8 text-right" : "pl-8 text-left"}`}>
        <p className="font-label-md text-label-md text-primary-container tracking-widest uppercase font-semibold">
          {time}
        </p>
      </div>
    </div>
  );
}

// 5. Countdown timer component
export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 245,
    hours: 12,
    minutes: 45,
    seconds: 10,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-between text-center mt-2 px-2 max-w-sm mx-auto">
      <div>
        <span className="block font-headline-lg text-headline-lg text-primary-container font-bold">
          {timeLeft.days}
        </span>
        <span className="font-label-md text-label-md text-on-surface-variant text-xs tracking-wider">
          DAYS
        </span>
      </div>
      <span className="font-headline-lg text-headline-lg text-outline-variant font-bold">:</span>
      <div>
        <span className="block font-headline-lg text-headline-lg text-primary-container font-bold">
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className="font-label-md text-label-md text-on-surface-variant text-xs tracking-wider">
          HOURS
        </span>
      </div>
      <span className="font-headline-lg text-headline-lg text-outline-variant font-bold">:</span>
      <div>
        <span className="block font-headline-lg text-headline-lg text-primary-container font-bold">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className="font-label-md text-label-md text-on-surface-variant text-xs tracking-wider">
          MINS
        </span>
      </div>
      <span className="font-headline-lg text-headline-lg text-outline-variant font-bold">:</span>
      <div>
        <span className="block font-headline-lg text-headline-lg text-primary-container font-bold">
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
        <span className="font-label-md text-label-md text-on-surface-variant text-xs tracking-wider">
          SECS
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const shouldReduce = useReducedMotion();
  const prizesRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prizes 3D Scroll Perspective effect
  const { scrollYProgress } = useScroll({
    target: prizesRef,
    offset: ["start end", "center center"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [25, 0]);
  const translateZ = useTransform(scrollYProgress, [0, 1], [-80, 0]);
  const opacityVal = useTransform(scrollYProgress, [0, 0.8], [0.4, 1]);

  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 80 });
  const springTranslateZ = useSpring(translateZ, { damping: 20, stiffness: 80 });
  const springOpacity = useSpring(opacityVal, { damping: 20, stiffness: 80 });

  // Spring animation variants for staggered cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <AnimatePresence>
      <div className="flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Fixed Navigation */}
        <nav
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
              ? "bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-lg"
              : "bg-transparent border-transparent"
            }`}
        >
          <div className="max-w-7xl mx-auto px-margin-desktop py-4 flex items-center justify-between">
            {/* Left */}
            <div className="hidden md:block w-32" />

            {/* Center Links */}
            <div className="hidden md:flex items-center gap-10">
              {[
                "About",
                "Domains",
                "Timeline",
                "Prizes",
                "Contact",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="group relative font-label-md text-label-md text-on-surface-variant transition-colors duration-300 hover:text-primary"
                >
                  {item}

                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* CTA */}
            <div>
              <CastSpellButton className="rounded-md bg-gradient-to-r from-primary-container to-secondary text-on-primary-container px-6 py-2 font-semibold uppercase shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                Cast Your Spell
              </CastSpellButton>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-28 pb-16 px-margin-mobile md:px-margin-desktop overflow-hidden">
          <div className="absolute inset-0 z-[-1] pointer-events-none">
            <img
              className="w-full h-full object-cover opacity-35"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7N_hX_44CP9l53dwLxQmPCbBEH0fICJT8gVCEsmJP-npDUrKimVGADxSualIkiThpPvmv6Sk_NuX_m8WbU71nZY5PB9QZahxWNivPqp8KAXCMoH1IEhcKIiQL4SKPiq4vbFtTYTPblEq_xQFIBgT8B7BiCx5Pr0EVQDqQlWNFZ5wqQZbhLgKfBHtwuabB46y_OHRo9IdYfUKhxvKOaLwNN0pnLEofBAW8EGZYl4a8vtx4Z6WLnuwyQl8ZXXL7LT5sHuqR9fffB5s"
              alt="Magical Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background"></div>
          </div>
          <div className="text-center z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
            <h1 className="font-harry-potter text-5xl md:text-7xl text-primary drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              INCEPTIA HACKATHON 2026
            </h1>
            <p className="font-headline-md text-xl md:text-2xl text-tertiary-fixed max-w-2xl px-4">
              Where Magic Meets Code. Collaborate, innovate, and brew powerful solutions in a 24-hour coding challenge. Whatever it takes.
            </p>
            <CastSpellButton className="bg-gradient-to-r from-primary-container to-secondary text-on-primary font-label-md text-label-md px-10 py-5 rounded-lg text-lg uppercase tracking-widest font-bold">
              Cast Your Spell (Register Now)
            </CastSpellButton>

            <div className="flex flex-wrap justify-center gap-8 mt-12 w-full max-w-3xl px-4">
              <div
                className="glass-card p-6 rounded-xl flex-1 min-w-[200px] text-center float-anim"
                style={{ animationDelay: "0s" }}
              >
                <div className="font-headline-lg text-5xl text-primary-container font-bold">24</div>
                <div className="font-label-md text-label-md text-on-surface-variant mt-2 uppercase tracking-wide">
                  Hours of Hacking
                </div>
              </div>
              <div
                className="glass-card p-6 rounded-xl flex-1 min-w-[200px] text-center float-anim"
                style={{ animationDelay: "1s" }}
              >
                <div className="font-headline-lg text-5xl text-primary-container font-bold">₹50k+</div>
                <div className="font-label-md text-label-md text-on-surface-variant mt-2 uppercase tracking-wide">
                  Prize Pool
                </div>
              </div>
              <div
                className="glass-card p-6 rounded-xl flex-1 min-w-[200px] text-center float-anim"
                style={{ animationDelay: "2s" }}
              >
                <div className="font-headline-lg text-5xl text-primary-container font-bold">400+</div>
                <div className="font-label-md text-label-md text-on-surface-variant mt-2 uppercase tracking-wide">
                  Wizards Assembled
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop relative" id="about">
          <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column: 3D Castle Image Card */}
            <div className="flex justify-center">
              <Card3D className="w-full max-w-lg aspect-[4/3] p-4 border-2 border-outline-variant bg-surface-container rounded-lg relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 bg-primary-container/10 blur-3xl rounded-full pointer-events-none" />
                <div className="w-full h-full overflow-hidden rounded relative preserve-3d">
                  <img
                    className="w-full h-full object-cover rounded border border-outline/50"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa-ZdjtZIvmsnaL_xWpaek7qWJlljWLjJiuc2sF5pL6uVde3pVwSZawv6TkWRGofxnqpRG96d98ZrPpeASBrnsh3WbPdtjlO7PFl1T57GoKRCRjktQH0NamPkSixtGPtUzGN70QAugcgDHbA9BvyuYxtK1Y7CzXKf43TTbIZtIUZtWgssajbS0OEyTM3tOup5Cf5Cr9cArEshDAkxGp2NwQHIQG4sfi3_IacN7swWA5IGDexgwS-jFHoTNuf--thg-dms3VOmXVII"
                    alt="Magical School Castle"
                  />
                  {/* Subtle golden highlights mapping to mouse interactions */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-container/5 to-white/10 mix-blend-overlay pointer-events-none" />
                </div>
              </Card3D>
            </div>

            {/* Right Column: Copy & Countdown */}
            <div className="flex flex-col gap-6">
              <h2 className="font-headline-lg text-4xl text-primary-container font-bold">
                The Magic Behind the Hackathon
              </h2>
              <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">
                Step into the grand halls of innovation. Inceptia 2026 is not just a hackathon; it is a crucible where raw talent is forged into mastery. Over 24 relentless hours, teams will conceptualize, build, and deploy magical solutions to real-world problems. Gather your coven, consult your grimoires (documentation), and prepare for a challenge unlike any other.
              </p>

              <div className="glass-card p-6 rounded-xl mt-6">
                <h3 className="font-label-md text-label-md text-primary mb-4 text-center tracking-widest uppercase font-semibold">
                  Time Until Magic Commences
                </h3>
                <Countdown />
              </div>
            </div>
          </div>
        </section>

        {/* Domains Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop relative" id="domains">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-display-lg text-4xl md:text-5xl text-primary text-center mb-16 drop-shadow-[0_0_12px_rgba(255,215,0,0.3)] font-bold">
              Choose Your Magical House (Domains)
            </h2>

            <motion.div
              variants={shouldReduce ? {} : containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <DomainCard
                icon="psychology"
                title="AI/ML"
                description="Brew intelligent models to solve complex real-world challenges."
                shouldReduce={shouldReduce}
                variants={itemVariants}
              />
              <DomainCard
                icon="currency_bitcoin"
                title="Web3"
                description="Cast decentralized protocols and configure robust secure architectures."
                shouldReduce={shouldReduce}
                variants={itemVariants}
              />
              <DomainCard
                icon="health_and_safety"
                title="Healthcare"
                description="Design healing potions and technical innovations to enhance patient care."
                shouldReduce={shouldReduce}
                variants={itemVariants}
              />
              <DomainCard
                icon="school"
                title="Education"
                description="Reimagine learning experiences and make universal knowledge accessible."
                shouldReduce={shouldReduce}
                variants={itemVariants}
              />
              <DomainCard
                icon="lightbulb"
                title="Open Innovation"
                description="An open canvas for any visionary, magical technology concept."
                shouldReduce={shouldReduce}
                variants={itemVariants}
              />
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop relative" id="timeline">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display-lg text-4xl md:text-5xl text-primary-container text-center mb-16 italic">
              The Marauder's Map (Event Schedule)
            </h2>
            <div className="relative parchment-timeline py-8">
              <div className="relative z-10 flex flex-col gap-16">
                <TimelineNode
                  time="15TH MAY 2026"
                  title="Sorting Hat Ceremony"
                  subtitle="Event Live on Unstop"
                  alignRight={false}
                  delay={0}
                  shouldReduce={shouldReduce}
                />
                <TimelineNode
                  time="25TH MAY - 7TH JUN 2026"
                  title="Spell Submission"
                  subtitle="Online Registrations"
                  alignRight={true}
                  delay={0.5}
                  shouldReduce={shouldReduce}
                />
                <TimelineNode
                  time="8TH JUNE 2026"
                  title="The Prophet's Announcement"
                  subtitle="Shortlisted Teams Announcement"
                  alignRight={false}
                  delay={1.0}
                  shouldReduce={shouldReduce}
                />
                <TimelineNode
                  time="4TH & 5TH JULY 2026"
                  title="The Grand Sorcery"
                  subtitle="Offline Hackathon at PCCOER Campus, Ravet, Pune"
                  alignRight={true}
                  delay={1.5}
                  shouldReduce={shouldReduce}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Prizes Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop relative" id="prizes">
          <div className="max-w-container-max mx-auto" ref={prizesRef}>
            <h2 className="font-display-lg text-4xl md:text-5xl text-primary-container text-center mb-20 font-bold">
              The Triwizard Rewards
            </h2>

            <motion.div
              style={
                shouldReduce
                  ? {}
                  : {
                    rotateX: springRotateX,
                    translateZ: springTranslateZ,
                    opacity: springOpacity,
                    transformStyle: "preserve-3d",
                    perspective: 1000,
                  }
              }
              className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end preserve-3d"
            >
              {/* 2nd Place */}
              <div className="bg-surface-container p-6 rounded-xl prize-border text-center order-2 md:order-1 h-64 flex flex-col justify-end transform hover:-translate-y-3 transition duration-300">
                <span className="material-symbols-outlined text-5xl text-outline mb-4 select-none">military_tech</span>
                <h3 className="font-headline-md text-xl text-primary mb-2">2nd Place</h3>
                <p className="font-display-lg text-3xl text-primary-container mb-2 font-bold">₹15,000</p>
                <p className="font-body-md text-on-surface-variant font-medium">+ Cool Gadgets</p>
              </div>

              {/* 1st Place */}
              <div className="bg-surface-container p-8 rounded-xl prize-border text-center order-1 md:order-2 h-80 flex flex-col justify-end transform md:-translate-y-8 hover:-translate-y-12 transition duration-300 shadow-[0_0_40px_rgba(255,215,0,0.15)] relative">
                {/* Visual Glow behind 1st place */}
                <div className="absolute inset-0 bg-primary-container/5 rounded-xl blur-lg pointer-events-none" />
                <span className="material-symbols-outlined text-6xl text-primary-container mb-4 select-none animate-pulse">
                  emoji_events
                </span>
                <h3 className="font-headline-md text-2xl text-primary mb-2 font-semibold">1st Place</h3>
                <p className="font-display-lg text-4xl text-primary-container mb-2 font-bold">₹25,000</p>
                <p className="font-body-md text-on-surface-variant font-medium">+ Winner Medals</p>
              </div>

              {/* 3rd Place */}
              <div className="bg-surface-container p-6 rounded-xl prize-border text-center order-3 md:order-3 h-56 flex flex-col justify-end transform hover:-translate-y-3 transition duration-300">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 select-none">military_tech</span>
                <h3 className="font-headline-md text-xl text-primary mb-2">3rd Place</h3>
                <p className="font-display-lg text-2xl text-primary-container mb-2 font-bold">₹10,000</p>
                <p className="font-body-md text-on-surface-variant font-medium">+ Exclusive Goodies</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sponsors Section */}
        <section className="py-16 px-margin-mobile md:px-margin-desktop relative border-t border-outline-variant/30 bg-surface/50">
          <div className="max-w-container-max mx-auto text-center">
            <h3 className="font-headline-md text-on-surface-variant mb-8 uppercase tracking-widest font-semibold">
              Our Ministry Supporters
            </h3>
            <div className="flex flex-wrap justify-center gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <div className="w-32 h-16 bg-surface-container-high rounded flex items-center justify-center font-label-md text-xs font-bold border border-outline-variant/20 hover:border-primary-container/40 transition duration-300">
                Logo 1
              </div>
              <div className="w-32 h-16 bg-surface-container-high rounded flex items-center justify-center font-label-md text-xs font-bold border border-outline-variant/20 hover:border-primary-container/40 transition duration-300">
                Logo 2
              </div>
              <div className="w-32 h-16 bg-surface-container-high rounded flex items-center justify-center font-label-md text-xs font-bold border border-outline-variant/20 hover:border-primary-container/40 transition duration-300">
                Logo 3
              </div>
              <div className="w-32 h-16 bg-surface-container-high rounded flex items-center justify-center font-label-md text-xs font-bold border border-outline-variant/20 hover:border-primary-container/40 transition duration-300">
                Logo 4
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="bg-surface-container-lowest w-full py-16 px-margin-desktop flex flex-col md:flex-row justify-between items-start gap-gutter border-t border-primary-container/20 shadow-[0_-10px_40px_rgba(255,215,0,0.05)] relative z-10"
          id="contact"
        >
          <div className="flex flex-col gap-4 max-w-sm px-4">
            <div className="font-headline-md text-headline-md text-primary-container uppercase tracking-widest font-bold">
              INCEPTIA 2026
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              © 2026 INCEPTIA HACKATHON. ALL RIGHTS RESERVED BY THE MINISTRY OF INNOVATION.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-4 text-sm leading-relaxed">
              inceptia2025@gmail.com
              <br />
              Pimpri Chinchwad College of Engineering and Research, Ravet, Pune.
            </p>
          </div>
          <div className="flex gap-12 px-4 mt-6 md:mt-0">
            <div className="flex flex-col gap-3">
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary-container hover:underline decoration-primary-container/50 transition-all opacity-80 hover:opacity-100"
                href="#"
              >
                Ministry Supporters
              </a>
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary-container hover:underline decoration-primary-container/50 transition-all opacity-80 hover:opacity-100"
                href="#"
              >
                Spellbook (Docs)
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary-container hover:underline decoration-primary-container/50 transition-all opacity-80 hover:opacity-100"
                href="#"
              >
                Enchanted Support
              </a>
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary-container hover:underline decoration-primary-container/50 transition-all opacity-80 hover:opacity-100"
                href="#"
              >
                House Rules
              </a>
            </div>
          </div>
        </footer>
      </div>
    </AnimatePresence>
  );
}
