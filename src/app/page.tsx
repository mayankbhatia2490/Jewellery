"use client";

import React, { useState } from "react";
import { BRAND_NAME, BRAND_CONFIG } from "@/config/brand";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { UAE_SAMPLE_PIECES } from "@/lib/assets/sample-pieces";
import {
  Sparkles,
  Camera,
  Layers,
  ShieldCheck,
  Share2,
  PhoneCall,
  CheckCircle,
  ArrowRight,
  Globe,
} from "lucide-react";

export default function HomePage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [selectedPieceId, setSelectedPieceId] = useState<string>("sample-choker-22k");
  const isAr = lang === "ar";

  const activePiece =
    UAE_SAMPLE_PIECES.find((p) => p.id === selectedPieceId) || UAE_SAMPLE_PIECES[0];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-sand-50 selection:bg-gold-200">
      {/* Navigation Sub-Bar with Language Switcher */}
      <div className="bg-sand-100/60 border-b border-sand-200 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-sand-700">
            <span>📍</span>
            <span>
              {isAr
                ? "مبني خصيصاً لأسواق الذهب في دبي والشارقة وأبوظبي"
                : "Engineered specifically for UAE Gold Souks & Independent Jewellers"}
            </span>
          </div>
          <button
            onClick={() => setLang(isAr ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-sand-300 font-semibold text-slate-800 hover:bg-sand-50"
          >
            <Globe className="w-3.5 h-3.5 text-gold-600" />
            <span>{isAr ? "English" : "العربية (RTL)"}</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold mb-6 border border-gold-300">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>
                {isAr
                  ? "محرك التصوير الفاخر للمجوهرات — الإصدار الأول"
                  : "Luxury UAE Jewellery Studio Engine — v1.0"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-heading font-black text-slate-900 tracking-tight leading-[1.15]">
              {isAr ? (
                <>
                  صورة واحدة بالهاتف. <br />
                  <span className="text-gold-600">طقم كتالوج خليجي</span> خلال دقائق.
                </>
              ) : (
                <>
                  One phone photo in. <br />
                  <span className="text-gold-600">Full UAE catalog set out,</span> in minutes.
                </>
              )}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-sand-700 leading-relaxed max-w-xl">
              {isAr
                ? "ارفع صورة خام لقطعة المجوهرات من هاتفك، اختر العيار ونمط العرض والتأطير، واحصل فوراً على صور كتالوج مخصصة لواتساب وانستغرام مع تثبيت لون ذهب 21 و 22 قيراط بدقة متناهية."
                : "Upload a single smartphone photo of your jewellery. Choose metal karat, backdrop style, and modest UAE editorial framing. Deliver high-res WhatsApp and Instagram catalog sets with verified gold color anchor."}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <a
                href="/studio"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-lg shadow-luxury transition-all text-center flex items-center justify-center gap-2"
              >
                <span>{isAr ? "ابدأ التجربة المجانية (10 رصيد)" : "Launch Studio (10 Free Credits)"}</span>
                <ArrowRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
              </a>

              <a
                href={BRAND_CONFIG.conciergeWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl border border-sand-300 hover:bg-sand-100 text-slate-800 font-semibold text-center flex items-center justify-center gap-2 text-base"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "أرسل 20 قطعة (خدمة الكونسيرج)" : "Send Us 20 Pieces (WhatsApp)"}</span>
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-sand-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "بدون اشتراك شهري إجباري" : "No forced subscriptions"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "استرداد تلقائي عند عدم المطابقة" : "Auto-refund if fidelity fails"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "أسعار بالدرهم الإماراتي" : "All prices in AED"}</span>
              </div>
            </div>
          </div>

          {/* Interactive Before/After Drag Slider Showcase */}
          <div className="lg:col-span-6">
            <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-card border border-sand-200">
              {/* Sample Piece Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 mb-4 rounded-xl bg-sand-100 overflow-x-auto">
                {UAE_SAMPLE_PIECES.map((piece) => {
                  const isSelected = selectedPieceId === piece.id;
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      onClick={() => setSelectedPieceId(piece.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        isSelected
                          ? "bg-white text-gold-950 shadow-sm border border-gold-300"
                          : "text-sand-600 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      {isAr ? piece.nameAr : piece.nameEn}
                    </button>
                  );
                })}
              </div>

              <BeforeAfterSlider
                beforeImage={activePiece.beforeSvgDataUri}
                afterImage={activePiece.afterSvgDataUri}
                beforeLabel={isAr ? "صورة الهاتف العادية" : "Smartphone Photo"}
                afterLabel={isAr ? "كتالوج الذهب الخليجي" : "UAE Studio Output"}
                fidelityStatus="pass"
                fidelityScore={0.98}
                dir={isAr ? "rtl" : "ltr"}
              />

              <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-sand-600">
                  <span className="font-semibold text-slate-800">
                    {isAr ? activePiece.nameAr : activePiece.nameEn}
                  </span>
                  <span>•</span>
                  <span>{activePiece.weightGrams}g</span>
                  <span>•</span>
                  <span className="font-bold text-gold-700">
                    AED {activePiece.priceAed.toLocaleString()}
                  </span>
                </div>
                <a
                  href="/studio"
                  className="text-gold-700 hover:text-gold-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>{isAr ? "جرّب هذه القطعة في الاستوديو" : "Open in Studio"}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="bg-white border-y border-sand-200 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-heading font-black text-slate-900">
              {isAr
                ? "لماذا يفضل تجار سوق الذهب هذا الاستوديو؟"
                : "Engineered specifically for the Gulf jewellery trade"}
            </h2>
            <p className="mt-3 text-sand-600">
              {isAr
                ? "معالجة هجينة صممت لتفادي عيوب الذكاء الاصطناعي التقليدي والحفاظ على أدق تفاصيل الصياغة والعيار."
                : "Hybrid pipeline preserving true piece geometry, avoiding generative hallucinations, and calibrated for 21K/22K Gulf gold."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                {isAr ? "محرك المطابقة الفائقة (Fidelity-First)" : "Fidelity-First Engine"}
              </h3>
              <p className="text-sm text-sand-600 leading-relaxed">
                {isAr
                  ? "الحفاظ الكامل على بكسلات القطعة الأصلية دون تشويه تفاصيل الفصوص أو تغيير أبعاد ونقوش الصياغة."
                  : "Preserves exact segmented original pixels for product shots with zero hallucination of gemstones or motifs."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                {isAr ? "معايرة ذهب 21 و 22 قيراط" : "21K & 22K Gold Calibration"}
              </h3>
              <p className="text-sm text-sand-600 leading-relaxed">
                {isAr
                  ? "تثبيت طيف اللون الذهبي الدافئ المميز للأسواق الخليجية حتى لا يتحول الذهب إلى أصفر باهت عيار 14."
                  : "Explicit karat metadata anchors warm Gulf hues so 22K pieces never wash out into pale 14K yellow."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                {isAr ? "تأطير خليجي محتشم ومدروس" : "Modest Editorial Cropped Personas"}
              </h3>
              <p className="text-sm text-sand-600 leading-relaxed">
                {isAr
                  ? "تأطير سينمائي محتشم للعباءة والشيلة أو الأقمشة التراثية يركز على العنق والمعصم دون وجوه مصطنعة."
                  : "Culturally resonant high-res neck, ear, and wrist framings without uncanny, generic AI faces."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                {isAr ? "جاهز لكتالوج الواتساب وانستغرام" : "WhatsApp & Instagram Ready"}
              </h3>
              <p className="text-sm text-sand-600 leading-relaxed">
                {isAr
                  ? "تصدير فوري بنسب 1:1 و 4:5 و 9:16 مع مساحات أمان خالية لشارات العيار والوزن والسعر."
                  : "Delivers 1:1 (WhatsApp Catalog), 4:5 (Feed), and 9:16 (Story with safe zones) in one tap."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Packages & Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block px-3 py-1 bg-gold-100 text-gold-900 rounded-full text-xs font-bold mb-3 border border-gold-300">
            {isAr ? "أسعار واضحة وشاملة لضريبة القيمة المضافة" : "Transparent UAE VAT-Inclusive Pricing"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900">
            {isAr ? "باقات الرصيد بالدرهم الإماراتي" : "Credit Packages in AED"}
          </h2>
          <p className="mt-3 text-sand-600">
            {isAr
              ? "كل رصيد يمنحك طقماً كاملاً (3 مقاسات: واتساب، انستغرام، وقصص ستوري) مع فحص الجودة التلقائي."
              : "1 Credit = 1 Full 3-Ratio Catalog Set (1:1, 4:5, 9:16) with automated fidelity gate."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter 50 */}
          <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sand-500">
                {isAr ? "للمتاجر المستقلة" : "Independent Boutiques"}
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-900 mt-1">
                {isAr ? "الباقة الأساسية (50 رصيد)" : "Starter Pack (50 Credits)"}
              </h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-heading font-black text-slate-900">199</span>
                <span className="text-sm font-semibold text-sand-600">AED</span>
              </div>
              <div className="text-xs text-sand-500 mt-1">
                {isAr ? "شامل 5% ضريبة القيمة المضافة (189.52 + 9.48 درهم)" : "VAT Inclusive (Net 189.52 + 9.48 VAT)"}
              </div>
              <ul className="mt-6 space-y-3 text-sm text-sand-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>50 طقم كتالوج احترافي</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>جميع أنماط الخلفيات السبعة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>تصدير فوري للواتساب</span>
                </li>
              </ul>
            </div>
            <a
              href="/account"
              className="mt-8 block text-center py-3 px-4 rounded-xl border border-gold-500 text-gold-700 hover:bg-gold-50 font-bold transition-colors"
            >
              {isAr ? "شراء الباقة" : "Purchase Pack"}
            </a>
          </div>

          {/* Pro 200 */}
          <div className="bg-white rounded-3xl p-8 border-2 border-gold-500 shadow-luxury flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold-500 text-white text-xs font-bold py-1 px-4 rounded-full uppercase tracking-wider">
              {isAr ? "الأكثر طلباً في سوق الذهب" : "Most Popular in Souk"}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                {isAr ? "لتجار التجزئة النشطين" : "Active Retailers"}
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-900 mt-1">
                {isAr ? "باقة المحترفين (200 رصيد)" : "Pro Jeweller (200 Credits)"}
              </h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-heading font-black text-slate-900">599</span>
                <span className="text-sm font-semibold text-sand-600">AED</span>
              </div>
              <div className="text-xs text-sand-500 mt-1">
                {isAr ? "شامل 5% ضريبة القيمة المضافة (570.48 + 28.52 درهم)" : "VAT Inclusive (Net 570.48 + 28.52 VAT)"}
              </div>
              <ul className="mt-6 space-y-3 text-sm text-sand-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>200 طقم كتالوج احترافي</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>شارة المواصفات بالدرهم والجرام</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>أولوية في طابور المعالجة السريعة</span>
                </li>
              </ul>
            </div>
            <a
              href="/account"
              className="mt-8 block text-center py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold transition-colors shadow-md"
            >
              {isAr ? "شراء باقة المحترفين" : "Purchase Pro Pack"}
            </a>
          </div>

          {/* Enterprise 1000 */}
          <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sand-500">
                {isAr ? "للمصانع وكبار الموزعين" : "Manufacturers & Wholesalers"}
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-900 mt-1">
                {isAr ? "باقة سوق الذهب (1000 رصيد)" : "Souk Enterprise (1000 Credits)"}
              </h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-heading font-black text-slate-900">1,999</span>
                <span className="text-sm font-semibold text-sand-600">AED</span>
              </div>
              <div className="text-xs text-sand-500 mt-1">
                {isAr ? "شامل 5% ضريبة القيمة المضافة (1903.81 + 95.19 درهم)" : "VAT Inclusive (Net 1903.81 + 95.19 VAT)"}
              </div>
              <ul className="mt-6 space-y-3 text-sm text-sand-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>1000 طقم كتالوج عالي الدقة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>خدمة المعالجة بالجملة (Concierge)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  <span>مدير حساب مخصص عبر واتساب دبي</span>
                </li>
              </ul>
            </div>
            <a
              href="/account"
              className="mt-8 block text-center py-3 px-4 rounded-xl border border-gold-500 text-gold-700 hover:bg-gold-50 font-bold transition-colors"
            >
              {isAr ? "شراء باقة كبار التجار" : "Purchase Enterprise"}
            </a>
          </div>
        </div>
      </section>

      {/* Done-For-You Bulk Concierge Banner */}
      <section className="bg-majlis-navy text-white py-16">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold mb-3 border border-gold-500/30">
              <span>🇦🇪</span>
              <span>{isAr ? "خدمة مخصصة لتجار سوق ديرة والشارقة" : "Concierge Service for Deira & Sharjah Retailers"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black">
              {isAr ? "مشغول في المحل؟ أرسل لنا 20 قطعة عبر الواتساب" : "Busy in the shop? Send us 20 pieces via WhatsApp"}
            </h2>
            <p className="mt-2 text-sand-300 text-sm max-w-xl">
              {isAr
                ? "فريقنا في دبي يقوم بمعالجة الصور وتجهيز الكتالوج بالكامل وإرساله لك جاهزاً للنشر."
                : "Our Dubai studio team processes, calibrates, and delivers full catalog sets ready to publish."}
            </p>
          </div>
          <a
            href={BRAND_CONFIG.conciergeWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-base whitespace-nowrap shadow-luxury transition-all flex items-center gap-2"
          >
            <PhoneCall className="w-5 h-5" />
            <span>{isAr ? "تواصل عبر واتساب الاستوديو" : "Connect on WhatsApp"}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
