/*
  Namuu NAIL-ийн ДЕМО каталог — үйлчилгээ, мастер, ажиллах цаг.

  ⚠️ Энд байгаа үнэ, хугацаа, мастерын нэр, цагийн хуваарь бүгд ЖИШЭЭ.
  Клиентээс бодит мэдээлэл ирэхэд энэ файлыг л шинэчилнэ. Сайт эдгээрийг
  "жишээ" гэсэн тэмдэглэгээтэй харуулдаг (`PRICES_CONFIRMED` г.м).

  Нийтийн сайт (server component) болон админы демо (client) хоёулаа энэ
  файлыг уншдаг тул энд зөвхөн цэвэр өгөгдөл, функц байна.
*/

/** Клиент үнээ баталгаажуулбал true болгоно — "жишээ үнэ" шошго алга болно. */
export const PRICES_CONFIRMED = false;
/** Клиент мастеруудынхаа мэдээллийг өгвөл true болгоно. */
export const STAFF_CONFIRMED = false;

export type ServiceCategory = {
  id: string;
  name: string;
  /** Ангиллын товч тайлбар — сайтын "Үйлчилгээ" хуудсанд. */
  intro: string;
};

export type NamuuService = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  durationMin: number;
  /** MNT — ЖИШЭЭ үнэ */
  price: number;
  /** Нүүр хуудсанд онцлох эсэх */
  featured?: boolean;
};

export type NamuuStaff = {
  id: string;
  name: string;
  title: string;
  /** Хийж чадах үйлчилгээнүүд */
  serviceIds: string[];
};

export type Branch = {
  id: string;
  name: string;
  openMin: number;
  closeMin: number;
  /** Амардаг гаригууд — 0 = Ням … 6 = Бямба */
  closedDays: number[];
  /** Онлайн захиалгын цагийн алхам (жинхэнэ системийн `slotMinutes`-тэй ижил утга) */
  slotMinutes: number;
};

export const categories: ServiceCategory[] = [
  { id: "manicure", name: "Маникюр", intro: "Хумсны арчилгаа, хэлбэржүүлэлт, гель будалт." },
  { id: "extension", name: "Хумс уртасгалт", intro: "Гель уртасгалт ба түүний засвар." },
  { id: "art", name: "Nail art", intro: "Гараар зурсан дизайн, хром, омбре." },
  { id: "pedicure", name: "Педикюр", intro: "Хөлийн хумс засал, арчилгаа." },
  { id: "extra", name: "Нэмэлт", intro: "Гель авалт болон бусад нэмэлт үйлчилгээ." },
];

export const services: NamuuService[] = [
  {
    id: "classic-mani",
    categoryId: "manicure",
    name: "Классик маникюр",
    description: "Хумсны хэлбэржүүлэлт, кутикул арчилгаа, гарын тос.",
    durationMin: 45,
    price: 35000,
  },
  {
    id: "gel-mani",
    categoryId: "manicure",
    name: "Маникюр + гель будалт",
    description: "Арчилгаатай маникюр ба удаан тогтдог гель будалт.",
    durationMin: 75,
    price: 55000,
    featured: true,
  },
  {
    id: "french",
    categoryId: "manicure",
    name: "Франц маникюр",
    description: "Цэвэрхэн, сонгодог франц үзүүр — гель будалттай.",
    durationMin: 90,
    price: 65000,
  },
  {
    id: "extension",
    categoryId: "extension",
    name: "Гель уртасгалт",
    description: "Хүссэн урт, хэлбэрээр гель уртасгалт.",
    durationMin: 120,
    price: 90000,
    featured: true,
  },
  {
    id: "refill",
    categoryId: "extension",
    name: "Уртасгалтын засвар",
    description: "Ургасан хэсгийг нөхөж, хэлбэрийг сэргээнэ.",
    durationMin: 90,
    price: 70000,
  },
  {
    id: "art",
    categoryId: "art",
    name: "Гель будалт + nail art",
    description: "Таны санаа эсвэл бидний санал болгосон дизайн.",
    durationMin: 105,
    price: 75000,
    featured: true,
  },
  {
    id: "chrome",
    categoryId: "art",
    name: "Хром ба омбре",
    description: "Гялалзсан хром, зөөлөн өнгөний шилжилт.",
    durationMin: 90,
    price: 70000,
  },
  {
    id: "pedi",
    categoryId: "pedicure",
    name: "Классик педикюр",
    description: "Хөлийн хумс засал, арьсны арчилгаа.",
    durationMin: 60,
    price: 45000,
  },
  {
    id: "gel-pedi",
    categoryId: "pedicure",
    name: "Педикюр + гель будалт",
    description: "Арчилгаатай педикюр ба гель будалт.",
    durationMin: 90,
    price: 65000,
    featured: true,
  },
  {
    id: "removal",
    categoryId: "extra",
    name: "Гель авалт ба арчилгаа",
    description: "Хумсанд хор хөнөөлгүйгээр гель авч, тэжээнэ.",
    durationMin: 30,
    price: 15000,
  },
];

const ALL = services.map((s) => s.id);

/** Жишээ мастерууд. Нэрс нь зохиомол — Namuu-ийн бодит ажилтнууд биш. */
export const staff: NamuuStaff[] = [
  { id: "anudari", name: "Анударь", title: "Ахлах мастер", serviceIds: ALL },
  {
    id: "misheel",
    name: "Мишээл",
    title: "Nail art мастер",
    serviceIds: ["classic-mani", "gel-mani", "french", "art", "chrome", "removal"],
  },
  {
    id: "nomin",
    name: "Номин",
    title: "Хумсны мастер",
    serviceIds: ["classic-mani", "gel-mani", "extension", "refill", "pedi", "gel-pedi", "removal"],
  },
];

/** Ганц салбар — ажиллах цаг ЖИШЭЭ. */
export const branch: Branch = {
  id: "namuu",
  name: "Namuu NAIL",
  openMin: 10 * 60,
  closeMin: 20 * 60,
  closedDays: [],
  slotMinutes: 30,
};

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const staffById = (id: string) => staff.find((m) => m.id === id);
export const staffForService = (serviceId: string) =>
  staff.filter((m) => m.serviceIds.includes(serviceId));

export const money = (n: number) => `${n.toLocaleString("mn-MN")}₮`;

/** 690 -> "11:30" */
export function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** 105 -> "1 цаг 45 мин" */
export function durationLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} мин`;
  return m ? `${h} цаг ${m} мин` : `${h} цаг`;
}
