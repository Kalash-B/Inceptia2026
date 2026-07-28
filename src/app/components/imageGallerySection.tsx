"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
const galleryImages = [
  "/gallery/1.jpg",
  "/gallery/2.jpg",
  "/gallery/3.jpg",
  "/gallery/4.jpg",
  "/gallery/7.jpg",
  "/gallery/8.jpg",
  "/gallery/9.jpg",
  "/gallery/10.jpg",
  "/gallery/11.jpg",
  "/gallery/12.jpg",
  "/gallery/13.jpg",
  "/gallery/14.jpg",
];

const duplicatedImages = [...galleryImages, ...galleryImages];
export default function ImageGallerySection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const previous = () => {
    if (selectedIndex === null) return;

    setSelectedIndex(
      (selectedIndex - 1 + galleryImages.length) % galleryImages.length
    );
  };

  const next = () => {
    if (selectedIndex === null) return;

    setSelectedIndex(
      (selectedIndex + 1) % galleryImages.length
    );
  };
  return (
    <section className="relative overflow-hidden py-24 bg-[#0b0813]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.08),transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10"
      >
        {/* Heading */}
        <div className="text-center mb-14 px-6">
          <h2 className="font-harry-potter text-5xl md:text-7xl text-white drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">
            Past Memories
          </h2>

          <p className="mt-5 text-gray-400 max-w-2xl mx-auto text-lg">
            Relive the unforgettable moments of Inceptia. Every image tells a
            story of innovation, teamwork, friendships, and magical memories.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          {/* Left Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#0b0813] via-[#0b0813]/70 to-transparent z-20 pointer-events-none" />

          {/* Right Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#0b0813] via-[#0b0813]/70 to-transparent z-20 pointer-events-none" />

          <motion.div
            className="flex gap-8 py-4"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 45,
            }}
          >
            {duplicatedImages.map((src, idx) => (
              <motion.div
                onClick={() => setSelectedIndex(idx % galleryImages.length)}
                key={idx}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 20,
                }}
                className="group relative flex-shrink-0 w-[320px] h-[220px] md:w-[420px] md:h-[280px] cursor-pointer"
              >
                {/* Card */}
                <div
                  className="relative h-full w-full overflow-hidden rounded-3xl
                  border border-yellow-400/20
                  bg-white/5
                  backdrop-blur-sm
                  shadow-[0_15px_40px_rgba(0,0,0,.45)]
                  transition-all duration-500"
                >
                  {/* Image */}
                  <Image
                    src={src}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    loading="lazy"
                    sizes="(max-width:768px) 90vw, 420px"
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-3xl border border-yellow-300/0 group-hover:border-yellow-300/50 transition-all duration-500" />

                  {/* Shine Effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                      className="absolute top-0 -left-[120%] h-full w-1/3
                      rotate-12 bg-white/20 blur-md
                      group-hover:left-[140%]
                      transition-all duration-1000"
                    />
                  </div>

                  {/* Caption */}
                  <div
                    className="absolute bottom-0 left-0 right-0
                    translate-y-full
                    group-hover:translate-y-0
                    transition-transform duration-500
                    p-6"
                  >
                    <h3 className="text-white text-xl font-semibold">
                      Inceptia Event
                    </h3>

                    <p className="text-gray-300 text-sm mt-1">
                      Creating unforgettable memories together.
                    </p>
                  </div>

                  {/* Hover Icon */}
                  <div
                    className="absolute inset-0 flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300"
                  >
                    <div
                      className="h-14 w-14 rounded-full
                      border border-white/20
                      bg-white/15
                      backdrop-blur-md
                      flex items-center justify-center"
                    >
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 h-48 w-[700px] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />
      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              className="absolute top-6 right-6 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xl transition"
            >
              ✕
            </button>

            {/* Previous */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                previous();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-3xl transition"
            >
              ‹
            </button>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-3xl transition"
            >
              ›
            </button>

            {/* Counter */}
            <div className="absolute top-6 left-6 z-30 text-white bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
              {selectedIndex + 1} / {galleryImages.length}
            </div>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 22,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl h-[85vh]"
            >
              <Image
                src={galleryImages[selectedIndex]}
                alt={`Gallery ${selectedIndex + 1}`}
                fill
                sizes="100%"
                priority
                className="object-contain rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}