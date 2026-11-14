# Jewelleray — UAE B2B/B2C Jewellery Visual Studio

*"One phone photo in. A full UAE catalog set out, in minutes."*

Built specifically for UAE gold souk retailers (Deira, Sharjah, Gold & Diamond Park), independent designers, and Instagram/WhatsApp jewellery boutiques.

## Key Features
- **Fidelity-First Hybrid Engine:** Product-only/bust shots preserve exact segmented piece pixels. Cropped on-model shots run automated silhouette and 21K/22K gold color-drift checks.
- **UAE Buyer Personas:** Modest cropped editorial framings (Khaleeji Modest, South Asian Festive, Levantine Modern, Luxury Minimal) without uncanny full faces.
- **21K & 22K Gulf Gold Calibration:** Anchored color hues for warm Gulf gold.
- **Bilingual RTL/LTR:** Native Arabic and English support.
- **WhatsApp Catalog Sizing:** 1:1 (WhatsApp Catalog), 4:5 (Instagram Feed), and 9:16 (Story with safe zones).
- **Append-Only Credit Ledger:** Provably idempotent credits and instant auto-refunds on fidelity failure.
- **Bilingual Tax Invoices:** Compliant with 5% UAE VAT.

## Tech Stack
- **Framework:** Next.js 14 (App Router, Strict TypeScript)
- **Styling:** Tailwind CSS (RTL support, custom Gulf Gold palette)
- **Localization:** next-intl (ar / en)
- **Database & Auth:** Supabase (PostgreSQL with strict RLS)
- **Image Processing:** sharp (HEIC support, EXIF GPS stripping)
- **Testing:** Vitest & Playwright
