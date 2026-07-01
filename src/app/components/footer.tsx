"use client";

import React from "react";

export default function Footer() {
  return (
    <footer
      className="w-full py-16 px-8 md:px-24 flex flex-col md:flex-row justify-between items-start gap-8 border-t border-primary-container/20 bg-indigo-950/20 backdrop-blur-md shadow-[0_-10px_40px_rgba(255,215,0,0.05)] relative z-10"
      id="contact"
    >
      <div className="flex flex-col gap-4 max-w-sm px-4">
        <div className="font-harry-potter text-3xl text-primary drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] uppercase tracking-widest">
          INCEPTIA 2026
        </div>
        <p className="font-body-md text-sm text-on-surface-variant">
          © 2026 INCEPTIA HACKATHON
        </p>
        <p className="font-body-md text-sm text-on-surface-variant mt-4 leading-relaxed">
          inceptia2025@gmail.com
          <br />
          Pimpri Chinchwad College of Engineering and Research, Ravet, Pune.
        </p>
      </div>
      <div className="flex gap-12 px-4 mt-6 md:mt-0">
        <div className="flex flex-col gap-3">
          <a
            className="text-sm text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100"
            href="#"
          >
            Ministry Supporters
          </a>
          <a
            className="text-sm text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100"
            href="#"
          >
            Spellbook (Docs)
          </a>
        </div>
        <div className="flex flex-col gap-3">
          <a
            className="text-sm text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100"
            href="#"
          >
            Enchanted Support
          </a>
          <a
            className="text-sm text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100"
            href="#"
          >
            House Rules
          </a>
        </div>
      </div>
    </footer>
  );
}