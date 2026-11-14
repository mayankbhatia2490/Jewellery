-- 00001_initial_schema.sql
-- Core schema for Jewelleray UAE Platform
-- Supports 11 core tables, strict RLS, append-only credit ledger, and seed data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('seller', 'admin')),
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SHOPS
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    trn_number TEXT,
    location TEXT NOT NULL DEFAULT 'Deira Gold Souk',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREDIT PACKAGES (All prices in AED VAT-inclusive with 5% VAT itemized)
CREATE TABLE IF NOT EXISTS credit_packages (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    price_aed_inclusive NUMERIC(10, 2) NOT NULL CHECK (price_aed_inclusive > 0),
    price_aed_exclusive NUMERIC(10, 2) NOT NULL,
    vat_amount_aed NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CREDIT LEDGER (Strictly append-only, balance is SUM(delta))
CREATE TABLE IF NOT EXISTS credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL CHECK (delta != 0),
    reason TEXT NOT NULL CHECK (reason IN ('grant', 'purchase', 'spend', 'refund', 'bonus')),
    idempotency_key TEXT UNIQUE NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id ON credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_idempotency_key ON credit_ledger(idempotency_key);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    package_id TEXT NOT NULL REFERENCES credit_packages(id),
    credits INTEGER NOT NULL,
    amount_aed_inclusive NUMERIC(10, 2) NOT NULL,
    amount_aed_exclusive NUMERIC(10, 2) NOT NULL,
    vat_amount_aed NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_provider TEXT NOT NULL DEFAULT 'stripe',
    payment_reference TEXT,
    invoice_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. STYLE PACKS
CREATE TABLE IF NOT EXISTS style_packs (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. STYLE PACK VERSIONS
CREATE TABLE IF NOT EXISTS style_pack_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_pack_id TEXT NOT NULL REFERENCES style_packs(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    system_prompt TEXT NOT NULL,
    negative_constraints TEXT NOT NULL,
    model_target TEXT NOT NULL,
    karat_color_hints JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(style_pack_id, version)
);

-- 8. IMAGE JOBS
CREATE TABLE IF NOT EXISTS image_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    piece_type TEXT NOT NULL CHECK (piece_type IN ('ring', 'necklace', 'earrings', 'bangle_bracelet', 'bridal_set', 'pendant')),
    metal_karat TEXT NOT NULL CHECK (metal_karat IN ('22K_yellow', '21K_yellow', '18K_yellow', '18K_white', '18K_rose', 'platinum_silver')),
    style_pack_id TEXT NOT NULL REFERENCES style_packs(id),
    style_pack_version_id UUID REFERENCES style_pack_versions(id),
    model_persona TEXT NOT NULL DEFAULT 'none_product_only' CHECK (model_persona IN ('none_product_only', 'khaleeji_modest', 'south_asian_festive', 'levantine_modern', 'luxury_minimal')),
    spec_badge_enabled BOOLEAN NOT NULL DEFAULT false,
    spec_badge_data JSONB,
    input_image_path TEXT NOT NULL,
    input_image_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'checking', 'done', 'failed', 'needs_review')),
    fidelity_warning BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_jobs_user_status ON image_jobs(user_id, status);

-- 9. JOB OUTPUTS
CREATE TABLE IF NOT EXISTS job_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES image_jobs(id) ON DELETE CASCADE,
    aspect_ratio TEXT NOT NULL CHECK (aspect_ratio IN ('1:1', '4:5', '9:16')),
    storage_path TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'image/webp',
    fidelity_score NUMERIC(5, 4) NOT NULL DEFAULT 1.0,
    saved_to_catalog BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_outputs_job_id ON job_outputs(job_id);

