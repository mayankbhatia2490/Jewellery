/**
 * High-Fidelity UAE Gold Souk Sample Pieces
 * Features authentic, commercial-grade jewellery photography representing actual
 * pieces popular in Deira Gold Souk, Sharjah Gold Centre, and Dubai Gold & Diamond Park.
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
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  svgDataUri: string;
  beforeSvgDataUri: string;
  afterSvgDataUri: string;
}

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
    beforePhotoUrl: "/samples/martashah_before.jpg",
    afterPhotoUrl: "/samples/martashah_after.jpg",
    svgDataUri: "/samples/martashah_before.jpg",
    beforeSvgDataUri: "/samples/martashah_before.jpg",
    afterSvgDataUri: "/samples/martashah_after.jpg",
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
    beforePhotoUrl: "/samples/bangle_before.jpg",
    afterPhotoUrl: "/samples/bangle_after.jpg",
    svgDataUri: "/samples/bangle_before.jpg",
    beforeSvgDataUri: "/samples/bangle_before.jpg",
    afterSvgDataUri: "/samples/bangle_after.jpg",
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
    beforePhotoUrl: "/samples/ring_before.jpg",
    afterPhotoUrl: "/samples/ring_after.jpg",
    svgDataUri: "/samples/ring_before.jpg",
    beforeSvgDataUri: "/samples/ring_before.jpg",
    afterSvgDataUri: "/samples/ring_after.jpg",
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
    beforePhotoUrl: "/samples/jhumka_before.jpg",
    afterPhotoUrl: "/samples/jhumka_after.jpg",
    svgDataUri: "/samples/jhumka_before.jpg",
    beforeSvgDataUri: "/samples/jhumka_before.jpg",
    afterSvgDataUri: "/samples/jhumka_after.jpg",
  },
];
