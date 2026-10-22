"use client";

import { useState } from "react";
import { PRICES_CONFIRMED } from "@/app/lib/namuu/catalog";
import { WEEKDAYS, dateOf, itemInfo, money, services, staff, type DemoBooking } from "./demo-data";

/*
  Орлогын тооцоо — зөвхөн эзэн/админд. Орлого = "дууссан" захиалгын үнэ
  (үйлчилгээ хийгдсэний дараа тооцогдоно). Урьдчилгааг тусад нь харуулна.
  Бүх дүн демо (жишээ үнэ, зохиомол захиалга) өгөгдлөөс.
*/

export type Period = "today" | "week" | "month";

const PERIOD_LABEL: Record<Period, string> = { today: "Өнөөдөр", week: "Сүүлийн 7 хоног", month: "Энэ сар" };
const PREV_LABEL: Record<Period, string> = {
  today: "өнгөрсөн долоо хоногийн мөн өдөр, мөн цаг",
  week: "өмнөх 7 хоног",
  month: "өмнөх сарын мөн үе",
};

const priceOf = (b: DemoBooking) => itemInfo(b.item).price;
const sum = (list: DemoBooking[]) => list.reduce((s, b) => s + priceOf(b), 0);

/** Өнөөдрөөс хойш (сөрөг) хэдэн хоног — огнооноос. */
function offsetOf(today: Date, d: Date): number {
  return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - today.getTime()) / 86_400_000);
}

/** Тухайн хугацааны [эхлэх, дуусах] өдрийн offset, мөн харьцуулах өмнөх хугацаа. */
export function ranges(today: Date, period: Period) {
  if (period === "today") return { cur: [0, 0] as const, prev: [-7, -7] as const };
  if (period === "week") return { cur: [-6, 0] as const, prev: [-13, -7] as const };
  const start = offsetOf(today, new Date(today.getFullYear(), today.getMonth(), 1));
  const prevStart = offsetOf(today, new Date(today.getFullYear(), today.getMonth() - 1, 1));
  const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  const prevEnd = prevStart + Math.min(today.getDate(), prevMonthDays) - 1;
  return { cur: [start, 0] as const, prev: [prevStart, prevEnd] as const };
}

const inRange = (b: DemoBooking, [a, z]: readonly [number, number]) => b.day >= a && b.day <= z;
const done = (list: DemoBooking[], r: readonly [number, number]) =>
  list.filter((b) => b.status === "done" && inRange(b, r));

/**
 * "Өнөөдөр"-ийг өнгөрсөн долоо хоногийн мөн өдрийн ЯГ ИЖИЛ цаг хүртэлхтэй
 * харьцуулна — өдөр дуусаагүй байхад бүтэн өдөртэй харьцуулбал буурсан мэт
 * харагдана.
 */
const doneBy = (list: DemoBooking[], r: readonly [number, number], nowMin: number) =>
  done(list, r).filter((b) => b.start + itemInfo(b.item).durationMin <= nowMin);

