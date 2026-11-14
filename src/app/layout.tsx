import type { Metadata } from "next";
import { BRAND_NAME, BRAND_CONFIG } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND_NAME} | UAE Jewellery Visual Studio`,
  description: "One phone photo in. A full UAE catalog set out, in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-sand-50 text-slate-900 selection:bg-gold-200">
        <header className="border-b border-sand-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-heading font-black text-2xl tracking-wider text-gold-600">
                {BRAND_NAME}
              </span>
              <span className="text-xs bg-gold-100 text-gold-800 px-2 py-0.5 rounded font-medium border border-gold-300">
                UAE Studio
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <a
                href={BRAND_CONFIG.conciergeWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-majlis-emerald hover:underline"
              >
                <span>أرسل 20 قطعة</span>
                <span className="text-xs text-sand-500 font-normal">(WhatsApp)</span>
              </a>
              <a
                href="/login"
                className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
              >
                تسجيل الدخول
              </a>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-sand-200 bg-white mt-20 py-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-600">
            <div>
              © {new Date().getFullYear()} {BRAND_CONFIG.legalEntity}. جميع الحقوق محفوظة.
            </div>
            <div className="flex items-center gap-4">
              <span>{BRAND_CONFIG.hubLocation}</span>
              <span>•</span>
              <span>{BRAND_CONFIG.supportHours}</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
