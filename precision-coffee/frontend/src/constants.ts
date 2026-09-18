import type { Equipment, Grinder, Process, RoastLevel } from "./types";

export const EQUIPMENT_LIST: Equipment[] = [
  "V60", "Aeropress", "Chemex", "French Press", "Espresso", "Moka Pot",
  "Tubruk", "Cold Brew", "Kalita Wave", "Turkish", "Clever Dripper", "Siphon",
];

export const METHODS: { value: Equipment; label: string; desc: string }[] = [
  { value: "V60", label: "V60", desc: "Dituang pelan-pelan. Rasanya bersih, asamnya jelas. Langganan kafe spesialti." },
  { value: "Aeropress", label: "Aeropress", desc: "Ditekan kayak suntikan. Cepat, susah gagal, gampang dioprek." },
  { value: "Chemex", label: "Chemex", desc: "Filternya tebal, jadi hasilnya jernih banget. Lebih mirip teh mahal daripada kopi." },
  { value: "French Press", label: "French Press", desc: "Direndam dulu baru ditekan. Body-nya tebel. Paling minimal buat pemula." },
  { value: "Espresso", label: "Espresso", desc: "Ditekan 9 bar. Kental, paitnya enak, dasar latte sama cappuccino." },
  { value: "Moka Pot", label: "Moka Pot", desc: "Kompor rumah, tapi hasil kayak espresso. Kuat." },
  { value: "Tubruk", label: "Tubruk", desc: "Kopi bubuk + air panas di gelas, tunggu ngendap. Cara Indonesia paling jadul." },
  { value: "Cold Brew", label: "Cold Brew", desc: "Direndam semalam di kulkas. Halus, berasa asamnya sama sekali." },
  { value: "Kalita Wave", label: "Kalita Wave", desc: "Dasarnya rata, jadi lebih gampang dari V60. Mau belajar tuang? dari sini." },
  { value: "Turkish", label: "Turkish", desc: "Direbus di cezve. Pekat, kental, bubuknya masih nyangkut. Khas Turki." },
  { value: "Clever Dripper", label: "Clever Dripper", desc: "Rendam dulu, baru ditetesin. Hasilnya stabil tiap kali bikin." },
  { value: "Siphon", label: "Siphon", desc: "Diseduh pakai vakum kaca. Ada ritualnya, rasanya bersih kayak teh." },
];

export const PROCESSES: { value: Process; label: string; hint: string }[] = [
  { value: "Washed", label: "Washed", hint: "Clean, bright acidity" },
  { value: "Natural", label: "Natural", hint: "Fruity, heavy body" },
  { value: "Anaerobic", label: "Anaerobic", hint: "Complex, wine-like" },
];

export const ROASTS: { value: RoastLevel; label: string; hint: string }[] = [
  { value: "Light", label: "Light", hint: "Floral, tea-like" },
  { value: "Medium", label: "Medium", hint: "Balanced, caramel" },
  { value: "Dark", label: "Dark", hint: "Bold, chocolate" },
];

export const GRINDERS: { value: Grinder; label: string; type: string }[] = [
  { value: "Timemore C2/C3", label: "Timemore C2 / C3", type: "Manual, Conical 38mm" },
  { value: "Timemore C3 ESP", label: "Timemore C3 ESP (Espresso)", type: "Manual, Conical 38mm, 0.025mm/click" },
  { value: "Timemore Chestnut X", label: "Timemore Chestnut X", type: "Manual, Conical 42mm" },
  { value: "Timemore C5 ESP", label: "Timemore C5 ESP (Espresso)", type: "Manual, Conical, ESP geometry" },
  { value: "Comandante C40", label: "Comandante C40", type: "Manual, Conical 39mm" },
  { value: "1Zpresso JX/J-Max", label: "1Zpresso JX / J-Max", type: "Manual, Conical 48mm" },
  { value: "1Zpresso J-Ultra", label: "1Zpresso J-Ultra (Espresso)", type: "Manual, Conical 48mm, 8 micron/click" },
  { value: "1Zpresso K-Series", label: "1Zpresso K-Series (Ultra/Plus)", type: "Manual, Conical 48mm" },
  { value: "Baratza Encore", label: "Baratza Encore", type: "Electric, Conical 40mm" },
  { value: "Fellow Ode Gen 2", label: "Fellow Ode Gen 2", type: "Electric, Flat 64mm" },
  { value: "Kingrinder K6", label: "Kingrinder K6", type: "Manual, Conical 48mm" },
  { value: "DF64 Gen 2", label: "DF64 Gen 2", type: "Electric, Flat 64mm, stepless" },
  { value: "Niche Zero", label: "Niche Zero", type: "Electric, Conical 63mm, espresso-focused" },
  { value: "Eureka Mignon", label: "Eureka Mignon (Specialita/Silenzio)", type: "Electric, Flat 50-55mm, stepless" },
  { value: "Option-O Lagom Mini", label: "Option-O Lagom Mini", type: "Electric, Conical 38mm, stepless" },
  { value: "Hario Skerton", label: "Hario Skerton", type: "Manual, Ceramic" },
  { value: "Generic (Tanpa Referensi)", label: "Generic / Lainnya", type: "Skala 0-100 universal" },
];

export const DEFAULT_DOSES: Record<Equipment, number> = {
  V60: 18, Aeropress: 16, Chemex: 25, "French Press": 30, Espresso: 18,
  "Moka Pot": 18, Tubruk: 18, "Cold Brew": 80, "Kalita Wave": 18,
  Turkish: 7, "Clever Dripper": 18, Siphon: 25,
};

export const DEFAULT_RATIOS: Record<Equipment, number> = {
  V60: 16, Aeropress: 15, Chemex: 16, "French Press": 15, Espresso: 2,
  "Moka Pot": 7, Tubruk: 12, "Cold Brew": 5, "Kalita Wave": 16,
  Turkish: 10, "Clever Dripper": 16, Siphon: 15,
};

/* estimasi durasi seduh (detik) untuk preview di preset card */
export const EST_TIMES: Record<Equipment, string> = {
  V60: "2:00", Aeropress: "2:00", Chemex: "2:30", "French Press": "5:00",
  Espresso: "0:50", "Moka Pot": "5:00", Tubruk: "4:00", "Cold Brew": "12 jam",
  "Kalita Wave": "2:20", Turkish: "3:20", "Clever Dripper": "3:50", Siphon: "3:20",
};

/* rasio umum untuk saran cepat di input custom */
export const RATIO_SUGGESTIONS = [
  { value: "2", label: "1:2 · Espresso / Ristretto" },
  { value: "5", label: "1:5 · Cold Brew Concentrate" },
  { value: "7", label: "1:7 · Moka Pot" },
  { value: "10", label: "1:10 · Turkish" },
  { value: "12", label: "1:12 · Tubruk / Strong" },
  { value: "14", label: "1:14 · Strong Pour-over" },
  { value: "15", label: "1:15 · Aeropress / Balance" },
  { value: "16", label: "1:16 · V60 / Standard" },
  { value: "17", label: "1:17 · Chemex / Light" },
  { value: "18", label: "1:18 · Weak / Tea-like" },
];

/* format detik -> "m:ss" atau "X jam" */
export function formatTimeLabel(totalSeconds: number): string {
  if (totalSeconds >= 3600) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return m > 0 ? `~${h}j ${m}m` : `~${h}j`;
  }
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}
