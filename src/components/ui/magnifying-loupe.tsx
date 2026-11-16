"use client";

import React, { useState, useRef, useCallback } from "react";
import { Search } from "lucide-react";

interface MagnifyingLoupeProps {
  imageSrc: string;
  alt?: string;
  zoomLevel?: number;
  lensSize?: number;
  className?: string;
}

export function MagnifyingLoupe({
  imageSrc,
  alt = "Jewellery Inspection",
  zoomLevel = 2.5,
  lensSize = 160,
  className = "",
}: MagnifyingLoupeProps) {
  const [isActive, setIsActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();

      let x = clientX - rect.left;
      let y = clientY - rect.top;

      // Clamp inside image bounds
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > rect.width) x = rect.width;
      if (y > rect.height) y = rect.height;

      setLensPos({ x, y });

      // Calculate zoomed background offset
      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;
      setBgPos({ x: bgX, y: bgY });
    },
    []
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    updatePosition(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  return (
    <div className={`relative select-none inline-block overflow-hidden rounded-2xl ${className}`}>
      {/* Target Image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className="w-full h-auto block object-contain cursor-crosshair"
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsActive(true)}
        onTouchEnd={() => setIsActive(false)}
        onTouchMove={handleTouchMove}
      />

      {/* Loupe Lens */}
      {isActive && (
        <div
          className="absolute pointer-events-none rounded-full border-4 border-gold-400/90 shadow-[0_0_25px_rgba(0,0,0,0.6)] backdrop-blur-none z-30"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensPos.x - lensSize / 2}px`,
            top: `${lensPos.y - lensSize / 2}px`,
            backgroundImage: `url(${imageSrc})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
          }}
        >
          {/* Jeweller's Loupe Reticle / Hallmark Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-full h-[1px] bg-gold-200" />
            <div className="h-full w-[1px] bg-gold-200 absolute" />
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/75 text-[9px] font-mono text-gold-300 font-bold tracking-widest uppercase">
            {(zoomLevel * 100).toFixed(0)}% LOUPE
          </div>
        </div>
      )}

      {/* Floating Toggle Hint */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-sand-200 flex items-center gap-1.5 pointer-events-none">
        <Search className="w-3 h-3 text-gold-400" />
        <span>مرر الفأرة لفحص نقوش الذهب (Loupe 250%)</span>
      </div>
    </div>
  );
}
