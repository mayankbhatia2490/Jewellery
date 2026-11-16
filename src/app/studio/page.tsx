"use client";

import React, { useState } from "react";
import {
  Upload,
  Sparkles,
  CheckCircle,
  Tag,
  Loader2,
  AlertCircle,
  Check,
  Search,
} from "lucide-react";
import { PieceType, MetalKarat, StylePackId, ModelPersona } from "@/types";
import { UAE_SAMPLE_PIECES, SamplePiecePreset } from "@/lib/assets/sample-pieces";
import { MagnifyingLoupe } from "@/components/ui/magnifying-loupe";

export default function StudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const [pieceType, setPieceType] = useState<PieceType>("necklace");
  const [metalKarat, setMetalKarat] = useState<MetalKarat>("21K_yellow");
  const [stylePackId, setStylePackId] = useState<StylePackId>("gulf_gold_classic");
  const [modelPersona, setModelPersona] = useState<ModelPersona>("none_product_only");

  // Spec Badge State
  const [specBadgeEnabled, setSpecBadgeEnabled] = useState(true);
  const [weightGrams, setWeightGrams] = useState<string>("8.5");
  const [sku, setSku] = useState<string>("DXB-GLD-01");
  const [priceAed, setPriceAed] = useState<string>("2450");

  // Progress State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setSelectedPresetId(null);
      setError(null);
    }
  };

  const handleSelectPreset = (preset: SamplePiecePreset) => {
    setSelectedPresetId(preset.id);
    const svgContent = preset.svgDataUri.replace(/^data:image\/svg\+xml;utf8,/, "");
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const sampleFile = new File([blob], `${preset.id}.svg`, { type: "image/svg+xml" });
    setFile(sampleFile);
    setPreviewUrl(preset.svgDataUri);
    setPieceType(preset.pieceType);
    setMetalKarat(preset.metalKarat as MetalKarat);
    setStylePackId(preset.suggestedStylePack as StylePackId);
    setModelPersona(preset.suggestedPersona as ModelPersona);
    setWeightGrams(preset.weightGrams.toString());
    setSku(preset.sku);
    setPriceAed(preset.priceAed.toLocaleString());
    setSpecBadgeEnabled(true);
    setError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("يرجى اختيار صورة لقطعة المجوهرات أولاً.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setCurrentStep("جاري رفع الصورة وفحص الجودة ونزع بيانات GPS...");

    try {
      // 1. Upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pieceType", pieceType);
      formData.append("metalKarat", metalKarat);
      formData.append("stylePackId", stylePackId);
      formData.append("modelPersona", modelPersona);
      formData.append("specBadgeEnabled", String(specBadgeEnabled));
      if (specBadgeEnabled) {
        formData.append("weightGrams", weightGrams);
        formData.append("sku", sku);
        formData.append("priceAed", priceAed);
      }

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "فشل رفع الصورة");
      }

      const jobId = uploadData.jobId;
      setCurrentStep("جاري معالجة الإضاءة وضبط العيار وتوليد المقاسات الثلاثة...");

      // 2. Trigger Worker
      const workerRes = await fetch(`/api/jobs/${jobId}`, {
        method: "POST",
      });
      const workerData = await workerRes.json();

      if (!workerRes.ok || workerData.status === "failed") {
        throw new Error(workerData.error || "فشلت معالجة الصورة في الاستوديو");
      }

      setCurrentStep("اكتمل طقم الكتالوج بنجاح!");
      setCompletedJobId(jobId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" dir="rtl">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 text-[11px] font-bold tracking-wide">
            استوديو الصياغة الذكي v2.0
          </span>
          <span className="text-xs text-sand-500 font-mono">Deira Souk Atelier</span>
        </div>
        <h1 className="text-3xl font-heading font-black text-slate-900">
          استوديو المجوهرات الذكي
        </h1>
        <p className="text-sand-600 mt-1 text-sm">
          حول صورة الهاتف العادية إلى طقم كتالوج متكامل (1:1 واتساب، 4:5 انستغرام، 9:16 ستوري) بدقة الحجر والتخريم.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {completedJobId && (
        <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-base">تم إنشاء طقم الكتالوج بنجاح!</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                تم اجتياز فحص مطابقة القطعة (Fidelity Gate) وحفظ الأبعاد الثلاثة.
              </p>
            </div>
          </div>
          <a
            href="/catalog"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            مشاهدة وتحميل من الكتالوج
          </a>
        </div>
      )}

      {/* 1-Click Souk Presets Picker */}
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-sand-50 to-gold-50/30 border border-gold-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-600" />
            <h3 className="text-xs font-bold text-slate-900">
              جرّب فوراً بنقرة واحدة — عينات أصلية من أسواق الذهب (ديرة والشارقة)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-gold-700">1-Click Live Test</span>
        </div>
        <p className="text-xs text-sand-600 mb-3">
          اختر أي قطعة من عينات السوق لتعبئة الصورة والمواصفات ونمط العرض فوراً دون الحاجة لرفع صورة من هاتفك:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {UAE_SAMPLE_PIECES.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-gold-500 bg-gold-100/70 shadow-sm ring-2 ring-gold-400/50"
                    : "border-sand-200 bg-white hover:border-gold-300 hover:bg-gold-50/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gold-200 text-gold-950">
                    {preset.metalKarat.replace("_yellow", "K").replace("_white", "K White").replace("_rose", "K Rose")}
                  </span>
                  <span className="text-[10px] font-medium text-sand-600">{preset.weightGrams}g</span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {preset.nameAr}
                </div>
                <div className="text-[10px] text-sand-500 truncate mt-0.5">
                  {preset.nameEn}
                </div>
                <div className="text-[11px] font-bold text-gold-800 mt-2">
                  AED {preset.priceAed.toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Upload & Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Upload Box */}
          <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-card">
            <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>1. صورة القطعة (كاميرا الهاتف أو العينة المختارة)</span>
              <span className="text-xs font-normal text-sand-500">JPEG, PNG, WebP, HEIC (حتى 15MB)</span>
            </label>

            {previewUrl ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full p-4 rounded-xl bg-slate-950/5 border border-sand-200 flex flex-col items-center justify-center">
                  <MagnifyingLoupe
                    imageSrc={previewUrl}
                    alt="Upload Preview"
                    zoomLevel={2.5}
                    lensSize={160}
                    className="max-h-64 object-contain shadow-sm"
                  />
                  <div className="mt-2 text-center text-[11px] text-sand-500 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-gold-600" />
                    <span>مرر مؤشر الفأرة أو إصبعك فوق الصورة لفحص تفاصيل الصياغة بعدسة 250%</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <label className="text-xs font-bold text-gold-700 hover:text-gold-800 cursor-pointer">
                    تغيير الصورة من جهازك
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sand-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setSelectedPresetId(null);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    حذف الصورة
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-sand-300 hover:border-gold-500 rounded-xl p-8 text-center bg-sand-50/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center py-4">
                  <div className="w-12 h-12 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">اسحب صورة القطعة هنا أو اضغط للاختيار</p>
                  <p className="text-xs text-sand-500 mt-1">
                    يتم نزع بيانات الموقع (GPS) وتدوير الصورة تلقائياً لحماية خصوصية المحل
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Piece Type Selection */}
          <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-card">
            <label className="block text-sm font-bold text-slate-900 mb-3">
              2. نوع قطعة المجوهرات
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: "necklace", label: "عقد / قلادة" },
                { id: "ring", label: "خاتم / دبلة" },
                { id: "earrings", label: "حلق / أقراط" },
                { id: "bangle_bracelet", label: "سوار / بناجر" },
                { id: "bridal_set", label: "طقم عروس" },
                { id: "pendant", label: "تعليقة" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPieceType(item.id as PieceType)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    pieceType === item.id
                      ? "border-gold-500 bg-gold-50 text-gold-900 shadow-sm"
                      : "border-sand-200 hover:bg-sand-50 text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Metal & Karat Selection */}
          <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-card">
            <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>3. العيار والمعدن (معايرة اللون الخليجي)</span>
              <span className="text-xs text-gold-700 font-semibold">تثبيت لون عيار 21K و 22K</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: "22K_yellow", label: "ذهب عيار 22 خليجي", color: "bg-[#eab308]" },
                { id: "21K_yellow", label: "ذهب عيار 21 خليجي", color: "bg-[#ca8a04]" },
                { id: "18K_yellow", label: "ذهب أصفر عيار 18", color: "bg-[#facc15]" },
                { id: "18K_white", label: "ذهب أبيض عيار 18", color: "bg-[#e2e8f0]" },
                { id: "18K_rose", label: "ذهب وردي عيار 18", color: "bg-[#fda4af]" },
                { id: "platinum_silver", label: "بلاتين / فضة", color: "bg-[#cbd5e1]" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetalKarat(m.id as MetalKarat)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                    metalKarat === m.id
                      ? "border-gold-500 bg-gold-50 text-gold-950 shadow-sm"
                      : "border-sand-200 hover:bg-sand-50 text-slate-700"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border border-black/10 ${m.color}`} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Backdrop Style Pack */}
          <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-card">
            <label className="block text-sm font-bold text-slate-900 mb-3">
              4. نمط الخلفية والعرض (Style Pack)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "gulf_gold_classic",
                  title: "كلاسيك الذهب الخليجي",
                  desc: "حجر الترافرتين الرملي وإضاءة مجلس هادئة ودافئة",
                },
                {
                  id: "bridal_set",
                  title: "أطقم العرائس الملكية",
                  desc: "قاعدة مخملية زمردية فاخرة مخصصة للأطقم الكبيرة",
                },
                {
                  id: "heritage_filigree",
                  title: "تراث الصياغة والنقش",
                  desc: "إضاءة ماكرو تبرز دقة التخريم وحبيبات الذهب الدقيقة",
                },
                {
                  id: "diamond_minimal",
                  title: "الألماس العصري النقي",
                  desc: "استوديو هندسي أبيض عالي النقاوة للذهب الأبيض",
                },
                {
                  id: "occasion_ramadan_eid",
                  title: "أجواء رمضان والأعياد",
                  desc: "ظلال فوانيس هندسية وأجواء سمر مسائية ساحرة",
                },
                {
                  id: "occasion_national_day_dsf",
                  title: "اليوم الوطني ومهرجان التسوق",
                  desc: "خلفيات احتفالية باللون الأسود الملكي ورسومات الذهب",
                },
                {
                  id: "social_story",
                  title: "قصص انستغرام وكتالوج واتساب",
                  desc: "تكوين رأسي مخصص لمساحات الأمان وكتابة الأسعار",
                },
              ].map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => setStylePackId(pack.id as StylePackId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    stylePackId === pack.id
                      ? "border-gold-500 bg-gold-50/70 shadow-sm"
                      : "border-sand-200 hover:bg-sand-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{pack.title}</span>
                    {stylePackId === pack.id && (
                      <Check className="w-4 h-4 text-gold-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-sand-600 mt-1 leading-normal">{pack.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Buyer Persona, Spec Badge, and Action */}
        <div className="lg:col-span-5 space-y-6">
          {/* 5. Buyer Persona & Cropped Framing */}
          <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-card">
            <label className="block text-sm font-bold text-slate-900 mb-1">
              5. فئة المشتري والتأطير الإماراتي
            </label>
            <p className="text-xs text-sand-500 mb-3">
              تأطير محتشم (عنق، معصم، ياقة) دون وجوه مصطنعة
            </p>

            <div className="space-y-2">
              {[
                {
                  id: "none_product_only",
                  title: "عرض القطعة فقط (بدون عارضة)",
                  desc: "تمثال مخملي أو قاعدة حجرية هادئة (الأكثر دقة)",
                },
                {
                  id: "khaleeji_modest",
                  title: "تأطير خليجي محتشم",
                  desc: "شيلة شيفون وعباءة حريرية سوداء حول العنق",
                },
                {
                  id: "south_asian_festive",
                  title: "تأطير المناسبات التراثية",
                  desc: "ساري حريري مطرز أو نقش حناء ناعم للمعصم",
                },
                {
                  id: "levantine_modern",
                  title: "تأطير عصري كلاسيكي",
                  desc: "ياقة شتوية حريرية أو بليزر سهرة أنيق",
                },
                {
                  id: "luxury_minimal",
                  title: "تأطير المينيمال الفاخر",
                  desc: "كتان طبيعي محايد مخصص للألماس والسوليتير",
                },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setModelPersona(p.id as ModelPersona)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    modelPersona === p.id
                      ? "border-gold-500 bg-gold-50/70 shadow-sm"
                      : "border-sand-200 hover:bg-sand-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{p.title}</span>
                    {modelPersona === p.id && <Check className="w-4 h-4 text-gold-600" />}
                  </div>
                  <p className="text-[11px] text-sand-600 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. UAE Spec Badge Overlay */}
          <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-600" />
                <span>شارة المواصفات الإماراتية</span>
              </label>
              <input
                type="checkbox"
                checked={specBadgeEnabled}
                onChange={(e) => setSpecBadgeEnabled(e.target.checked)}
                className="w-4 h-4 text-gold-600 rounded border-sand-300 focus:ring-gold-500"
              />
            </div>
            <p className="text-xs text-sand-500 mb-4">
              إضافة شارة أنيقة غير مدمرة في زاوية الصورة توضح العيار والوزن بالجرام والسعر بالدرهم (شامل ضريبة القيمة المضافة 5%)
            </p>

            {specBadgeEnabled && (
              <div className="space-y-3 pt-2 border-t border-sand-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-sand-700 block mb-1">
                      الوزن (جرام)
                    </label>
                    <input
                      type="text"
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(e.target.value)}
                      placeholder="8.5"
                      className="w-full px-3 py-1.5 rounded-lg border border-sand-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-sand-700 block mb-1">
                      رمز القطعة (SKU)
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="DXB-GLD-01"
                      className="w-full px-3 py-1.5 rounded-lg border border-sand-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-sand-700 block mb-1">
                    السعر التقديري (AED)
                  </label>
                  <input
                    type="text"
                    value={priceAed}
                    onChange={(e) => setPriceAed(e.target.value)}
                    placeholder="2,450"
                    className="w-full px-3 py-1.5 rounded-lg border border-sand-200 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Button & Status */}
          <div className="bg-sand-100 p-6 rounded-2xl border border-sand-200 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:bg-sand-400 text-white font-bold text-base shadow-luxury transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{currentStep || "جاري المعالجة..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>إنشاء طقم الكتالوج (خصم رصيد 1)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-sand-600 mt-2">
              استرداد تلقائي فوري للرصيد إذا لم تجتز النتيجة معايير الدقة
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
