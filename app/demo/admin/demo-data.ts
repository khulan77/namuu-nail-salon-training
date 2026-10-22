/*
  Админы үзүүлэнгийн жишээ өгөгдөл. Өгөгдлийн сан огт хөндөхгүй. Огноог
  "өнөөдрөөс хэдэн хоногийн зайтай" (`day`) гэж хадгална, тиймээс demo хэзээ
  нээгдсэн ч хуанли дүүрэн харагдана.

  Үйлчилгээ, мастер, ажиллах цаг нь `app/lib/namuu/catalog.ts`-аас ирнэ —
  нийтийн сайттай ижил эх сурвалж. Үйлчлүүлэгчдийн нэр, утас бүгд ЗОХИОМОЛ.
*/
import * as catalog from "@/app/lib/namuu/catalog";

export { hhmm, money } from "@/app/lib/namuu/catalog";

export type Status = "pending" | "confirmed" | "done" | "no_show" | "cancelled";

export type DemoService = catalog.NamuuService;

export type DemoPackage = {
  id: string;
  name: string;
  serviceIds: string[];
  price: number;
};

export type DemoBranch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  openMin: number;
  closeMin: number;
  /** 0 = Ням … 6 = Бямба */
  closedDays: number[];
};

export type DemoStaff = catalog.NamuuStaff & { branchId: string };

export type DemoBooking = {
  id: string;
  code: string;
  name: string;
  phone: string;
  /** "svc:<id>" эсвэл "pkg:<id>" — жинхэнэ админы маягттай ижил. */
  item: string;
  staffId: string;
  /** Өнөөдрөөс хэдэн хоногийн зайтай (өчигдөр = -1). */
  day: number;
  /** Эхлэх цаг, шөнө дундаас хойшхи минутаар. */
  start: number;
  status: Status;
  /** Төлөгдсөн дүн. */
  paid: number;
  /** ★ — зөвхөн энэ мастер дээр. */
  locked?: boolean;
  /** 👥 — нэг үйлчлүүлэгч хэд хэдэн мастер дээр зэрэг. */
  groupId?: string;
  note?: string;
  /** Дөнгөж ирсэн — хуанли, жагсаалтад тодруулна. */
  fresh?: boolean;
  /** "online" — нийтийн сайтын демо захиалгаас (/book) ирсэн. */
  source?: "online";
};

export const WEEKDAYS = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

/** Өнөөдрөөс `day` хоногийн дараах огноо. */
export function dateOf(today: Date, day: number): Date {
  const d = new Date(today);
  d.setDate(d.getDate() + day);
  return d;
}

