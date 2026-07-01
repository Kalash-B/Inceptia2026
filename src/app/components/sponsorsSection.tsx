"use client";

import React, { useState } from "react";

interface Sponsor {
  tier: "title" | "gold";
  name: string;
  tagline?: string;
}

const sponsors: Sponsor[] = [
  // Title Sponsor
  { tier: "title", name: "MysticCorp", tagline: "Powering the Future of Magic" },

  // Gold Sponsors
  { tier: "gold", name: "Alchemist Labs" },
  { tier: "gold", name: "Phoenix Tech" },
];

const tierConfig = {
  title: {
    cardClass:
      "col-span-full bg-gradient-to-br from-yellow-500/20 via-indigo-950/60 to-indigo-950/80 backdrop-blur-md border-t-2 border-primary-container rounded-2xl shadow-[0_0_60px_rgba(255,215,0,0.15)] hover:shadow-[0_0_80px_rgba(255,215,0,0.25)] transition-all duration-500 group",
    height: "min-h-[200px]",
    nameClass:
      "text-4xl font-harry-potter text-primary drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]",
    taglineClass: "text-base text-on-surface-variant mt-2",
    glowColor: "rgba(255,215,0,0.12)",
    iconSize: "w-20 h-20",
    iconBg: "bg-yellow-400/10 border border-yellow-400/30",
    svgClass:
      "w-9 h-9 text-primary drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]",
  },
  gold: {
    cardClass:
      "bg-gradient-to-br from-yellow-400/10 via-indigo-950/50 to-indigo-950/70 backdrop-blur-md border-t-2 border-yellow-400/60 rounded-xl shadow-[0_0_35px_rgba(255,215,0,0.10)] hover:shadow-[0_0_50px_rgba(255,215,0,0.20)] transition-all duration-500 group",
    height: "min-h-[150px]",
    nameClass: "text-2xl font-bold text-yellow-200",
    taglineClass: "",
    glowColor: "rgba(255,215,0,0.08)",
    iconSize: "w-16 h-16",
    iconBg: "bg-yellow-400/10 border border-yellow-400/20",
    svgClass: "w-7 h-7 text-yellow-300",
  },
};

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const [hovered, setHovered] = useState(false);
  const config = tierConfig[sponsor.tier];

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 text-center cursor-pointer ${config.cardClass} ${config.height}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Inner glow pulse on hover */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Shimmer sweep on hover */}
      <div
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.4s" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
            transform: hovered ? "translateX(100%)" : "translateX(-100%)",
            transition: "transform 0.8s ease",
          }}
        />
      </div>

      {/* Title badge */}
      {sponsor.tier === "title" && (
        <span className="absolute top-4 right-4 text-xs uppercase tracking-widest font-semibold text-primary border border-primary/30 rounded-full px-3 py-1 bg-indigo-950/60">
          ✦ Title Sponsor
        </span>
      )}

      {/* Icon + Name */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div
          className={`flex items-center justify-center rounded-full mb-2 transition-transform duration-300 ${
            hovered ? "scale-110" : "scale-100"
          } ${config.iconSize} ${config.iconBg}`}
        >
          {/* Wand / sparkle SVG icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className={config.svgClass}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </div>

        <h4 className={config.nameClass}>{sponsor.name}</h4>
        {sponsor.tagline && (
          <p className={config.taglineClass}>{sponsor.tagline}</p>
        )}
      </div>
    </div>
  );
}

export default function SponsorsSection() {
  const titleSponsors = sponsors.filter((s) => s.tier === "title");
  const goldSponsors = sponsors.filter((s) => s.tier === "gold");

  return (
    <section className="relative z-10 w-full py-28 px-8 md:px-16" id="sponsors">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/4 top-1/3 w-96 h-96 rounded-full bg-yellow-400/5 blur-[140px]" />
        <div className="absolute right-1/4 bottom-1/3 w-80 h-80 rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="font-harry-potter text-4xl md:text-5xl text-primary drop-shadow-[0_0_20px_rgba(255,215,0,0.3)] mb-4">
            Our Ministry of Supporters
          </h2>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
            Esteemed institutions and visionary organisations who power the magic behind Inceptia 2026.
          </p>
          {/* Decorative golden divider */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary-container/60" />
            <span className="text-primary text-xl">✦</span>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary-container/60" />
          </div>
        </div>

        {/* ── Title Sponsor ── */}
        <div className="mb-10">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-primary/60 font-semibold mb-5">
            — Title Sponsor —
          </p>
          <div className="grid grid-cols-1">
            {titleSponsors.map((s) => (
              <SponsorCard key={s.name} sponsor={s} />
            ))}
          </div>
        </div>

        {/* ── Gold Sponsors ── */}
        <div>
          <p className="text-center text-xs uppercase tracking-[0.3em] text-yellow-400/60 font-semibold mb-5">
            — Gold Sponsors —
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goldSponsors.map((s) => (
              <SponsorCard key={s.name} sponsor={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
