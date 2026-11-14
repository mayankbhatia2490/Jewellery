"use client";

import React, { useState, useRef, useCallback } from "react";
import { ZoomIn, ZoomOut, CheckCircle2, AlertTriangle } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  fidelityStatus?: "pass" | "warn" | "fail";
  fidelityScore?: number;
  dir?: "rtl" | "ltr";
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Original Phone Photo",
  afterLabel = "UAE Studio Output",
  fidelityStatus = "pass",
  fidelityScore = 0.98,
  dir = "rtl",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let pos = (x / rect.width) * 100;
      if (pos < 0) pos = 0;
      if (pos > 100) pos = 100;
      setSliderPosition(pos);
    },
    [containerRef]
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-2xl mx-auto">
      {/* Fidelity Badge & Zoom Controls Header */}
      <div className="flex items-center justify-between w-full mb-3 px-2 text-xs font-semibold">
        <div className="flex items-center gap-2">
          {fidelityStatus === "pass" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم التحقق من مطابقة القطعة (Fidelity {(fidelityScore * 100).toFixed(0)}%)</span>
            </span>
          )}
          {fidelityStatus === "warn" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>فحص التفاصيل (200% Zoom Available)</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-sand-300 hover:bg-sand-100 text-slate-800 transition-colors shadow-sm"
        >
          {isZoomed ? (
            <>
              <ZoomOut className="w-4 h-4 text-gold-600" />
              <span>100% العرض العادي</span>
            </>
          ) : (
            <>
              <ZoomIn className="w-4 h-4 text-gold-600" />
              <span>200% تكبير فائق للذهب</span>
            </>
          )}
        </button>
      </div>

      {/* Main Interactive Canvas */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-square rounded-2xl overflow-hidden shadow-luxury border-2 border-sand-200 cursor-ew-resize bg-slate-900 transition-transform duration-200 ${
          isZoomed ? "scale-110 sm:scale-125 z-20" : ""
        }`}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After (Studio Output) Image - Full background */}
        <img
          src={afterImage}
          alt="Generated UAE Studio Result"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Before (Original Raw Photo) Image - Clipped */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt="Original Raw Smartphone Photo"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
              height: containerRef.current ? `${containerRef.current.clientHeight}px` : "100%",
            }}
          />
        </div>

        {/* Divider Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-gold-500 shadow-lg flex items-center justify-center">
            <div className="flex gap-1">
              <span className="w-0.5 h-3 bg-gold-600 rounded-full" />
              <span className="w-0.5 h-3 bg-gold-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels Overlay */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-bold text-white uppercase tracking-wider pointer-events-none">
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 bg-gold-600/90 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-bold text-white uppercase tracking-wider pointer-events-none">
          {afterLabel}
        </div>
      </div>

      <p className="mt-2 text-xs text-sand-600 text-center">
        اسحب المقبض لمقارنة دقة وتفاصيل عيار الذهب ونقش الصياغة
      </p>
    </div>
  );
}
