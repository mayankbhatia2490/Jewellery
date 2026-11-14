"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND_NAME } from "@/config/brand";
import { Phone, KeyRound, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState<string>("+971501234567");
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إرسال رمز التحقق");

      setDebugOtp(data.debugCode || null);
      setStep("otp");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل الإرسال";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "رمز التحقق غير صحيح");

      // Save token to localStorage / cookie
      if (data.token) {
        localStorage.setItem("jewelleray_session", data.token);
      }
      router.push("/studio");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "رمز التحقق غير صحيح";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-sand-200 shadow-luxury">
        <div className="text-center mb-8">
          <span className="font-heading font-black text-3xl text-gold-600 tracking-wider">
            {BRAND_NAME}
          </span>
          <h2 className="text-xl font-bold font-heading text-slate-900 mt-2">
            تسجيل الدخول برقم إماراتي (+971)
          </h2>
          <p className="text-xs text-sand-600 mt-1">
            سجل دخولك فوراً دون كلمة مرور. ستحصل تلقائياً على 10 رصيد تجريبي مجاني.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {debugOtp && step === "otp" && (
          <div className="mb-4 p-3 rounded-xl bg-gold-50 border border-gold-300 text-gold-900 flex items-center justify-between text-xs">
            <span>رمز التحقق التجريبي (Dev/Mock Mode):</span>
            <strong className="font-mono font-bold text-sm tracking-widest">{debugOtp}</strong>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                رقم الهاتف المتحرك في الإمارات
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-sand-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 text-center"
                  required
                />
                <Phone className="w-4 h-4 text-sand-400 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-sand-500 mt-1">
                الصيغ المقبولة: +97150XXXXXXX أو 050XXXXXXX
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:bg-sand-400 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>إرسال رمز التحقق (OTP)</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                أدخل رمز التحقق (6 أرقام)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-sand-300 text-xl font-mono tracking-widest font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 text-center"
                  required
                />
                <KeyRound className="w-4 h-4 text-sand-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:bg-sand-400 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>تأكيد وتسجيل الدخول</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-center text-xs text-sand-600 hover:underline mt-2"
            >
              تغيير رقم الهاتف
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