/** 1250000 -> "1.3 сая", 85000 -> "85 мян" — тэнхлэгийн товч бичлэг. */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)} сая`;
  if (n >= 1000) return `${Math.round(n / 1000)} мян`;
  return String(n);
}

function Delta({ cur, prev, label }: { cur: number; prev: number; label: string }) {
  if (prev === 0) return <span className="text-xs text-muted">{label}: харьцуулах өгөгдөлгүй</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className="text-xs text-muted">
      <span className={`font-medium ${up ? "text-emerald-700" : "text-red-700"}`}>
        {up ? "▲" : "▼"} {Math.abs(pct)}%
      </span>{" "}
      {label}-тэй харьцуулахад
    </span>
  );
}

/* ── Хянах самбарын товч хураангуй ─────────────────────────────────── */

export function MoneySummary({
  today,
  nowMin,
  bookings,
  onOpen,
}: {
  today: Date;
  nowMin: number;
  bookings: DemoBooking[];
  onOpen: () => void;
}) {
  const t = ranges(today, "today");
  const m = ranges(today, "month");
  const todayDone = done(bookings, t.cur);
  const todayExpected = bookings.filter(
    (b) => b.day === 0 && (b.status === "confirmed" || b.status === "pending"),
  );
  const monthDone = done(bookings, m.cur);
  const topService = rank(monthDone, "service")[0];
  const topStaff = rank(monthDone, "staff")[0];

  return (
    <div className="mt-3 grid gap-3 lg:grid-cols-2">
      <button
        type="button"
        onClick={onOpen}
        className="rounded-[1.75rem] bg-primary-soft px-5 py-6 text-left transition-colors hover:bg-primary-soft/70 sm:px-7"
      >
        <p className="text-sm text-muted">Өнөөдрийн орлого</p>
        <p className="mt-1.5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{money(sum(todayDone))}</p>
        <p className="mt-1.5 text-xs text-muted">
          {todayDone.length} үйлчилгээ дууссан · дуусаагүй {todayExpected.length} захиалга ≈ {money(sum(todayExpected))}
        </p>
        <p className="mt-1">
          <Delta cur={sum(todayDone)} prev={sum(doneBy(bookings, t.prev, nowMin))} label={PREV_LABEL.today} />
        </p>
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="rounded-[1.75rem] bg-surface-2/80 px-5 py-6 text-left transition-colors hover:bg-primary-soft/60 sm:px-7"
      >
        <p className="text-sm text-muted">Энэ сарын орлого</p>
        <p className="mt-1.5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{money(sum(monthDone))}</p>
        <p className="mt-1.5 text-xs text-muted">
          {monthDone.length} үйлчилгээ
          {topService && <> · шилдэг: {topService.name}</>}
          {topStaff && <> · {topStaff.name}</>}
        </p>
        <p className="mt-1">
          <Delta cur={sum(monthDone)} prev={sum(done(bookings, m.prev))} label={PREV_LABEL.month} />
        </p>
      </button>
      {!PRICES_CONFIRMED && (
        <p className="text-[11px] text-muted lg:col-span-2">Жишээ үнэ, зохиомол захиалгаар тооцсон.</p>
      )}
    </div>
  );
}

function rank(list: DemoBooking[], by: "service" | "staff") {
  const rows =
    by === "service"
      ? services.map((s) => {
          const items = list.filter((b) => b.item === `svc:${s.id}`);
          return { id: s.id, name: s.name, total: sum(items), count: items.length };
        })
      : staff.map((m) => {
          const items = list.filter((b) => b.staffId === m.id);
          return { id: m.id, name: m.name, total: sum(items), count: items.length };
        });
  return rows.filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
}

/* ── Орлогын таб ──────────────────────────────────────────────────── */

export function Revenue({ today, nowMin, bookings }: { today: Date; nowMin: number; bookings: DemoBooking[] }) {
  const [period, setPeriod] = useState<Period>("month");
  const r = ranges(today, period);
  const cur = done(bookings, r.cur);
  const prev = period === "today" ? doneBy(bookings, r.prev, nowMin) : done(bookings, r.prev);
  const total = sum(cur);
  const deposits = bookings.filter(
    (b) => b.day >= 0 && b.paid > 0 && b.status !== "done" && b.status !== "cancelled",
  );
  const noShows = bookings.filter((b) => b.status === "no_show" && inRange(b, r.cur));

  const days = Array.from({ length: r.cur[1] - r.cur[0] + 1 }, (_, i) => {
    const day = r.cur[0] + i;
    const d = dateOf(today, day);
    return {
      day,
      label: period === "week" ? WEEKDAYS[d.getDay()].slice(0, 2) : String(d.getDate()),
      full: `${d.getMonth() + 1}/${d.getDate()} · ${WEEKDAYS[d.getDay()]}`,
      total: sum(cur.filter((b) => b.day === day)),
      count: cur.filter((b) => b.day === day).length,
    };
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">Орлого</h1>
      <p className="mt-1 text-sm text-muted">
        Дууссан үйлчилгээний орлого — аль үйлчилгээ, аль мастер хэр орлого оруулсныг харна.
        {!PRICES_CONFIRMED && " Жишээ үнээр тооцсон."}
      </p>

      <div role="group" aria-label="Хугацаа" className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              period === p ? "bg-primary text-white" : "bg-surface-2 text-foreground/80 hover:bg-primary-soft"
            }`}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Орлого" value={money(total)}>
          <Delta cur={total} prev={sum(prev)} label={PREV_LABEL[period]} />
        </Tile>
        <Tile label="Дууссан үйлчилгээ" value={String(cur.length)}>
          <span className="text-xs text-muted">өмнөх: {prev.length}</span>
        </Tile>
        <Tile label="Дундаж дүн" value={money(Math.round(total / Math.max(1, cur.length) / 100) * 100)}>
          <span className="text-xs text-muted">нэг үйлчилгээнд</span>
        </Tile>
        <Tile label="Урьдчилгаа (ирэх захиалга)" value={money(deposits.reduce((s, b) => s + b.paid, 0))}>
          <span className="text-xs text-muted">
            {deposits.length} захиалга · ирээгүй {noShows.length}
          </span>
        </Tile>
      </div>

      {period !== "today" && <DailyChart days={days} title={`Өдөр бүрийн орлого — ${PERIOD_LABEL[period].toLowerCase()}`} />}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Ranking title="Үйлчилгээгээр" rows={rank(cur, "service")} />
        <Ranking title="Мастераар" rows={rank(cur, "staff")} />
      </div>
    </div>
  );
}

