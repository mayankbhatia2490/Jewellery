import { BRAND_NAME, BRAND_CONFIG } from "@/config/brand";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-semibold mb-6 border border-gold-300">
        <span>🇦🇪</span>
        <span>مخصص لأسواق الذهب في الإمارات (ديرة، الشارقة، مجمع الذهب والألماس)</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-heading font-black text-slate-900 tracking-tight leading-tight">
        صورة واحدة بالهاتف. <br />
        <span className="text-gold-600">طقم كتالوج احترافي</span> خلال دقائق.
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-sand-700 max-w-2xl mx-auto">
        ارفع صورة خام لقطعة المجوهرات واحصل على صور كتالوج فاخرة بدقة متناهية مع تثبيت عيار الذهب (21K / 22K) والتأطير الخليجي التراثي والعصري.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="/studio"
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-lg shadow-luxury transition-all transform hover:-translate-y-0.5"
        >
          ابدأ التجربة المجانية (10 رصيد)
        </a>
        <a
          href={BRAND_CONFIG.conciergeWhatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto px-8 py-4 rounded-xl border border-sand-300 hover:bg-sand-100 text-slate-800 font-semibold text-lg transition-all"
        >
          أرسل لنا 20 قطعة (خدمة الكونسيرج)
        </a>
      </div>
    </div>
  );
}
