/*
  ДЕМО ӨГӨГДЛИЙН САН — зөвхөн хөтчийн localStorage.

  Нийтийн сайтын захиалга (/book), сургалтын хүсэлт (/training) болон админы
  демо (/demo/admin) энэ нэг санг хуваалцана. Тиймээс танилцуулгын үеэр
  "сайтаас захиалга өгөх → админд гарч ирэх" урсгалыг өгөгдлийн сангүйгээр
  НЭГ хөтөч дотор бодитоор үзүүлж болно.

  Анхаар: энэ нь жинхэнэ backend БИШ. Өгөгдөл зөвхөн тухайн хөтөчид
  хадгалагдана, өөр төхөөрөмж эсвэл салон руу юу ч илгээгдэхгүй. Жинхэнэ
  систем (`app/_live`, Supabase) огт хөндөгдөхгүй.

  Зөвхөн client дээр дуудна (`window` шаардлагатай).
*/
import type { AttendanceLog } from "./admin/attendance-data";
import { createBookings, isFree, itemInfo, type DemoBooking } from "./admin/demo-data";
import type { Role } from "./admin/roles";

// v2: урьдчилгаа, эрх, ирц нэмэгдсэн — хуучин хадгалалтыг шинээр үүсгэнэ.
const KEY = "namuu-demo-v2";

export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  courseId: string;
  message: string;
  createdAt: string; // ISO
  handled?: boolean;
};

export type DemoSettings = {
  /** Онлайн захиалгад урьдчилгаа шаардах эсэх */
  depositEnabled: boolean;
  /** Урьдчилгааны дүн ₮ — ЖИШЭЭ */
  depositAmount: number;
};

export const DEFAULT_SETTINGS: DemoSettings = { depositEnabled: true, depositAmount: 20000 };

type Saved = {
  date: string;
  bookings: DemoBooking[];
  enquiries: Enquiry[];
  settings: DemoSettings;
  /** Хэрэглэгчийн id → эрх (анхдагчаас өөрчилсөн нь л) */
  roles: Record<string, Role>;
  /** Демо дээр "нэвтэрсэн" хэрэглэгч */
  session: string;
  attendance: AttendanceLog;
};

/** Хуучин эсвэл дутуу хадгалалтад анхдагч утгуудыг нөхнө. */
function withDefaults(s: Partial<Saved> & Pick<Saved, "date" | "bookings">): Saved {
  return {
    ...s,
    enquiries: s.enquiries ?? [],
    settings: { ...DEFAULT_SETTINGS, ...s.settings },
    roles: s.roles ?? {},
    session: s.session ?? "owner",
    attendance: s.attendance ?? {},
  };
}

/** localStorage хаалттай (private горим г.м) үед хуудас ажилласаар байх нөөц. */
let memory: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}

function writeRaw(value: string): void {
  memory = value;
  try {
    // Ижил өгөгдлийг дахин бичихгүй — эс тэгвэл нээлттэй хоёр таб `storage`
    // үйл явдлаар бие биенээ эцэс төгсгөлгүй шинэчилнэ.
    if (window.localStorage.getItem(KEY) !== value) window.localStorage.setItem(KEY, value);
  } catch {
    /* хадгалах боломжгүй — санах ойд үлдэнэ */
  }
}

export function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Хадгалсан демо өгөгдлийг уншина. Өдөр солигдсон бол жишээ захиалгуудыг
 * шинээр үүсгэж, сайтаас өгсөн захиалгуудыг шинэ өдрийн тоололд шилжүүлнэ.
 */
export function loadDemo(): Saved {
  const today = todayStart();
  const key = dateKey(today);

  let saved: Saved | null = null;
  try {
    saved = JSON.parse(readRaw() ?? "null");
  } catch {
    saved = null;
  }
  if (saved && saved.date === key && Array.isArray(saved.bookings)) {
    return withDefaults(saved);
  }

  let carried: DemoBooking[] = [];
  if (saved?.date && Array.isArray(saved.bookings)) {
    const prev = new Date(`${saved.date}T00:00:00`);
    const shift = Math.round((today.getTime() - prev.getTime()) / 86_400_000);
    carried = saved.bookings
      .filter((b) => b.source === "online")
      .map((b) => ({ ...b, day: b.day - shift, fresh: false }));
  }

  // Эрх, тохиргоо, ирц өдөр солигдоход хэвээр үлдэнэ.
  const next = withDefaults({
    ...saved,
    date: key,
    bookings: [...createBookings(today, nowMinutes()), ...carried],
  });
  writeRaw(JSON.stringify(next));
  return next;
}

/** Демо сангийн нэг буюу хэд хэдэн хэсгийг хадгална (ижил бол бичихгүй). */
export function saveDemo(patch: Partial<Omit<Saved, "date">>): void {
  const state = loadDemo();
  writeRaw(JSON.stringify({ ...state, ...patch }));
}

export type NewOnlineBooking = {
  name: string;
  phone: string;
  note: string;
  serviceId: string;
  staffId: string;
  day: number;
  start: number;
  /** Урьдчилгаа төлсөн бол дүн — жинхэнэ системтэй адил захиалга шууд баталгаажна. */
  deposit?: number;
};

/**
 * Сайтаас ирсэн демо захиалга. Хадгалахын өмнө давхцлыг ДАХИН шалгана —
 * жинхэнэ системийн DB unique индекстэй адил сүүлчийн хамгаалалт.
 * Цаг аль хэдийн эзлэгдсэн бол null буцаана.
 */
export function addOnlineBooking(input: NewOnlineBooking): DemoBooking | null {
  const state = loadDemo();
  const item = `svc:${input.serviceId}`;
  const { durationMin } = itemInfo(item);
  if (!isFree(state.bookings, input.staffId, input.day, input.start, durationMin)) return null;

  const used = new Set(state.bookings.map((b) => b.code));
  let n = 5200 + state.bookings.length;
  while (used.has(`NM-${n}`)) n++;

  const booking: DemoBooking = {
    id: `o${Date.now().toString(36)}`,
    code: `NM-${n}`,
    name: input.name,
    phone: input.phone,
    note: input.note || undefined,
    item,
    staffId: input.staffId,
    day: input.day,
    start: input.start,
    status: input.deposit ? "confirmed" : "pending",
    paid: input.deposit ?? 0,
    fresh: true,
    source: "online",
  };
  writeRaw(JSON.stringify({ ...state, bookings: [...state.bookings, booking] }));
  return booking;
}

export function addEnquiry(input: Omit<Enquiry, "id" | "createdAt">): Enquiry {
  const state = loadDemo();
  const enquiry: Enquiry = {
    ...input,
    id: `e${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  writeRaw(JSON.stringify({ ...state, enquiries: [enquiry, ...state.enquiries] }));
  return enquiry;
}

/** Демог анхны байдалд нь буцаана (сайтаас өгсөн захиалга, хүсэлт устна). */
export function resetDemo(): Saved {
  memory = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return loadDemo();
}

/** Өөр таб демо өгөгдлийг өөрчлөхөд дуудагдана (жишээ нь /book дээр захиалга өгөхөд). */
export function subscribeDemo(onChange: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