-- 10. REFUND TICKETS
CREATE TABLE IF NOT EXISTS refund_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES image_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    credits_refunded INTEGER NOT NULL,
    reason TEXT NOT NULL,
    ledger_entry_id UUID REFERENCES credit_ledger(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_pack_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update only their own profile; admins can view all
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Shops: Users can manage only their own shops
CREATE POLICY shops_select_own ON shops FOR SELECT USING (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY shops_insert_own ON shops FOR INSERT WITH CHECK (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY shops_update_own ON shops FOR UPDATE USING (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY shops_delete_own ON shops FOR DELETE USING (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Credit Packages: Readable by all authenticated and anonymous; editable only by admin
CREATE POLICY credit_packages_select_all ON credit_packages FOR SELECT USING (is_active = true OR auth.jwt()->>'role' = 'admin');
CREATE POLICY credit_packages_admin_all ON credit_packages FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Credit Ledger: Users can view only their own ledger history
CREATE POLICY credit_ledger_select_own ON credit_ledger FOR SELECT USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY credit_ledger_insert_service ON credit_ledger FOR INSERT WITH CHECK (auth.jwt()->>'role' IN ('admin', 'service_role'));

-- Orders: Users can view and create their own orders
CREATE POLICY orders_select_own ON orders FOR SELECT USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY orders_insert_own ON orders FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Style Packs & Versions: Readable by all users
CREATE POLICY style_packs_select_active ON style_packs FOR SELECT USING (is_active = true OR auth.jwt()->>'role' = 'admin');
CREATE POLICY style_pack_versions_select_all ON style_pack_versions FOR SELECT USING (true);

-- Image Jobs: Users can view, insert, and update their own jobs
CREATE POLICY image_jobs_select_own ON image_jobs FOR SELECT USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY image_jobs_insert_own ON image_jobs FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY image_jobs_update_own ON image_jobs FOR UPDATE USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY image_jobs_delete_own ON image_jobs FOR DELETE USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Job Outputs: Users can view outputs belonging to their jobs
CREATE POLICY job_outputs_select_own ON job_outputs FOR SELECT USING (
    EXISTS (SELECT 1 FROM image_jobs WHERE image_jobs.id = job_outputs.job_id AND (image_jobs.user_id = auth.uid() OR auth.jwt()->>'role' = 'admin'))
);
CREATE POLICY job_outputs_manage_service ON job_outputs FOR ALL USING (auth.jwt()->>'role' IN ('admin', 'service_role'));

-- Refund Tickets: Users can view their own refund tickets
CREATE POLICY refund_tickets_select_own ON refund_tickets FOR SELECT USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');
CREATE POLICY refund_tickets_manage_service ON refund_tickets FOR ALL USING (auth.jwt()->>'role' IN ('admin', 'service_role'));

-- Audit Log: Admins only
CREATE POLICY audit_log_admin_all ON audit_log FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- SEED DATA

-- Credit Packages (VAT-inclusive in AED)
INSERT INTO credit_packages (id, name_en, name_ar, credits, price_aed_inclusive, price_aed_exclusive, vat_amount_aed)
VALUES
('pkg_starter_50', 'Starter Pack (50 Credits)', 'الباقة الأساسية (50 رصيد)', 50, 199.00, 189.52, 9.48),
('pkg_pro_200', 'Pro Jeweller (200 Credits)', 'باقة المحترفين (200 رصيد)', 200, 599.00, 570.48, 28.52),
('pkg_souk_1000', 'Souk Enterprise (1000 Credits)', 'باقة كبار تجار الذهب (1000 رصيد)', 1000, 1999.00, 1903.81, 95.19)
ON CONFLICT (id) DO NOTHING;

-- Style Packs (7 Core UAE Packs)
INSERT INTO style_packs (id, name_en, name_ar, description_en, description_ar)
VALUES
('gulf_gold_classic', 'Gulf Gold Classic', 'كلاسيك الذهب الخليجي', 'Warm 21K/22K gold staged on deep sandstone, travertine plinth or ivory silk with soft directional Majlis lighting.', 'عرض ذهب 21 و 22 قيراط على أحجار الترافرتين ورخام الحجر الرملي مع إضاءة مجلس دافئة.'),
('bridal_set', 'Bridal Set Grand Staging', 'أطقم العرائس الفاخرة', 'Coordinated multi-piece staging on sculpted velvet or silk busts for celebratory gifting.', 'تنسيق متكامل للأطقم الملكية (عقد، حلق، سوار، خاتم) على تماثيل مخملية مخصصة للعرائس.'),
('heritage_filigree', 'Heritage Filigree & Jaali', 'تراث الصياغة والنقش الخليجي', 'Macro-detail lighting highlighting intricate Gulf/Indian jaali, granulation, and engraving work.', 'إضاءة ماكرو تبرز دقة النقش التراثي، التخريم، وحبيبات الذهب الدقيقة.'),
('diamond_minimal', 'Diamond Minimal High-Key', 'الألماس العصري النقي', 'Crisp architectural white/cool-grey studio lighting engineered for 18K white gold and solitaires.', 'إضاءة استوديو بيضاء عصرية هندسية مخصصة للذهب الأبيض 18 قيراط وسوليتير الألماس.'),
('occasion_ramadan_eid', 'Occasion: Ramadan & Eid', 'أجواء رمضان والأعياد', 'Subtle lantern-shadow light patterns and warm crescent-era evening ambience for luxury seasonal campaigns.', 'إضاءة ظلال الفوانيس الناعمة وأجواء مسائية ساحرة لحملات المواسم الفاخرة.'),
('occasion_national_day_dsf', 'Occasion: National Day & DSF', 'اليوم الوطني ومهرجان دبي للتسوق', 'Festive luxury campaign backdrops tailored for UAE National Day and Dubai Shopping Festival promotions.', 'خلفيات احتفالية فاخرة مخصصة لحملات اليوم الوطني ومهرجان دبي للتسوق.'),
('social_story', 'Social Story & WhatsApp', 'قصص انستغرام وكتالوج واتساب', 'Pre-composed 9:16 and 1:1 layouts with clean negative-space safe zones for price/karat/weight overlays.', 'تكوينات مدروسة بنسب 9:16 و 1:1 مع مساحات أمان خالية لشارات الأسعار والمواصفات.')
ON CONFLICT (id) DO NOTHING;

-- Style Pack Versions (v1 Prompts and Karat Calibration metadata)
INSERT INTO style_pack_versions (style_pack_id, version, system_prompt, negative_constraints, model_target, karat_color_hints)
VALUES
('gulf_gold_classic', 1, 'Luxury fine jewellery commercial photograph, warm 21K/22K Gulf gold piece placed gracefully on honed beige travertine plinth, soft warm ambient Majlis light from side, warm reflections, ultra-sharp reflections, 8k resolution studio product shot.', 'cheap metal, washed out yellow, low saturation, cartoon, plastic, overexposed highlights, blurry edges, distorted geometry', 'pipeline-a-composite', '{"target_hue_range": [38, 48], "saturation_min": 0.65, "karat_anchor": "21K_22K_gulf_gold"}'::jsonb),
('bridal_set', 1, 'Grand UAE bridal jewellery collection staged on sculpted dark emerald velvet presentation display, opulent ceremonial lighting, micro sparkle on gemstones, regal Gulf aesthetic.', 'floating pieces, severed limbs, fake gemstones, asymmetrical warping, low contrast', 'pipeline-a-composite', '{"target_hue_range": [39, 49], "saturation_min": 0.68, "karat_anchor": "22K_bridal_gold"}'::jsonb),
('heritage_filigree', 1, 'Extreme close-up macro jewellery shot showing intricate gold filigree, granulation, and traditional Gulf jaali lattice work, raking light emphasizing depth and texture, immaculate craftsmanship.', 'smoothed textures, loss of detail, melted gold, blurred engraving, AI artifacts', 'pipeline-a-composite', '{"target_hue_range": [38, 46], "saturation_min": 0.60, "karat_anchor": "21K_heritage"}'::jsonb),
('diamond_minimal', 1, 'High-end diamond and 18K white gold studio photography, pure neutral architectural concrete plinth, crisp cool studio lighting, prism caustics, clean high-key minimalism.', 'yellow tint, muddy diamonds, dark spots, unpolished metal, smudges', 'pipeline-a-composite', '{"target_hue_range": [0, 360], "saturation_max": 0.15, "karat_anchor": "18K_white_platinum"}'::jsonb),
('occasion_ramadan_eid', 1, 'Festive luxury jewellery campaign photograph, warm twilight atmosphere with delicate geometric lantern-shadow cast across sandstone plinth, subtle golden glow, festive Khaleeji elegance.', 'cluttered background, religious figures, cartoon crescent, exaggerated glare', 'pipeline-a-composite', '{"target_hue_range": [38, 48], "saturation_min": 0.62, "karat_anchor": "21K_22K_festive"}'::jsonb),
('occasion_national_day_dsf', 1, 'Dubai luxury shopping festival campaign staging, sleek obsidian and gold leaf architectural pedestal, celebratory warm rim lighting, premium retail showcase.', 'flags, text overlays, party confetti, cartoon fireworks, distorted proportions', 'pipeline-a-composite', '{"target_hue_range": [38, 48], "saturation_min": 0.65, "karat_anchor": "21K_22K_dsf"}'::jsonb),
('social_story', 1, 'Vertical mobile-first jewellery staging with 40% clean negative space in upper third for price and spec badge, studio lighting on silk surface, optimized for social catalog.', 'busy text, watermarks, cluttered margins, cropped jewellery', 'pipeline-a-composite', '{"target_hue_range": [38, 48], "saturation_min": 0.60, "karat_anchor": "21K_22K_catalog"}'::jsonb)
ON CONFLICT (style_pack_id, version) DO NOTHING;
