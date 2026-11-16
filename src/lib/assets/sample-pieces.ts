/**
 * High-Fidelity UAE Gold Souk Sample Pieces
 * Provides authentic, high-resolution vector and graphic samples representing actual
 * jewellery popular in Deira Gold Souk, Sharjah Gold Centre, and Dubai Gold & Diamond Park.
 * Allows users to test the platform instantly with 1 click without needing their own photo.
 */

export interface SamplePiecePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  pieceType: "necklace" | "ring" | "earrings" | "bangle_bracelet" | "bridal_set";
  metalKarat: "22K_yellow" | "21K_yellow" | "18K_white" | "18K_rose";
  suggestedStylePack: string;
  suggestedPersona: string;
  weightGrams: number;
  sku: string;
  priceAed: number;
  descriptionAr: string;
  descriptionEn: string;
  svgDataUri: string;
  beforeSvgDataUri: string;
  afterSvgDataUri: string;
}

function wrapBeforeSvg(innerSvg: string, pieceLabel: string): string {
  const content = innerSvg.replace(/<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <!-- Grey shop counter under fluorescent shop lighting -->
    <rect width="600" height="600" fill="%23cbd5e1"/>
    <!-- Shop counter glass reflection lines -->
    <path d="M 0,160 L 600,320" stroke="%23ffffff" stroke-width="3" opacity="0.35"/>
    <path d="M 0,210 L 600,370" stroke="%23ffffff" stroke-width="1.5" opacity="0.2"/>
    <!-- Harsh smartphone shadow casting overhead -->
    <ellipse cx="300" cy="510" rx="240" ry="50" fill="%2364748b" opacity="0.35"/>
    ${content}
    <!-- Unprocessed Phone Badge -->
    <rect x="24" y="24" width="290" height="36" rx="8" fill="%230f172a" fill-opacity="0.85"/>
    <text x="36" y="47" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23f1f5f9">
      📱 ${pieceLabel} (Raw Phone)
    </text>
  </svg>`;
}

function wrapAfterSvg(
  innerSvg: string,
  preset: { karat: string; weight: number; price: number; name: string; style: string }
): string {
  const content = innerSvg.replace(/<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const karatLabel = preset.karat
    .replace("_yellow", "K GULF GOLD")
    .replace("_white", "K WHITE GOLD")
    .replace("_rose", "K ROSE GOLD");

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <radialGradient id="studioMajlisGlow" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stop-color="%23fffdf7"/>
        <stop offset="45%" stop-color="%23f7ede2"/>
        <stop offset="100%" stop-color="%23ded0c1"/>
      </radialGradient>
      <linearGradient id="badgeGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23fde047"/>
        <stop offset="50%" stop-color="%23ca8a04"/>
        <stop offset="100%" stop-color="%23854d0e"/>
      </linearGradient>
    </defs>
    <!-- Background Studio Surface -->
    <rect width="600" height="600" fill="url(%23studioMajlisGlow)"/>
    <!-- Travertine Stone Plinth / Display Pedestal -->
    <ellipse cx="300" cy="420" rx="230" ry="85" fill="%23ede5dc" stroke="%23d8cbbf" stroke-width="3"/>
    <ellipse cx="300" cy="412" rx="215" ry="76" fill="%23f8f1ea"/>
    ${content}
    <!-- UAE Spec Badge Overlay -->
    <g transform="translate(36, 470)">
      <rect width="320" height="84" rx="14" fill="%23090d16" fill-opacity="0.94" stroke="url(%23badgeGoldBorder)" stroke-width="1.5"/>
      <text x="20" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="900" fill="%23facc15" letter-spacing="0.5">
        ${karatLabel}
      </text>
      <text x="20" y="58" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="%23cbd5e1">
        Weight: ${preset.weight}g
      </text>
      <text x="300" y="40" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="17" font-weight="900" fill="%23ffffff">
        AED ${preset.price.toLocaleString()}
      </text>
      <text x="300" y="60" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="500" fill="%2394a3b8">
        5% UAE VAT Inc.
      </text>
    </g>
  </svg>`;
}

// 1. Raw Piece SVGs
const CHOKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="gold22k" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fde047"/>
      <stop offset="25%" stop-color="%23eab308"/>
      <stop offset="60%" stop-color="%23ca8a04"/>
      <stop offset="85%" stop-color="%23a16207"/>
      <stop offset="100%" stop-color="%23713f12"/>
    </linearGradient>
    <radialGradient id="filigreeBead" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="%23fef08a"/>
      <stop offset="60%" stop-color="%23eab308"/>
      <stop offset="100%" stop-color="%23854d0e"/>
    </radialGradient>
    <filter id="pieceGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="12" flood-color="%23000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g filter="url(%23pieceGlow)">
    <path d="M 150,220 Q 300,340 450,220 Q 300,380 150,220 Z" fill="url(%23gold22k)" stroke="%23854d0e" stroke-width="2"/>
    <path d="M 180,240 Q 300,340 420,240" fill="none" stroke="%23713f12" stroke-width="3" stroke-dasharray="6,4"/>
    <path d="M 200,260 Q 300,350 400,260" fill="none" stroke="%23fef08a" stroke-width="2" stroke-dasharray="4,4"/>
    <circle cx="300" cy="340" r="34" fill="url(%23gold22k)" stroke="%23854d0e" stroke-width="3"/>
    <circle cx="300" cy="340" r="26" fill="none" stroke="%23fef08a" stroke-width="2" stroke-dasharray="3,3"/>
    <circle cx="300" cy="340" r="10" fill="url(%23filigreeBead)"/>
    <g fill="url(%23gold22k)" stroke="%23854d0e" stroke-width="1.5">
      <path d="M 230,310 Q 230,380 230,410 Q 230,425 220,415 Q 215,380 220,310 Z"/>
      <path d="M 265,335 Q 265,420 265,455 Q 265,470 255,460 Q 250,420 255,335 Z"/>
      <path d="M 300,375 Q 300,470 300,510 Q 300,525 290,515 Q 285,470 290,375 Z"/>
      <path d="M 335,335 Q 335,420 335,455 Q 335,470 345,460 Q 350,420 345,335 Z"/>
      <path d="M 370,310 Q 370,380 370,410 Q 370,425 380,415 Q 385,380 380,310 Z"/>
    </g>
    <circle cx="230" cy="415" r="9" fill="url(%23filigreeBead)"/>
    <circle cx="265" cy="460" r="11" fill="url(%23filigreeBead)"/>
    <circle cx="300" cy="515" r="14" fill="url(%23filigreeBead)"/>
    <circle cx="335" cy="460" r="11" fill="url(%23filigreeBead)"/>
    <circle cx="370" cy="415" r="9" fill="url(%23filigreeBead)"/>
  </g>
</svg>`;

const BANGLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="gold21k" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fef08a"/>
      <stop offset="30%" stop-color="%23eab308"/>
      <stop offset="70%" stop-color="%23ca8a04"/>
      <stop offset="100%" stop-color="%23854d0e"/>
    </linearGradient>
    <filter id="bangleShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="15" flood-color="%23000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <g filter="url(%23bangleShadow)">
    <ellipse cx="300" cy="300" rx="190" ry="140" fill="none" stroke="url(%23gold21k)" stroke-width="44"/>
    <ellipse cx="300" cy="300" rx="190" ry="140" fill="none" stroke="%23713f12" stroke-width="3" stroke-dasharray="14,10"/>
    <ellipse cx="300" cy="300" rx="174" ry="124" fill="none" stroke="%23fef08a" stroke-width="3"/>
    <ellipse cx="300" cy="300" rx="206" ry="156" fill="none" stroke="%23fef08a" stroke-width="3"/>
    <g fill="%23713f12" opacity="0.6">
      <circle cx="210" cy="240" r="7"/>
      <circle cx="300" cy="160" r="9"/>
      <circle cx="390" cy="240" r="7"/>
      <circle cx="210" cy="360" r="7"/>
      <circle cx="300" cy="440" r="9"/>
      <circle cx="390" cy="360" r="7"/>
    </g>
  </g>
</svg>`;

const SOLITAIRE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="whiteGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ffffff"/>
      <stop offset="35%" stop-color="%23f1f5f9"/>
      <stop offset="70%" stop-color="%23cbd5e1"/>
      <stop offset="100%" stop-color="%2364748b"/>
    </linearGradient>
    <linearGradient id="diamondSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ffffff"/>
      <stop offset="40%" stop-color="%23e0f2fe"/>
      <stop offset="80%" stop-color="%23bae6fd"/>
      <stop offset="100%" stop-color="%2338bdf8"/>
    </linearGradient>
    <filter id="solitaireGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="%23000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <g filter="url(%23solitaireGlow)">
    <circle cx="300" cy="350" r="130" fill="none" stroke="url(%23whiteGold)" stroke-width="26"/>
    <circle cx="300" cy="350" r="130" fill="none" stroke="%23ffffff" stroke-width="3" opacity="0.8"/>
    <path d="M 260,225 L 250,170 L 270,170 Z" fill="url(%23whiteGold)"/>
    <path d="M 340,225 L 350,170 L 330,170 Z" fill="url(%23whiteGold)"/>
    <path d="M 300,230 L 300,165" stroke="url(%23whiteGold)" stroke-width="8"/>
    <polygon points="230,165 370,165 335,115 265,115" fill="url(%23diamondSparkle)" stroke="%23ffffff" stroke-width="2"/>
    <polygon points="265,115 335,115 300,85" fill="%23ffffff" stroke="%2393c5fd" stroke-width="2"/>
    <polygon points="230,165 370,165 300,220" fill="%23e0f2fe" stroke="%2338bdf8" stroke-width="2"/>
    <polygon points="265,115 300,165 300,85" fill="%23ffffff" opacity="0.9"/>
    <polygon points="300,85 300,165 335,115" fill="%2393c5fd" opacity="0.7"/>
    <circle cx="280" cy="110" r="4" fill="%23ffffff"/>
  </g>
</svg>`;

const JHUMKA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="goldJhumka" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fde047"/>
      <stop offset="35%" stop-color="%23eab308"/>
      <stop offset="70%" stop-color="%23ca8a04"/>
      <stop offset="100%" stop-color="%23713f12"/>
    </linearGradient>
  </defs>
  <g>
    <g transform="translate(140, 100)">
      <circle cx="60" cy="60" r="32" fill="url(%23goldJhumka)"/>
      <circle cx="60" cy="60" r="18" fill="none" stroke="%23fef08a" stroke-width="3" stroke-dasharray="4,4"/>
      <path d="M 10,160 Q 60,85 110,160 Q 60,180 10,160 Z" fill="url(%23goldJhumka)" stroke="%23713f12" stroke-width="2"/>
      <path d="M 25,160 Q 60,110 95,160" fill="none" stroke="%23fef08a" stroke-width="2"/>
      <circle cx="20" cy="195" r="7" fill="url(%23goldJhumka)"/>
      <circle cx="40" cy="205" r="7" fill="url(%23goldJhumka)"/>
      <circle cx="60" cy="210" r="8" fill="url(%23goldJhumka)"/>
      <circle cx="80" cy="205" r="7" fill="url(%23goldJhumka)"/>
      <circle cx="100" cy="195" r="7" fill="url(%23goldJhumka)"/>
    </g>
    <g transform="translate(340, 100)">
      <circle cx="60" cy="60" r="32" fill="url(%23goldJhumka)"/>
      <circle cx="60" cy="60" r="18" fill="none" stroke="%23fef08a" stroke-width="3" stroke-dasharray="4,4"/>
      <path d="M 10,160 Q 60,85 110,160 Q 60,180 10,160 Z" fill="url(%23goldJhumka)" stroke="%23713f12" stroke-width="2"/>
      <path d="M 25,160 Q 60,110 95,160" fill="none" stroke="%23fef08a" stroke-width="2"/>
      <circle cx="20" cy="195" r="7" fill="url(%23goldJhumka)"/>
      <circle cx="40" cy="205" r="7" fill="url(%23goldJhumka)"/>
      <circle cx="60" cy="210" r="8" fill="url(%23goldJhumka)"/>
      <circle cx="80" cy="205" r="7" fill="url(%23goldJhumka)"/>
      <circle cx="100" cy="195" r="7" fill="url(%23goldJhumka)"/>
    </g>
  </g>
</svg>`;

export const UAE_SAMPLE_PIECES: SamplePiecePreset[] = [
  {
    id: "sample-choker-22k",
    nameAr: "مرتعشة خليجية تراثية عيار 22",
    nameEn: "Traditional Gulf 22K Gold Choker (Martashah)",
    pieceType: "necklace",
    metalKarat: "22K_yellow",
    suggestedStylePack: "gulf_gold_classic",
    suggestedPersona: "khaleeji_modest",
    weightGrams: 34.6,
    sku: "DXB-MR-2201",
    priceAed: 11800,
    descriptionAr: "تصميم إماراتي تراثي مزدان بدلايات الذهب الخالص وحبيبات الهيل الدقيقة بنقش يدوي.",
    descriptionEn: "Authentic Emirati choker featuring handcrafted cascading gold leaf pendants and micro-filigree.",
    svgDataUri: `data:image/svg+xml;utf8,${CHOKER_SVG}`,
    beforeSvgDataUri: wrapBeforeSvg(CHOKER_SVG, "22K Martashah Choker"),
    afterSvgDataUri: wrapAfterSvg(CHOKER_SVG, {
      karat: "22K_yellow",
      weight: 34.6,
      price: 11800,
      name: "22K Martashah Choker",
      style: "gulf_gold_classic",
    }),
  },
  {
    id: "sample-bangle-21k",
    nameAr: "بناجر بحرينية منقوشة عيار 21",
    nameEn: "Bahraini Hand-Engraved 21K Gold Bangle",
    pieceType: "bangle_bracelet",
    metalKarat: "21K_yellow",
    suggestedStylePack: "heritage_filigree",
    suggestedPersona: "khaleeji_modest",
    weightGrams: 28.2,
    sku: "SHJ-BNG-2104",
    priceAed: 8950,
    descriptionAr: "بناجر صب عيار 21 بنقش تخريم ليزري وحبيبات هيل بارزة تشتهر بها أسواق الشارقة وديرة.",
    descriptionEn: "Substantial 21K solid gold bangle adorned with traditional geometric laser engraving and granulation.",
    svgDataUri: `data:image/svg+xml;utf8,${BANGLE_SVG}`,
    beforeSvgDataUri: wrapBeforeSvg(BANGLE_SVG, "21K Bahraini Bangle"),
    afterSvgDataUri: wrapAfterSvg(BANGLE_SVG, {
      karat: "21K_yellow",
      weight: 28.2,
      price: 8950,
      name: "21K Bahraini Bangle",
      style: "heritage_filigree",
    }),
  },
  {
    id: "sample-solitaire-18k",
    nameAr: "خاتم سوليتير ألماس وذهب أبيض 18",
    nameEn: "18K White Gold Solitaire Diamond Ring (1.5ct)",
    pieceType: "ring",
    metalKarat: "18K_white",
    suggestedStylePack: "diamond_minimal",
    suggestedPersona: "luxury_minimal",
    weightGrams: 5.4,
    sku: "GDP-SLT-1809",
    priceAed: 18500,
    descriptionAr: "ألماس نقي قطع بريليانت عيار 1.5 قيراط مثبت على 6 شُعَب من الذهب الأبيض عيار 18.",
    descriptionEn: "1.5 carat round brilliant lab/natural solitaire set in classic 6-prong 18K white gold band.",
    svgDataUri: `data:image/svg+xml;utf8,${SOLITAIRE_SVG}`,
    beforeSvgDataUri: wrapBeforeSvg(SOLITAIRE_SVG, "18K Diamond Solitaire"),
    afterSvgDataUri: wrapAfterSvg(SOLITAIRE_SVG, {
      karat: "18K_white",
      weight: 5.4,
      price: 18500,
      name: "18K Diamond Solitaire",
      style: "diamond_minimal",
    }),
  },
  {
    id: "sample-earrings-21k",
    nameAr: "أقراط جومكا بحرينية عيار 21",
    nameEn: "Bahraini 21K Gold Filigree Jhumka Earrings",
    pieceType: "earrings",
    metalKarat: "21K_yellow",
    suggestedStylePack: "occasion_ramadan_eid",
    suggestedPersona: "south_asian_festive",
    weightGrams: 16.8,
    sku: "DXB-JHM-2110",
    priceAed: 5400,
    descriptionAr: "أقراط جومكا جرسية ملكية مفرغة بالنقش اليدوي الخليجي مع شرابات دقيقة تتمايل بحرية.",
    descriptionEn: "Regal bell-shaped Bahraini Jhumka earrings adorned with micro-chains and hand-granulation.",
    svgDataUri: `data:image/svg+xml;utf8,${JHUMKA_SVG}`,
    beforeSvgDataUri: wrapBeforeSvg(JHUMKA_SVG, "21K Gold Jhumka"),
    afterSvgDataUri: wrapAfterSvg(JHUMKA_SVG, {
      karat: "21K_yellow",
      weight: 16.8,
      price: 5400,
      name: "21K Gold Jhumka",
      style: "occasion_ramadan_eid",
    }),
  },
];
