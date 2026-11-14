import React from "react";
import { AlertTriangle, Lock, Trash2, EyeOff, Shield } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
      {/* UAE Lawyer Review Alert */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm">
            مسودة سياسة الخصوصية وحماية البيانات — تتطلب مراجعة قانونية متخصصة في دولة الإمارات
          </h3>
          <p className="text-xs text-amber-800 mt-1">
            DRAFT — UAE lawyer review required under UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            حماية البيانات والخصوصية وفق القانون الإماراتي
          </span>
          <h1 className="text-3xl font-heading font-black text-slate-900 mt-1">
            سياسة الخصوصية وحماية البيانات (PDPL)
          </h1>
          <p className="text-xs text-sand-500 mt-1">
            الامتثال لقانون حماية البيانات الشخصية الإماراتي رقم 45 لسنة 2021
          </p>
        </div>

        {/* 1. EXIF and GPS Stripping */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-emerald-600" />
            <span>1. التجريد التلقائي لبيانات الموقع الجغرافي (EXIF & GPS Stripping)</span>
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            لحماية سرية مواقع المتاجر ومقرات الورش، يقوم نظامنا تلقائياً وبشكل فوري عند الرفع بنزع وحذف كافة بيانات EXIF وبيانات الموقع الجغرافي (GPS) ومعلومات طراز الهاتف والكاميرا قبل تخزين أي صورة في الخزنة الخاصة.
          </p>
          <p className="text-xs text-sand-500 italic" dir="ltr">
            All EXIF, camera, and GPS metadata are automatically scrubbed and stripped at upload to safeguard workshop and boutique confidentiality.
          </p>
        </section>

        {/* 2. Private Storage Vaults */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>2. التخزين المعزول في خزنات خاصة (Private Vault Isolation)</span>
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            تُخزن جميع الصور في حاويات سحابية خاصة ومشفرة، ولا يمكن الوصول إليها إلا عبر روابط مؤقتة وموقعة رقمياً تنتهي صلاحيتها خلال 15 دقيقة. تمنع سياسات أمان قاعدة البيانات (RLS) أي مستخدم من الوصول لصور متجر آخر.
          </p>
        </section>

        {/* 3. 30-Day Auto Expiry */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-600" />
            <span>3. دورة حياة البيانات والحذف التلقائي بعد 30 يوماً (Data Lifecycle)</span>
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            يتم حذف صور الكتالوج المنتجة تلقائياً وبشكل نهائي بعد مرور 30 يوماً من تاريخ المعالجة، ما لم يقم التاجر بتمييزها كـ &quot;محفوظة في الكتالوج الدائم&quot;. يهدف هذا الإجراء لتقليل تخزين البيانات غير الضرورية وفق مبادئ الحد الأدنى للبيانات.
          </p>
        </section>

        {/* 4. Right to Erasure */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <span>4. الحق في المحو الفوري للبيانات (Right to Erasure - Article 8)</span>
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            بموجب المادة 8 من قانون حماية البيانات الشخصية الإماراتي، يحق لأي تاجر طلب الحذف الفوري والكامل لكافة صوره وبيانات متجره بنقرة واحدة عبر لوحة الحساب، حيث يقوم النظام فوراً بمسح كافة الملفات الثنائية من وسائط التخزين وإخفاء الهوية.
          </p>
        </section>
      </div>
    </div>
  );
}
