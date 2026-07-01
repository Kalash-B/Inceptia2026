import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";


function WandCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setShowCursor(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setShowCursor(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    const move = (e: MouseEvent) => {
      setPos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  if (!showCursor) return null;

  return (
    <img
      src="/stick.png"
      alt="Wand"
      className="pointer-events-none fixed z-[9999] w-12 sm:w-16 md:w-20 lg:w-24 transition-transform duration-75"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-20%, -20%) rotate(-30deg)",
      }}
    />
  );
}

export default WandCursor
