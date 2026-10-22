/*
  Ирцийн бүртгэл — ДЕМО. Өнгөрсөн өдрүүдийн ирц тогтвортой санамсаргүйгээр
  үүснэ (сарын тайлан дүүрэн харагдахын тулд), өнөөдрийнх хоосон эхэлж
  ресепшн/эзэн эсвэл ажилтан өөрөө тэмдэглэнэ. Гараар тэмдэглэсэн нь
  демо санд (`attendance`) хадгалагдаж, үүссэн утгыг давж бичнэ.
*/
import { accounts } from "./roles";

export type AttendanceStatus = "present" | "late" | "absent" | "leave";

export type AttendanceMark = { status: AttendanceStatus; time?: string; note?: string };

/** Огноо ("2026-10-22") → ажилтны id → тэмдэглэгээ */
export type AttendanceLog = Record<string, Record<string, AttendanceMark>>;

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  present: "Ирсэн",
  late: "Хоцорсон",
  absent: "Ирээгүй",
  leave: "Чөлөөтэй",
};

/** Төлөвийн өнгө — үргэлж бичигтэй хамт (зөвхөн өнгөөр ялгахгүй). */
export const ATTENDANCE_STYLE: Record<AttendanceStatus, string> = {
  present: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  late: "bg-amber-50 text-amber-800 ring-amber-200",
  absent: "bg-red-50 text-red-800 ring-red-200",
  leave: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const ATTENDANCE_ICON: Record<AttendanceStatus, string> = {
  present: "✓",
  late: "◷",
  absent: "✕",
  leave: "–",
};

/** Ирц бүртгэх ажилтнууд — эзнээс бусад. */
export const attendees = accounts.filter((a) => a.id !== "owner");

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

/** Өнгөрсөн өдрийн жишээ ирц. Ихэнхдээ ирсэн, хааяа хоцорсон/чөлөө/ирээгүй. */
export function seededMark(key: string, accountId: string): AttendanceMark {
  const r = hash(`${key}:${accountId}`);
  const minute = Math.floor(hash(`${accountId}:${key}:t`) * 12);
  if (r < 0.04) return { status: "absent" };
  if (r < 0.09) return { status: "leave" };
  if (r < 0.2) return { status: "late", time: `10:${String(8 + minute * 2).padStart(2, "0")}` };
  return { status: "present", time: `09:${String(45 + minute).padStart(2, "0")}` };
}

/** Тухайн өдрийн ажилтны ирц: гараар тэмдэглэсэн > өнгөрсөн өдрийн жишээ > (өнөөдөр бол) хоосон. */
export function markFor(log: AttendanceLog, key: string, accountId: string, todayKey: string): AttendanceMark | undefined {
  const manual = log[key]?.[accountId];
  if (manual) return manual;
  if (key < todayKey) return seededMark(key, accountId);
  return undefined;
}

/** "10:00"-аас хойш ирвэл хоцорсон гэж тооцно (салбарын нээх цаг). */
export function statusForCheckIn(nowMin: number, openMin: number): AttendanceStatus {
  return nowMin > openMin + 5 ? "late" : "present";
}