/** "15 / 09" */
export function dayMonth(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} / ${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function dayLabel(today: Date, day: number): string {
  if (day === 0) return "Өнөөдөр";
  if (day === 1) return "Маргааш";
  if (day === -1) return "Өчигдөр";
  const d = dateOf(today, day);
  return `${dayMonth(d)} · ${WEEKDAYS[d.getDay()]}`;
}

/* ── Салон ─────────────────────────────────────────────────────────── */

export const services: DemoService[] = catalog.services;

/** Namuu-д багц хараахан тодорхойгүй — жинхэнэ систем дэмждэг ч демод хоосон. */
export const packages: DemoPackage[] = [];

export const branches: DemoBranch[] = [
  {
    id: catalog.branch.id,
    name: catalog.branch.name,
    address: "Хаяг тодорхойгүй",
    phone: "—",
    openMin: catalog.branch.openMin,
    closeMin: catalog.branch.closeMin,
    closedDays: catalog.branch.closedDays,
  },
];

export const staff: DemoStaff[] = catalog.staff.map((m) => ({ ...m, branchId: catalog.branch.id }));

export const branchOf = (staffId: string) =>
  staff.find((m) => m.id === staffId)?.branchId ?? branches[0].id;

/** Захиалсан зүйлийн нэр, хугацаа, үнэ — үйлчилгээ ч, багц ч адилхан. */
export function itemInfo(item: string): {
  label: string;
  durationMin: number;
  price: number;
  isPackage: boolean;
} {
  if (item.startsWith("pkg:")) {
    const p = packages.find((x) => `pkg:${x.id}` === item);
    const parts = services.filter((s) => p?.serviceIds.includes(s.id));
    return {
      label: `${p?.name ?? "Багц"} (багц)`,
      durationMin: parts.reduce((sum, s) => sum + s.durationMin, 0) || 60,
      price: p?.price ?? 0,
      isPackage: true,
    };
  }
  const s = services.find((x) => `svc:${x.id}` === item);
  return {
    label: s?.name ?? "—",
    durationMin: s?.durationMin ?? 30,
    price: s?.price ?? 0,
    isPackage: false,
  };
}

/** Мастер энэ зүйлийг хийж чадах уу. Багцыг бүгд хийнэ (дотор нь хуваана). */
export function canDo(m: DemoStaff, item: string): boolean {
  return item.startsWith("pkg:") || m.serviceIds.includes(item.slice(4));
}

/**
 * Тухайн мастер, өдөр `start`-аас `durationMin` минут завтай юу.
 * `ignoreId` — засаж буй захиалга өөртэйгөө давхцахгүй.
 */
export function isFree(
  list: DemoBooking[],
  staffId: string,
  day: number,
  start: number,
  durationMin: number,
  ignoreId?: string,
): boolean {
  return !list.some((b) => {
    if (b.id === ignoreId || b.staffId !== staffId || b.day !== day) return false;
    if (b.status === "cancelled") return false;
    const end = b.start + itemInfo(b.item).durationMin;
    return start < end && b.start < start + durationMin;
  });
}

/**
 * Мастерын тухайн өдрийн сул эхлэх цагууд. Жинхэнэ системийн дүрэмтэй ижил:
 * салбарын нээх/хаах цаг, амралтын өдөр, давхцал. Админ 15 минутаар, нийтийн
 * захиалга салбарын `slotMinutes`-аар алхана.
 */
export function freeSlots(
  list: DemoBooking[],
  staffId: string,
  day: number,
  durationMin: number,
  ignoreId?: string,
  step = 15,
): number[] {
  const branch = branches.find((br) => br.id === branchOf(staffId)) ?? branches[0];
  const out: number[] = [];
  for (let t = branch.openMin; t + durationMin <= branch.closeMin; t += step) {
    if (isFree(list, staffId, day, t, durationMin, ignoreId)) out.push(t);
  }
  return out;
}

/* ── Захиалгууд ────────────────────────────────────────────────────── */

/** Зохиомол нэрс — бодит үйлчлүүлэгчид биш. */
const FIRST = [
  "Ариунаа", "Мөнхзул", "Оюунаа", "Энхжин", "Баярмаа", "Сарнай", "Хулан",
  "Номуун", "Уянга", "Дөлгөөн", "Сувдаа", "Оюука", "Саруул", "Анужин",
  "Золбоо", "Туяа", "Солонго", "Цэцгээ", "Гэрэлээ", "Нандин",
  "Алтанцэцэг", "Марал", "Индра", "Сэлэнгэ",
];
const INITIAL = "АБГДЭЖЗИЛМНОӨПРСТУҮХЦЧШ";

/** Тогтвортой санамсаргүй тоо — demo бүр ижилхэн дүр зурагтай нээгдэнэ. */
function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const T = (h: number, m = 0) => h * 60 + m;

/**
 * Өнөөдрийн хуваарь — гараар зохиосон, хуанлийн онцлогууд (баталгаажсан/
 * хүлээгдэж буй, дууссан, ирээгүй, ★, 👥 хамт захиалсан, цуцлагдсан түүх)
 * нэг дэлгэцэд харагдахаар.
 */
const TODAY: Omit<DemoBooking, "id" | "code" | "day">[] = [
  { name: "Т. Энхжин", phone: "9019 7766", item: "svc:gel-mani", staffId: "anudari", start: T(10), status: "done", paid: 55000 },
  { name: "Б. Сарнай", phone: "8800 1122", item: "svc:extension", staffId: "anudari", start: T(11, 30), status: "confirmed", paid: 0, locked: true, note: "Бүйлсэн хэлбэр, дунд урт" },
  { name: "Н. Хулан", phone: "9911 4545", item: "svc:gel-mani", staffId: "anudari", start: T(14), status: "confirmed", paid: 0, groupId: "g-hulan" },
  { name: "Б. Ариунаа", phone: "9911 2233", item: "svc:french", staffId: "anudari", start: T(15, 30), status: "pending", paid: 0 },
  { name: "О. Гэрэлээ", phone: "8899 3030", item: "svc:refill", staffId: "anudari", start: T(17, 30), status: "pending", paid: 0 },

  { name: "Г. Баярмаа", phone: "9505 3311", item: "svc:art", staffId: "misheel", start: T(10), status: "cancelled", paid: 0 },
  { name: "Э. Номуун", phone: "9922 7171", item: "svc:art", staffId: "misheel", start: T(10, 30), status: "done", paid: 75000 },
  { name: "С. Уянга", phone: "8811 6060", item: "svc:chrome", staffId: "misheel", start: T(12, 30), status: "no_show", paid: 0 },
  { name: "А. Дөлгөөн", phone: "9900 1818", item: "svc:art", staffId: "misheel", start: T(14, 15), status: "confirmed", paid: 0, locked: true, note: "Зураг авчирна — цэцэгсийн дизайн" },
  { name: "З. Марал", phone: "9977 2424", item: "svc:chrome", staffId: "misheel", start: T(17), status: "pending", paid: 0 },

  { name: "Ц. Сувдаа", phone: "8800 6543", item: "svc:pedi", staffId: "nomin", start: T(10), status: "done", paid: 45000 },
  { name: "П. Оюука", phone: "9191 5252", item: "svc:gel-pedi", staffId: "nomin", start: T(11, 15), status: "confirmed", paid: 0 },
  { name: "Н. Хулан", phone: "9911 4545", item: "svc:gel-pedi", staffId: "nomin", start: T(14), status: "confirmed", paid: 0, groupId: "g-hulan" },
  { name: "Л. Саруул", phone: "9595 8686", item: "svc:extension", staffId: "nomin", start: T(16), status: "confirmed", paid: 0 },
  { name: "М. Анужин", phone: "8888 0707", item: "svc:removal", staffId: "nomin", start: T(18, 30), status: "pending", paid: 0 },
];

/**
 * Бусад өдрүүдийг дүүргэнэ. Ойрын өдрүүд дүүрэн, хол ирээдүй сул — жинхэнэ
 * салоны хуанли шиг. Өнгөрсөн өдрүүд ихэнхдээ "дууссан".
 */
function generateDay(
  day: number,
  m: DemoStaff,
  weekday: number,
  next: () => string,
): Omit<DemoBooking, "id" | "code">[] {
  const branch = branches.find((b) => b.id === m.branchId)!;
  if (branch.closedDays.includes(weekday)) return [];

  const rand = seeded(day * 97 + m.id.length * 13 + m.id.charCodeAt(0));
  const weekend = weekday === 5 || weekday === 6;
  // Ирээдүйн өдрүүдэд 2 цагийн үйлчилгээнд ч сул зай үлдээнэ — танилцуулгын
  // үеэр "маргааш" захиалах боломжтой байх ёстой.
  const fill =
    day < 0 ? 0.72 : day <= 2 ? 0.42 : day <= 7 ? 0.36 : Math.max(0.12, 0.32 - day * 0.008);
  const load = Math.min(0.9, fill + (weekend ? 0.14 : 0));

  const out: Omit<DemoBooking, "id" | "code">[] = [];
  let t = branch.openMin + (rand() < 0.5 ? 0 : 30);
  // Ирээдүйн өдөрт мастер бүрт хязгаартай тооны захиалга — 3 мастертай
  // жижиг салонд өдөр бүрэн дүүрэхгүй, онлайн захиалах сул цаг үлдэнэ.
  const cap = day <= 0 ? Infinity : day <= 2 ? 4 : 3;
  while (t < branch.closeMin && out.length < cap) {
    if (rand() > load) {
      t += rand() < 0.5 ? 30 : 60;
      continue;
    }
    const svcId = m.serviceIds[Math.floor(rand() * m.serviceIds.length)];
    const svc = services.find((s) => s.id === svcId)!;
    if (t + svc.durationMin > branch.closeMin) break;

    // "Хүлээгдэж буй" нь дөнгөж онлайнаар орж ирсэн захиалга — ойрын хоёр
    // өдөрт л цөөн байна, эс тэгвэл самбарын тоо бодитой бус өндөр гарна.
    const r = rand();
    const pendingShare = day <= 0 ? 0.1 : day <= 2 ? 0.08 : 0;
    const status: Status =
      day < 0
        ? r < 0.06 ? "cancelled" : r < 0.11 ? "no_show" : "done"
        : r < 0.05 ? "cancelled" : r < 0.05 + pendingShare ? "pending" : "confirmed";
    out.push({
      name: next(),
      phone: `${88 + Math.floor(rand() * 12)}${String(Math.floor(rand() * 100)).padStart(2, "0")} ${String(Math.floor(rand() * 10000)).padStart(4, "0")}`,
      item: `svc:${svcId}`,
      staffId: m.id,
      day,
      start: t,
      status,
      paid: status === "done" ? svc.price : 0,
      locked: rand() < 0.12,
    });
    t += svc.durationMin + (day <= 0 ? (rand() < 0.35 ? 15 : 0) : rand() < 0.5 ? 30 : 60);
  }
  return out;
}

/**
 * Demo нээгдэх үеийн бүх захиалга. Өнөөдрийн хуваарийг цагтай нь тааруулна:
 * аль хэдийн өнгөрсөн нь "дууссан", хараахан болоогүй нь "баталгаажсан" —
 * ингэснээр "яг одоо" шугамын дээд, доод тал утга учиртай харагдана.
 */
export function createBookings(today: Date, nowMin: number): DemoBooking[] {
  const nameRand = seeded(7);
  const next = () =>
    `${INITIAL[Math.floor(nameRand() * INITIAL.length)]}. ${FIRST[Math.floor(nameRand() * FIRST.length)]}`;

  const raw: Omit<DemoBooking, "id" | "code">[] = [];
  // 62 хоногийн түүх — энэ сар болон өмнөх сарын мөн үетэй харьцуулахад хүрэлцэнэ.
  for (let day = -62; day <= 34; day++) {
    if (day === 0) continue;
    const weekday = dateOf(today, day).getDay();
    for (const m of staff) raw.push(...generateDay(day, m, weekday, next));
  }
  raw.push(...TODAY.map((b) => ({ ...b, day: 0 })));

  return raw
    .sort((a, b) => a.day - b.day || a.start - b.start)
    .map((b, i) => {
      let status = b.status;
      if (b.day === 0 && status !== "cancelled" && status !== "pending") {
        const ended = b.start + itemInfo(b.item).durationMin <= nowMin;
        if (ended && status === "confirmed") status = "done";
        if (!ended && (status === "done" || status === "no_show")) status = "confirmed";
      }
      const price = itemInfo(b.item).price;
      return {
        ...b,
        status,
        paid: status === "done" ? price : Math.min(b.paid, price),
        id: `b${i + 1}`,
        code: `NM-${4100 + i}`,
      };
    });
}

/** "Шинэ захиалга ирүүлж үзэх" — онлайнаар орж ирэх жишээ (зохиомол) үйлчлүүлэгчид. */
export const incoming = [
  { name: "Х. Золжаргал", phone: "9977 1212", item: "svc:art" },
  { name: "Ц. Сувд-Эрдэнэ", phone: "8800 6544", item: "svc:gel-mani" },
  { name: "Ө. Тэмүүлэн", phone: "9911 0099", item: "svc:extension" },
  { name: "Б. Мөнхчимэг", phone: "9595 3434", item: "svc:gel-pedi" },
];
