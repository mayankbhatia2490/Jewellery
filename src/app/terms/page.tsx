import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
      {/* UAE Lawyer Review Alert */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm">
            مسودة شروط الاستخدام — تتطلب مراجعة قانونية متخصصة في دولة الإمارات العربية المتحدة
          </h3>
          <p className="text-xs text-amber-800 mt-1">
            DRAFT — UAE lawyer review required before commercial release under UAE Federal Laws.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            وثيقة الشروط والأحكام التجارية
          </span>
          <h1 className="text-3xl font-heading font-black text-slate-900 mt-1">
            شروط وأحكام منصة {BRAND_CONFIG.name}
          </h1>
          <p className="text-xs text-sand-500 mt-1">آخر تحديث: نوفمبر 2026 • دبي، الإمارات العربية المتحدة</p>
        </div>

        {/* 1. Ownership */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>1. الملكية التجارية الكاملة للتاجر (100% Client Ownership)</span>
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            يحتفظ تاجر المجوهرات بكامل حقوق الملكية الفكرية والتجارية للصور المرفوعة ولكافة مخرجات الكتالوج المنتجة عبر المنصة. لا تطالب المنصة بأي حقوق ملكية تجارية أو حقوق نشر في تصميمات المجوهرات الخاصة بكم.
          </p>
          <p className="text-xs text-sand-500 italic" dir="ltr">
            The merchant retains 100% exclusive commercial and intellectual property ownership of all uploaded jewellery photographs and all resulting catalog outputs.
          </p>
        </section>

        {/* 2. No Model Training */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>2. عدم استخدام الصور لتدريب النماذج (Zero AI Model Training)</span>
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            تتعهد المنصة بشكل صارم بعدم استخدام صور المجوهرات أو تصميمات القطع المرفوعة لتدريب نماذج الذكاء الاصطناعي العامة أو الترويجية دون موافقة كتابية مسبقة وصريحة من صاحب المحل.
          </p>
          <p className="text-xs text-sand-500 italic" dir="ltr">
            Uploaded pieces and design photos are strictly isolated and never utilized for artificial intelligence model training or public marketing without explicit prior written consent.
          </p>
        </section>

        {/* 3. Pricing and VAT */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900">
            3. الأسعار وضريبة القيمة المضافة (Pricing & 5% UAE VAT)
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            جميع الأسعار المعلنة على المنصة معروضة بالدرهم الإماراتي (AED) وهي شاملة لضريبة القيمة المضافة الاتحادية بنسبة 5% بموجب قوانين الهيئة الاتحادية للضرائب في دولة الإمارات العربية المتحدة. يتم إصدار فاتورة ضريبية رسمية لكل عملية شراء.
          </p>
        </section>

        {/* 4. Automated Refund Policy */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900">
            4. سياسة الاسترداد الفوري لضمان الجودة (Automated Quality Refund)
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            في حال عدم اجتياز الصورة المنتجة لمعايير مطابقة القطعة (Fidelity Gate) أو حدوث انحراف في لون العيار الخليجي، يتم استرداد الرصيد المخصوم تلقائياً وفورياً إلى حساب التاجر دون أي شروط.
          </p>
        </section>

        {/* 5. Jurisdiction */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-900">
            5. الاختصاص القضائي والقانون الواجب التطبيق
          </h2>
          <p className="text-sm text-sand-700 leading-relaxed">
            تخضع هذه الشروط وتفسر وفقاً للقوانين واللوائح الاتحادية المعمول بها في دولة الإمارات العربية المتحدة، وتختص محاكم دبي بالنظر في أي نزاع قد ينشأ عنها.
          </p>
        </section>
      </div>
    </div>
  );
}
