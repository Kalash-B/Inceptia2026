import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { useRef } from "react";



// ─── Prizes Section ────────────────────────────────────────────────────────
function PrizesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const rotateX   = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const translateZ = useTransform(scrollYProgress, [0, 1], [-60, 0]);
  const opacityVal = useTransform(scrollYProgress, [0, 0.7], [0.3, 1]);

  const springRX = useSpring(rotateX,    { damping: 20, stiffness: 80 });
  const springTZ = useSpring(translateZ, { damping: 20, stiffness: 80 });
  const springOp = useSpring(opacityVal, { damping: 20, stiffness: 80 });

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.94 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 90, damping: 18, delay: i * 0.15 },
    }),
  };

  return (
    <section
      ref={sectionRef}
      id="prizes"
      className="relative z-10 py-28 px-8 mt-150 md:px-24 overflow-hidden"
    >
      {/* Atmospheric glows matching ruins background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-10 w-80 h-80 rounded-full bg-yellow-400/6 blur-[140px]" />
        <div className="absolute right-1/4 bottom-10 w-96 h-96 rounded-full bg-indigo-900/20 blur-[160px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-yellow-300/5 blur-[100px] animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <h2 className="font-display-lg text-4xl md:text-5xl text-primary-container text-center italic mb-4 drop-shadow-[0_0_16px_rgba(255,215,0,0.35)]">
          The Wizard&apos;s Treasure Vault
        </h2>
        <p className="font-body-lg text-center text-on-surface-variant mb-20 max-w-xl mx-auto">
          Only the finest innovators shall unlock the enchanted rewards hidden
          within the ancient vault.
        </p>

        {/* 3D scroll-perspective grid */}
        <motion.div
          style={{
            rotateX: springRX,
            translateZ: springTZ,
            opacity: springOp,
            transformStyle: "preserve-3d",
          }}
          className="grid md:grid-cols-3 gap-8 items-end perspective-1000"
        >
          {/* ── Runner-Up (2nd) ── */}
          <motion.div
            variants={cardVariants}
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="relative rounded-3xl backdrop-blur-xl p-8 text-center flex flex-col justify-end transition-transform duration-500 hover:-translate-y-4"
            style={{
              height: "400px",
              background: "linear-gradient(160deg, rgba(30,27,60,0.7) 0%, rgba(10,8,20,0.82) 100%)",
              border: "1px solid rgba(180,180,220,0.18)",
              boxShadow: "0 0 40px rgba(140,120,255,0.08), inset 0 0 24px rgba(255,215,0,0.03)",
            }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/4 to-transparent pointer-events-none" />
            {/* Silver trophy icon */}
            <div className="flex justify-center mb-5">
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="rgba(200,200,230,0.85)" strokeWidth="1.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7H4a2 2 0 000 4h3m10-4h3a2 2 0 010 4h-3M5 7V5h14v2M8 7v8a4 4 0 008 0V7M10 21h4M12 17v4" />
              </svg>
            </div>
            <h3 className="font-headline-md text-2xl text-slate-200 font-bold mb-2">Runner-Up</h3>
            <p className="font-headline-lg text-5xl text-slate-100 font-black mb-6">₹15,000</p>
            <div className="space-y-1.5 text-sm text-slate-300 font-body-md">
              <p>🏅 Magical Medal</p>
              <p>📜 Certificate of Excellence</p>
              <p>🎁 Exclusive Swag Kit</p>
            </div>
          </motion.div>

          {/* ── Grand Champion (1st) — tallest, centred ── */}
          <motion.div
            variants={cardVariants}
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="relative rounded-[28px] backdrop-blur-xl p-10 text-center flex flex-col justify-end md:-translate-y-10 overflow-hidden transition-transform duration-500 hover:scale-105"
            style={{
              height: "500px",
              background: "linear-gradient(160deg, rgba(60,45,0,0.55) 0%, rgba(10,8,20,0.90) 100%)",
              border: "1px solid rgba(255,215,0,0.4)",
              boxShadow: "0 0 90px rgba(255,215,0,0.18), inset 0 0 40px rgba(255,215,0,0.04)",
            }}
          >
            {/* Ambient gold glow layer */}
            <div className="absolute inset-0 bg-yellow-400/5 blur-2xl animate-pulse pointer-events-none rounded-[28px]" />
            {/* Floating sparkles */}
            <span className="absolute top-6 left-8 text-yellow-300/70 text-xl animate-pulse">✦</span>
            <span className="absolute top-12 right-8 text-yellow-200/60 animate-pulse" style={{ animationDelay: "0.5s" }}>✦</span>
            <span className="absolute top-24 left-1/2 -translate-x-1/2 text-yellow-300/40 text-2xl animate-pulse" style={{ animationDelay: "1s" }}>✧</span>
            {/* Gold trophy icon */}
            <div className="flex justify-center mb-6">
              <svg className="w-20 h-20 drop-shadow-[0_0_18px_rgba(255,215,0,0.8)]" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.95)" strokeWidth="1.3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7H4a2 2 0 000 4h3m10-4h3a2 2 0 010 4h-3M5 7V5h14v2M8 7v8a4 4 0 008 0V7M10 21h4M12 17v4" />
              </svg>
            </div>
            <h3 className="font-headline-md text-3xl text-yellow-100 font-bold mb-3">Grand Champion</h3>
            <p className="font-headline-lg text-6xl text-yellow-300 font-black mb-8 drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">₹25,000</p>
            <div className="space-y-2 text-sm text-yellow-50 font-body-md">
              <p>🏆 Champion Trophy</p>
              <p>🎖️ Winner Certificate</p>
              <p>💼 Internship Opportunities</p>
              <p>🎁 Premium Goodies</p>
            </div>
          </motion.div>

          {/* ── Second Runner-Up (3rd) ── */}
          <motion.div
            variants={cardVariants}
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="relative rounded-3xl backdrop-blur-xl p-8 text-center flex flex-col justify-end transition-transform duration-500 hover:-translate-y-4"
            style={{
              height: "370px",
              background: "linear-gradient(160deg, rgba(40,22,5,0.65) 0%, rgba(10,8,20,0.82) 100%)",
              border: "1px solid rgba(180,100,30,0.3)",
              boxShadow: "0 0 35px rgba(180,100,30,0.1), inset 0 0 20px rgba(255,165,0,0.03)",
            }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-500/4 to-transparent pointer-events-none" />
            {/* Bronze/amber trophy icon */}
            <div className="flex justify-center mb-5">
              <svg className="w-14 h-14 drop-shadow-[0_0_8px_rgba(180,100,30,0.5)]" viewBox="0 0 24 24" fill="none" stroke="rgba(205,133,63,0.9)" strokeWidth="1.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7H4a2 2 0 000 4h3m10-4h3a2 2 0 010 4h-3M5 7V5h14v2M8 7v8a4 4 0 008 0V7M10 21h4M12 17v4" />
              </svg>
            </div>
            <h3 className="font-headline-md text-2xl text-amber-200 font-bold mb-2">Second Runner-Up</h3>
            <p className="font-headline-lg text-5xl text-amber-400 font-black mb-6">₹10,000</p>
            <div className="space-y-1.5 text-sm text-amber-200 font-body-md">
              <p>🎖️ Medal of Honour</p>
              <p>📜 Certificate</p>
              <p>🎁 Magical Merchandise</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default PrizesSection;