function Tile({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-2/70 px-4 py-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1">{children}</p>
    </div>
  );
}

/** Өдөр бүрийн баганан график — нэг цуваа, нэг өнгө; hover дээр утга, хүснэгтээр ч харж болно. */
function DailyChart({
  days,
  title,
}: {
  days: { day: number; label: string; full: string; total: number; count: number }[];
  title: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(1, ...days.map((d) => d.total));
  // Тэнхлэгийн дээд утгыг цэвэр тоонд тойруулна.
  const step = max > 1_000_000 ? 500_000 : max > 400_000 ? 200_000 : 100_000;
  const top = Math.ceil(max / step) * step;
  const ticks = [top, top / 2, 0];
  const best = days.reduce((a, b) => (b.total > a.total ? b : a), days[0]);
  const shown = hover !== null ? days[hover] : null;

  return (
    <section className="card mt-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <button type="button" onClick={() => setTable((v) => !v)} className="text-xs font-medium text-primary hover:underline">
          {table ? "Графикаар харах" : "Хүснэгтээр харах"}
        </button>
      </div>

      {table ? (
        <div className="mt-4 max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="py-2 font-medium">Өдөр</th>
                <th className="py-2 text-right font-medium">Үйлчилгээ</th>
                <th className="py-2 text-right font-medium">Орлого</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 tabular-nums">
              {days.map((d) => (
                <tr key={d.day}>
                  <td className="py-2">{d.full}</td>
                  <td className="py-2 text-right">{d.count}</td>
                  <td className="py-2 text-right">{money(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <p className="mt-1 h-5 text-xs text-muted" aria-live="polite">
            {shown ? (
              <>
                <b className="text-foreground">{shown.full}</b> — {money(shown.total)} · {shown.count} үйлчилгээ
              </>
            ) : best && best.total > 0 ? (
              <>Хамгийн өндөр: {best.full} — {money(best.total)}</>
            ) : null}
          </p>
          <div className="mt-3 flex gap-2">
            {/* y тэнхлэг */}
            <div className="flex h-44 w-12 shrink-0 flex-col justify-between text-right text-[10px] tabular-nums text-muted">
              {ticks.map((t) => (
                <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
                  {compact(t)}
                </span>
              ))}
            </div>
            <div className="relative min-w-0 flex-1">
              {/* Сүлжээний шугамууд */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-44">
                <span className="absolute inset-x-0 top-0 border-t border-border/70" />
                <span className="absolute inset-x-0 top-1/2 border-t border-border/70" />
                <span className="absolute inset-x-0 bottom-0 border-t border-border" />
              </div>
              <div className="relative flex h-44 items-end" onMouseLeave={() => setHover(null)}>
                {days.map((d, i) => (
                  <button
                    key={d.day}
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    aria-label={`${d.full}: ${money(d.total)}`}
                    className="group flex h-full min-w-0 flex-1 items-end justify-center px-px"
                  >
                    <span
                      style={{ height: `${(d.total / top) * 100}%` }}
                      className={`block w-full max-w-6 rounded-t-[4px] transition-opacity ${
                        hover === null || hover === i ? "bg-chart" : "bg-chart/35"
                      } ${d.total === 0 ? "min-h-0" : "min-h-[2px]"}`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-1.5 flex text-[10px] tabular-nums text-muted">
                {days.map((d, i) => (
                  <span key={d.day} className="min-w-0 flex-1 text-center">
                    {days.length <= 10 || i % 5 === 0 || i === days.length - 1 ? d.label : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Ranking({ title, rows }: { title: string; rows: { id: string; name: string; total: number; count: number }[] }) {
  const top = Math.max(1, ...rows.map((r) => r.total));
  return (
    <section>
      <h2 className="font-display text-xl text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Энэ хугацаанд дууссан үйлчилгээ алга.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {rows.map((r) => (
            <li key={r.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-foreground">
                  {r.name} <span className="text-xs text-muted">· {r.count}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">{money(r.total)}</span>
              </div>
              <span className="mt-1.5 block h-2 rounded-full bg-surface-2">
                <span style={{ width: `${(r.total / top) * 100}%` }} className="block h-full rounded-full bg-chart" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
