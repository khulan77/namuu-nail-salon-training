"use client";

import { hhmm, money, itemInfo, type DemoBooking } from "./demo-data";
import {
  ATTENDANCE_ICON,
  ATTENDANCE_LABEL,
  ATTENDANCE_STYLE,
  attendees,
  dateKey,
  markFor,
  statusForCheckIn,
  type AttendanceLog,
  type AttendanceMark,
  type AttendanceStatus,
} from "./attendance-data";
import { branch } from "@/app/lib/namuu/catalog";
import type { Account } from "./roles";

/*
  Ирцийн бүртгэл — ДЕМО. Ресепшн/эзэн бүх ажилтны ирцийг тэмдэглэнэ, мастер
  зөвхөн өөрийгөө "Ирлээ" гэж бүртгүүлнэ. Ирээгүй мастерт өнөөдөр захиалга
  байвал анхааруулна.
*/

const STATUSES: AttendanceStatus[] = ["present", "late", "absent", "leave"];

export type SetMark = (key: string, accountId: string, mark: AttendanceMark | null) => void;

export function StatusChip({ mark }: { mark?: AttendanceMark }) {
  if (!mark) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-muted ring-1 ring-border">
        Бүртгээгүй
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${ATTENDANCE_STYLE[mark.status]}`}>
      <span aria-hidden>{ATTENDANCE_ICON[mark.status]}</span>
      {ATTENDANCE_LABEL[mark.status]}
      {mark.time && <span className="font-normal opacity-80">· {mark.time}</span>}
    </span>
  );
}

/** Ажилтан өөрөө "Ирлээ" гэж бүртгүүлэх карт — хянах самбар дээр. */
export function CheckInCard({
  account,
  today,
  nowMin,
  log,
  setMark,
}: {
  account: Account;
  today: Date;
  nowMin: number;
  log: AttendanceLog;
  setMark: SetMark;
}) {
  const key = dateKey(today);
  const mark = markFor(log, key, account.id, key);
  return (
    <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-surface px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Өнөөдрийн ирц</p>
        <p className="mt-1">
          <StatusChip mark={mark} />
        </p>
      </div>
      {!mark ? (
        <button
          type="button"
          onClick={() => setMark(key, account.id, { status: statusForCheckIn(nowMin, branch.openMin), time: hhmm(nowMin) })}
          className="btn btn-primary"
        >
          Ирлээ — {hhmm(nowMin)}
        </button>
      ) : (
        <button type="button" onClick={() => setMark(key, account.id, null)} className="text-xs text-muted hover:text-primary">
          Буцаах
        </button>
      )}
    </div>
  );
}

export function Attendance({
  today,
  nowMin,
  log,
  setMark,
  bookings,
  self,
  canManage,
  onCalendar,
}: {
  today: Date;
  nowMin: number;
  log: AttendanceLog;
  setMark: SetMark;
  bookings: DemoBooking[];
  self: Account;
  canManage: boolean;
  onCalendar: () => void;
}) {
  const todayKey = dateKey(today);
  const people = canManage ? attendees : attendees.filter((a) => a.id === self.id);

  // Энэ сарын 1-нээс өнөөдөр хүртэлх өдрүүд
  const monthDays = Array.from({ length: today.getDate() }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
    return { key: dateKey(d), date: d.getDate(), weekday: d.getDay() };
  });

  const summary = people.map((a) => {
    const counts: Record<AttendanceStatus, number> = { present: 0, late: 0, absent: 0, leave: 0 };
    for (const d of monthDays) {
      const m = markFor(log, d.key, a.id, todayKey);
      if (m) counts[m.status]++;
    }
    const worked = counts.present + counts.late;
    const expected = worked + counts.absent;
    return { account: a, counts, rate: expected ? Math.round((worked / expected) * 100) : 100 };
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">Ирц</h1>
      <p className="mt-1 text-sm text-muted">
        {canManage
          ? `Ажилтнуудын өнөөдрийн ирцийг тэмдэглэнэ. ${hhmm(branch.openMin)}-аас хойш ирвэл "Хоцорсон" гэж автоматаар тооцно.`
          : "Өөрийн ирцээ бүртгүүлж, энэ сарын түүхээ харна."}
      </p>

      {/* ── Өнөөдөр ── */}
      <ul className="mt-6 space-y-3">
        {people.map((a) => {
          const mark = markFor(log, todayKey, a.id, todayKey);
          const todays = a.staffId
            ? bookings.filter((b) => b.staffId === a.staffId && b.day === 0 && b.status !== "cancelled" && b.status !== "done")
            : [];
          const missing = mark && (mark.status === "absent" || mark.status === "leave") && todays.length > 0;
          return (
            <li key={a.id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-lg text-primary">
                  {a.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted">
                    {a.title}
                    {a.staffId && ` · өнөөдөр ${todays.length} захиалга`}
                  </p>
                </div>
                <StatusChip mark={mark} />
              </div>

              {canManage ? (
                // Гар утсанд 4 товч нэг мөрөнд (тэмдэг дээр, нэр доор), том дэлгэцэд хэвтээ
                <div
                  className="mt-3 grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2"
                  role="group"
                  aria-label={`${a.name} — ирц`}
                >
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={mark?.status === s}
                      onClick={() =>
                        setMark(todayKey, a.id, {
                          status: s,
                          time: s === "present" || s === "late" ? hhmm(nowMin) : undefined,
                        })
                      }
                      className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium transition-colors sm:min-h-10 sm:flex-row sm:gap-1 sm:rounded-full sm:px-4 sm:text-xs ${
                        mark?.status === s ? "bg-primary text-white" : "bg-surface-2 text-foreground/80 hover:bg-primary-soft"
                      }`}
                    >
                      <span aria-hidden className="text-sm leading-none sm:text-xs">
                        {ATTENDANCE_ICON[s]}
                      </span>
                      <span className="truncate">{ATTENDANCE_LABEL[s]}</span>
                    </button>
                  ))}
                  {mark && (
                    <button
                      type="button"
                      onClick={() => setMark(todayKey, a.id, null)}
                      className="col-span-4 min-h-8 text-right text-xs text-muted hover:text-primary sm:min-h-10 sm:px-2"
                    >
                      Арилгах
                    </button>
                  )}
                </div>
              ) : (
                !mark && (
                  <button
                    type="button"
                    onClick={() => setMark(todayKey, a.id, { status: statusForCheckIn(nowMin, branch.openMin), time: hhmm(nowMin) })}
                    className="btn btn-primary mt-3"
                  >
                    Ирлээ — {hhmm(nowMin)}
                  </button>
                )
              )}

              {missing && (
                <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs leading-5 text-red-800">
                  <b>Анхаар:</b> {a.name} өнөөдөр {todays.length} захиалгатай (
                  {todays
                    .slice(0, 3)
                    .map((b) => `${hhmm(b.start)} ${b.name}`)
                    .join(", ")}
                  {todays.length > 3 ? "…" : ""}) — нийт {money(todays.reduce((s, b) => s + itemInfo(b.item).price, 0))}.
                  {canManage && (
                    <button type="button" onClick={onCalendar} className="ml-1 font-medium underline underline-offset-2">
                      Хуанлид өөр мастер руу шилжүүлэх →
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* ── Энэ сар ── */}
      <h2 className="mt-10 font-display text-2xl text-foreground">Энэ сарын ирц</h2>
      <p className="mt-1 text-xs text-muted">Өмнөх өдрүүдийн ирц жишээ өгөгдөл.</p>

      <div className="card mt-4 overflow-x-auto">
        {/* Гар утсанд баганын гарчиг тэмдгээр (доорх тайлбартай ижил) — хажуу тийш гүйлгэхгүй */}
        <table className="w-full text-left text-sm sm:min-w-[34rem]">
          <thead className="border-b border-border/70 text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium sm:px-5">Ажилтан</th>
              {STATUSES.map((s) => (
                <th key={s} className="px-1.5 py-3 text-right font-medium sm:px-3" title={ATTENDANCE_LABEL[s]}>
                  <span aria-hidden className="sm:hidden">
                    {ATTENDANCE_ICON[s]}
                  </span>
                  <span className="sr-only sm:not-sr-only">{ATTENDANCE_LABEL[s]}</span>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium sm:px-5">Ирц</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 tabular-nums">
            {summary.map(({ account, counts, rate }) => (
              <tr key={account.id}>
                <td className="px-4 py-3 sm:px-5">
                  <span className="block font-medium text-foreground">{account.name}</span>
                  <span className="hidden text-xs text-muted sm:block">{account.title}</span>
                </td>
                {STATUSES.map((s) => (
                  <td key={s} className="px-1.5 py-3 text-right sm:px-3">
                    {counts[s]}
                  </td>
                ))}
                <td className="px-4 py-3 text-right font-medium text-foreground sm:px-5">{rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Өдөр бүрийн тор — тэмдэг + өнгө, доор тайлбар */}
      <div className="card mt-4 overflow-x-auto p-5">
        <div className="min-w-max">
          <div className="flex gap-1 pl-28 text-[10px] tabular-nums text-muted">
            {monthDays.map((d) => (
              <span key={d.key} className={`w-6 text-center ${d.weekday === 0 || d.weekday === 6 ? "font-semibold" : ""}`}>
                {d.date}
              </span>
            ))}
          </div>
          {people.map((a) => (
            <div key={a.id} className="mt-1.5 flex items-center gap-1">
              <span className="w-28 shrink-0 truncate pr-2 text-xs text-foreground">{a.name}</span>
              {monthDays.map((d) => {
                const m = markFor(log, d.key, a.id, todayKey);
                return (
                  <span
                    key={d.key}
                    title={`${d.date}-ны өдөр: ${m ? ATTENDANCE_LABEL[m.status] + (m.time ? " " + m.time : "") : "бүртгээгүй"}`}
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] ring-1 ${
                      m ? ATTENDANCE_STYLE[m.status] : "bg-background text-muted ring-border"
                    }`}
                  >
                    {m ? ATTENDANCE_ICON[m.status] : ""}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <ul className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted" aria-label="Тайлбар">
          {STATUSES.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className={`flex h-4 w-4 items-center justify-center rounded text-[9px] ring-1 ${ATTENDANCE_STYLE[s]}`}>
                {ATTENDANCE_ICON[s]}
              </span>
              {ATTENDANCE_LABEL[s]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
