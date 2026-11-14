"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Search,
  Eye,
  Sliders,
  DollarSign,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "packs">("queue");

  const sampleReviewJobs = [
    {
      id: "job-rev-091",
      userPhone: "+971501112233",
      pieceType: "طقم عروس ملكي (عقد + حلق)",
      karat: "22K_yellow",
      stylePack: "bridal_set",
      iouScore: 0.68,
      colorDrift: 24.2,
      status: "needs_review",
      reason: "Slight shape variation: IoU 0.68 in warning range",
      createdAt: "10 دقائق مضت",
    },
    {
      id: "job-rev-092",
      userPhone: "+971505556677",
      pieceType: "سوار ذهب نقش تراثي",
      karat: "21K_yellow",
      stylePack: "heritage_filigree",
      iouScore: 0.62,
      colorDrift: 27.5,
      status: "needs_review",
      reason: "Minor metal tone shift: Delta 27.5 in warning range",
      createdAt: "25 دقيقة مضت",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-2 border border-red-200">
            <span>لوحة تحكم المشرف (Admin Control)</span>
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-900">
            إدارة استوديو المجوهرات وجودة الكتالوج
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "queue"
                ? "bg-gold-500 text-white shadow-sm"
                : "bg-white border border-sand-200 text-slate-700 hover:bg-sand-50"
            }`}
          >
            طابور المراجعة (Needs Review)
          </button>
          <button
            onClick={() => setActiveTab("packs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "packs"
                ? "bg-gold-500 text-white shadow-sm"
                : "bg-white border border-sand-200 text-slate-700 hover:bg-sand-50"
            }`}
          >
            إدارة الأنماط والموجهات (Style Packs)
          </button>
        </div>
      </div>

      {activeTab === "queue" && (
        <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>الصور المحولة للمراجعة اليدوية (Quality Gate Flagged)</span>
            </h2>
            <span className="text-xs text-sand-500">2 قطع بحاجة للتدقيق</span>
          </div>

          <div className="space-y-4">
            {sampleReviewJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-sand-200 bg-sand-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">{job.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      {job.karat}
                    </span>
                    <span className="text-xs text-sand-500">{job.userPhone}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">{job.pieceType}</h3>
                  <div className="mt-2 flex items-center gap-4 text-xs text-sand-600">
                    <span>مقياس التشابه (IoU): <strong>{(job.iouScore * 100).toFixed(0)}%</strong></span>
                    <span>انحراف اللون (Drift): <strong>{job.colorDrift}</strong></span>
                    <span>{job.createdAt}</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1.5 font-medium">{job.reason}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`تم اعتماد القطعة ${job.id} بنجاح وتسليمها للمتجر.`)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد وتسليم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`تم استرداد رصيد المتجر تلقائياً للقطعة ${job.id}.`)}
                    className="px-4 py-2 rounded-xl border border-red-300 hover:bg-red-50 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>إعادة الرصيد وإلغاء</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "packs" && (
        <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-card">
          <h2 className="text-lg font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-gold-600" />
            <span>إدارة وتحديث موجهات الاستوديو (Prompt Versions)</span>
          </h2>
          <p className="text-xs text-sand-600 mb-6">
            جميع الموجهات محصنة ومفصولة تماماً عن واجهة المستخدم وتتم إدارتها عبر جداول versions في قاعدة البيانات.
          </p>

          <div className="space-y-4">
            {[
              {
                id: "gulf_gold_classic",
                title: "Gulf Gold Classic (كلاسيك الذهب الخليجي)",
                version: "v1.2",
                model: "pipeline-a-composite / FLUX Kontext Pro",
                status: "نشط في الإنتاج",
              },
              {
                id: "bridal_set",
                title: "Bridal Set Grand Staging (أطقم العرائس)",
                version: "v1.1",
                model: "pipeline-a-composite / Gemini 3 Pro Image",
                status: "نشط في الإنتاج",
              },
            ].map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-sand-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
                  <div className="text-xs text-sand-500 mt-1">
                    الإصدار: <span className="font-mono font-bold text-gold-700">{p.version}</span> • المستهدف: {p.model}
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
