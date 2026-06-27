export type Governorate = {
  id: string;
  ar: string;
  en: string;
};

/** The 18 governorates of Iraq (cities/centers used as trip endpoints). */
export const GOVERNORATES: Governorate[] = [
  { id: "baghdad", ar: "بغداد", en: "Baghdad" },
  { id: "basra", ar: "البصرة", en: "Basra" },
  { id: "nineveh", ar: "نينوى (الموصل)", en: "Nineveh" },
  { id: "erbil", ar: "أربيل", en: "Erbil" },
  { id: "sulaymaniyah", ar: "السليمانية", en: "Sulaymaniyah" },
  { id: "dohuk", ar: "دهوك", en: "Dohuk" },
  { id: "kirkuk", ar: "كركوك", en: "Kirkuk" },
  { id: "najaf", ar: "النجف", en: "Najaf" },
  { id: "karbala", ar: "كربلاء", en: "Karbala" },
  { id: "babil", ar: "بابل (الحلة)", en: "Babil" },
  { id: "diyala", ar: "ديالى (بعقوبة)", en: "Diyala" },
  { id: "anbar", ar: "الأنبار (الرمادي)", en: "Anbar" },
  { id: "wasit", ar: "واسط (الكوت)", en: "Wasit" },
  { id: "maysan", ar: "ميسان (العمارة)", en: "Maysan" },
  { id: "dhiqar", ar: "ذي قار (الناصرية)", en: "Dhi Qar" },
  { id: "muthanna", ar: "المثنى (السماوة)", en: "Muthanna" },
  { id: "qadisiyah", ar: "القادسية (الديوانية)", en: "Qadisiyah" },
  { id: "saladin", ar: "صلاح الدين (تكريت)", en: "Saladin" },
];

const BY_ID = new Map(GOVERNORATES.map((g) => [g.id, g]));

export function governorate(id: string): Governorate {
  return BY_ID.get(id) ?? { id, ar: id, en: id };
}

export function governorateName(id: string): string {
  return governorate(id).ar;
}
