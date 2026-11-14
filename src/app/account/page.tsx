"use client";

import React, { useState } from "react";
import { Coins, Receipt, Store, Plus, ExternalLink, Printer } from "lucide-react";
import { TaxInvoiceGenerator } from "@/lib/billing/invoice";

export default function AccountPage() {
  const [balance, setBalance] = useState<number>(49);
  const [selectedInvoiceHtml, setSelectedInvoiceHtml] = useState<string | null>(null);

  const sampleOrders = [
    {
      id: "ord-001",
      invoiceNumber: "INV-2026-DXB-0891",
      packageName: "باقة المحترفين (200 رصيد)",
      credits: 200,
      totalAed: 599.0,
      vatAed: 28.52,
      date: "2026-11-10",
      status: "PAID",
    },
    {
      id: "ord-002",
      invoiceNumber: "INV-2026-DXB-0422",
      packageName: "الباقة الأساسية (50 رصيد)",
      credits: 50,
      totalAed: 199.0,
      vatAed: 9.48,
      date: "2026-10-28",
      status: "PAID",
    },
  ];

  const handlePrintInvoice = (order: typeof sampleOrders[0]) => {
    const invoice = TaxInvoiceGenerator.generateInvoice({
      invoiceNumber: order.invoiceNumber,
      userId: "user-uae-seller",
      buyerPhone: "+971501234567",
      companyName: "مجوهرات الذهب الخليجي (سوق ديرة)",
      buyerTrn: "100-8888-9999-0003",
      packageId: "pkg_pro_200",
      packageNameEn: "Pro Jeweller Pack",
      packageNameAr: order.packageName,
      credits: order.credits,
      grossInclusiveAed: order.totalAed,
    });

    const html = TaxInvoiceGenerator.renderHtml(invoice);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-3xl font-heading font-black text-slate-900 mb-8">
        إدارة الحساب والرصيد والفواتير
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Credit Balance Card */}
        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-card">
          <div className="flex items-center justify-between text-sand-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">الرصيد الحالي</span>
            <Coins className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-4xl font-heading font-black text-slate-900">{balance}</div>
          <p className="text-xs text-sand-600 mt-1">رصيد استوديو متاح (يكفي لـ {balance} طقم كتالوج)</p>
          <a
            href="/#pricing"
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>شحن رصيد إضافي</span>
          </a>
        </div>

        {/* Shop Info Card */}
        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-card">
          <div className="flex items-center justify-between text-sand-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">بيانات المتجر</span>
            <Store className="w-5 h-5 text-sand-600" />
          </div>
          <div className="text-base font-bold text-slate-900">مجوهرات الذهب الخليجي</div>
          <div className="text-xs text-sand-600 mt-1 space-y-1">
            <p>سوق الذهب، ديرة، دبي، الإمارات</p>
            <p>الهاتف: +971 50 123 4567</p>
            <p>الرقم الضريبي (TRN): 100-8888-9999-0003</p>
          </div>
        </div>

        {/* Support & Concierge Card */}
        <div className="bg-majlis-navy text-white p-6 rounded-3xl shadow-card flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
              خدمة المعالجة السريعة
            </div>
            <div className="text-base font-bold">كونسيرج الاستوديو عبر واتساب</div>
            <p className="text-xs text-sand-300 mt-1">
              أرسل 20 قطعة دفعة واحدة وسيتولى فريقنا تجهيزها وإعادتها جاهزة للنشر.
            </p>
          </div>
          <a
            href="https://wa.me/971501234567"
            target="_blank"
            rel="noreferrer"
            className="mt-4 py-2 px-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-xs text-center transition-colors"
          >
            تواصل مع مدير الحساب
          </a>
        </div>
      </div>

      {/* Tax Invoices Table */}
      <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gold-600" />
            <h2 className="text-lg font-bold font-heading text-slate-900">
              سجل الفواتير الضريبية (شاملة 5% ضريبة القيمة المضافة)
            </h2>
          </div>
          <span className="text-xs text-sand-500">متوافقة مع متطلبات الهيئة الاتحادية للضرائب</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-sand-200 text-sand-500 font-semibold">
                <th className="pb-3">رقم الفاتورة</th>
                <th className="pb-3">الباقة</th>
                <th className="pb-3">التاريخ</th>
                <th className="pb-3">الرصيد الممنوح</th>
                <th className="pb-3">الضريبة (5%)</th>
                <th className="pb-3">الإجمالي (AED)</th>
                <th className="pb-3 text-center">طباعة الفاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {sampleOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-sand-50/50">
                  <td className="py-4 font-mono font-semibold text-slate-900">{ord.invoiceNumber}</td>
                  <td className="py-4 font-medium text-slate-800">{ord.packageName}</td>
                  <td className="py-4 text-sand-600">{ord.date}</td>
                  <td className="py-4 font-bold text-gold-700">+{ord.credits}</td>
                  <td className="py-4 text-sand-600">{ord.vatAed.toFixed(2)} AED</td>
                  <td className="py-4 font-bold text-slate-900">{ord.totalAed.toFixed(2)} AED</td>
                  <td className="py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handlePrintInvoice(ord)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sand-200 hover:bg-sand-100 text-slate-700 font-semibold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-gold-600" />
                      <span>فاتورة ضريبية</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
