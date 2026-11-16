"use client";

import React, { useState } from "react";
import {
  Download,
  Share2,
  CheckCircle2,
  ZoomIn,
  X,
  Search,
  Sliders,
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { MagnifyingLoupe } from "@/components/ui/magnifying-loupe";
import { UAE_SAMPLE_PIECES } from "@/lib/assets/sample-pieces";

interface CatalogItem {
  id: string;
  pieceType: string;
  karat: string;
  stylePackTitle: string;
  fidelityScore: number;
  fidelityWarning: boolean;
  date: string;
  rawInputUrl: string;
  outputs: {
    ratio: "1:1" | "4:5" | "9:16";
    title: string;
    url: string;
  }[];
}

export default function CatalogPage() {
  const [selectedForCompare, setSelectedForCompare] = useState<CatalogItem | null>(null);
  const [inspectMode, setInspectMode] = useState<"slider" | "loupe">("slider");

  const catalogItems: CatalogItem[] = [
    {
      id: "cat-dxb-001",
      pieceType: UAE_SAMPLE_PIECES[0].nameAr,
      karat: "22K Gulf Gold",
      stylePackTitle: "كلاسيك الذهب الخليجي (ترافرتين)",
      fidelityScore: 0.98,
      fidelityWarning: false,
      date: "اليوم 14:20",
      rawInputUrl: UAE_SAMPLE_PIECES[0].beforeSvgDataUri,
      outputs: [
        {
          ratio: "1:1",
          title: "كتالوج واتساب (1:1)",
          url: UAE_SAMPLE_PIECES[0].afterSvgDataUri,
        },
        {
          ratio: "4:5",
          title: "خلاصة انستغرام (4:5)",
          url: UAE_SAMPLE_PIECES[0].afterSvgDataUri,
        },
        {
          ratio: "9:16",
          title: "قصص ستوري (9:16)",
          url: UAE_SAMPLE_PIECES[0].afterSvgDataUri,
        },
      ],
    },
    {
      id: "cat-dxb-002",
      pieceType: UAE_SAMPLE_PIECES[1].nameAr,
      karat: "21K Yellow Gold",
      stylePackTitle: "تراث الصياغة والنقش (بناجر)",
      fidelityScore: 0.99,
      fidelityWarning: false,
      date: "اليوم 11:15",
      rawInputUrl: UAE_SAMPLE_PIECES[1].beforeSvgDataUri,
      outputs: [
        {
          ratio: "1:1",
          title: "كتالوج واتساب (1:1)",
          url: UAE_SAMPLE_PIECES[1].afterSvgDataUri,
        },
        {
          ratio: "4:5",
          title: "خلاصة انستغرام (4:5)",
          url: UAE_SAMPLE_PIECES[1].afterSvgDataUri,
        },
        {
          ratio: "9:16",
          title: "قصص ستوري (9:16)",
          url: UAE_SAMPLE_PIECES[1].afterSvgDataUri,
        },
      ],
    },
    {
      id: "cat-dxb-003",
      pieceType: UAE_SAMPLE_PIECES[2].nameAr,
      karat: "18K White Gold",
      stylePackTitle: "الألماس العصري النقي (هاي كي)",
      fidelityScore: 0.99,
      fidelityWarning: false,
      date: "أمس 18:45",
      rawInputUrl: UAE_SAMPLE_PIECES[2].beforeSvgDataUri,
      outputs: [
        {
          ratio: "1:1",
          title: "كتالوج واتساب (1:1)",
          url: UAE_SAMPLE_PIECES[2].afterSvgDataUri,
        },
        {
          ratio: "4:5",
          title: "خلاصة انستغرام (4:5)",
          url: UAE_SAMPLE_PIECES[2].afterSvgDataUri,
        },
        {
          ratio: "9:16",
          title: "قصص ستوري (9:16)",
          url: UAE_SAMPLE_PIECES[2].afterSvgDataUri,
        },
      ],
    },
  ];

  const handleWhatsAppShare = (item: CatalogItem) => {
    const text = encodeURIComponent(
      `مرحباً، إليكم صور أحدث قطعة مجوهرات من الكتالوج:\nالقطعة: ${item.pieceType}\nالعيار: ${item.karat}\nالنمط: ${item.stylePackTitle}\nجاهزة للطلب والمشاهدة.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 text-[11px] font-bold tracking-wide">
              خزنة الكتالوج المشفرة
            </span>
            <span className="text-xs text-sand-500 font-mono">Deira Vault</span>
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-900">
            كتالوج المجوهرات الخاص بك
          </h1>
          <p className="text-sand-600 mt-1 text-sm">
            الصور محفوظة بأمان في خزنتك الخاصة بدقة 1080p مخصصة لمنصات التواصل وسوق الذهب.
          </p>
        </div>

        <a
          href="/studio"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm shadow-md transition-colors"
        >
          <span>معالجة قطعة جديدة في الاستوديو</span>
        </a>
      </div>

      {/* Catalog Items Grid */}
      <div className="space-y-10">
        {catalogItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-sand-200 shadow-card"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sand-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    {item.pieceType}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 font-bold border border-gold-300">
                    {item.karat}
                  </span>
                </div>
                <p className="text-xs text-sand-500 mt-0.5">
                  {item.stylePackTitle} • {item.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم فحص الدقة ({(item.fidelityScore * 100).toFixed(0)}%)</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedForCompare(item);
                    setInspectMode("slider");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand-300 hover:bg-sand-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-gold-600" />
                  <span>فحص 200% قبل / بعد</span>
                </button>
              </div>
            </div>

            {/* Three Ratios Output Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {item.outputs.map((out) => (
                <div
                  key={out.ratio}
                  className="flex flex-col rounded-2xl border border-sand-200 overflow-hidden bg-sand-50/60"
                >
                  <div className="p-3 bg-white border-b border-sand-200 flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{out.title}</span>
                    <span className="text-sand-400 font-normal">{out.ratio}</span>
                  </div>

                  <div className="relative aspect-square flex items-center justify-center p-3">
                    <img
                      src={out.url}
                      alt={out.title}
                      className="max-h-full max-w-full rounded-xl object-contain shadow-sm"
                    />
                  </div>

                  <div className="p-3 bg-white border-t border-sand-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppShare(item)}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </button>

                    <a
                      href={out.url}
                      download={`jewelleray_${item.id}_${out.ratio}.svg`}
                      className="py-2 px-3 rounded-lg border border-sand-300 hover:bg-sand-100 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 200% Zoom Compare Modal with Loupe Inspection */}
      {selectedForCompare && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto relative shadow-2xl">
            <button
              aria-label="close-modal-icon"
              onClick={() => setSelectedForCompare(null)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-sand-100 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="font-heading font-black text-xl text-slate-900">
                مقارنة دقة القطعة وتفاصيل العيار (Zoom Compare)
              </h3>
              <p className="text-xs text-sand-500 mt-0.5">
                {selectedForCompare.pieceType} • {selectedForCompare.karat}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 mb-4 p-1 bg-sand-100 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setInspectMode("slider")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  inspectMode === "slider"
                    ? "bg-white text-gold-950 shadow-sm"
                    : "text-sand-600 hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-gold-600" />
                <span>شريط المقارنة قبل / بعد</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectMode("loupe")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  inspectMode === "loupe"
                    ? "bg-white text-gold-950 shadow-sm"
                    : "text-sand-600 hover:text-slate-900"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-gold-600" />
                <span>عدسة الصائغ 250% (Jeweller&apos;s Loupe)</span>
              </button>
            </div>

            {inspectMode === "slider" ? (
              <BeforeAfterSlider
                beforeImage={selectedForCompare.rawInputUrl}
                afterImage={selectedForCompare.outputs[0].url}
                beforeLabel="الصورة الأصلية"
                afterLabel="الكتالوج النهائي"
                fidelityScore={selectedForCompare.fidelityScore}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/5 border border-sand-200">
                <MagnifyingLoupe
                  imageSrc={selectedForCompare.outputs[0].url}
                  alt={selectedForCompare.pieceType}
                  zoomLevel={2.5}
                  lensSize={170}
                  className="max-h-80 object-contain shadow-md"
                />
                <p className="mt-2 text-[11px] text-sand-500">
                  حرك المؤشر أو إصبعك فوق الحجر ونقوش الذهب لفحص عيار الصياغة
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedForCompare(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
