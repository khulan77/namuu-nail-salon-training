"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { DemoTag } from "@/app/components/namuu/pending";
import { WEEKDAYS, dateOf, freeSlots, type DemoBooking } from "@/app/demo/admin/demo-data";
import { addOnlineBooking, loadDemo, nowMinutes, todayStart } from "@/app/demo/demo-store";
import {
  PRICES_CONFIRMED,
  STAFF_CONFIRMED,
  branch,
  categories,
  durationLabel,
  hhmm,
  money,
  serviceById,
  services,
  staffById,
  staffForService,
} from "@/app/lib/namuu/catalog";

/*
  Онлайн захиалгын ДЕМО урсгал. Сул цагийг жинхэнэ системийн дүрмээр
  тооцно: салбарын ажлын цаг, цагийн алхам (`slotMinutes`), үйлчилгээний
  үргэлжлэх хугацаа, мастерын бусад захиалгатай давхцах эсэх, өнөөдрийн
  өнгөрсөн цаг. Захиалга хөтчийн демо санд л хадгалагдана — салон руу юу ч
  илгээгдэхгүй, төлбөр авахгүй.
*/

const DAYS_AHEAD = 14;
const ANY = "any";

const STEPS = ["Үйлчилгээ", "Мастер", "Өдөр ба цаг", "Мэдээлэл", "Баталгаажуулах"] as const;

const noopSubscribe = () => () => {};

export default function BookingDemo({ initialServiceId }: { initialServiceId?: string }) {
  // Огноо, "одоо" нь хөтчийн цагаас хамаардаг — сервертэй зөрж hydration
  // алдаа гаргахгүйн тулд зөвхөн хөтөч дээр зурна.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return <div className="mt-10 h-96 animate-pulse rounded-[2rem] bg-surface-2/70" />;
  return <Flow initialServiceId={initialServiceId} />;
}

function Flow({ initialServiceId }: { initialServiceId?: string }) {
  const [today] = useState(todayStart);
  const [bookings, setBookings] = useState<DemoBooking[]>(() => loadDemo().bookings);
  const [step, setStep] = useState(initialServiceId ? 1 : 0);
  const [serviceId, setServiceId] = useState<string | undefined>(initialServiceId);
  const [staffChoice, setStaffChoice] = useState<string>(ANY);
  const [day, setDay] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<DemoBooking | null>(null);
  // Админы "Тохиргоо"-д урьдчилгаа идэвхтэй бол захиалгад урьдчилгааны алхам нэмэгдэнэ.
  const [deposit] = useState(() => {
    const { settings } = loadDemo();
    return settings.depositEnabled ? settings.depositAmount : 0;
  });
  const steps: readonly string[] = deposit ? [...STEPS, "Урьдчилгаа"] : STEPS;

  const service = serviceId ? serviceById(serviceId) : undefined;
  const team = useMemo(() => (serviceId ? staffForService(serviceId) : []), [serviceId]);

  /** Сонгосон өдрийн сул цагууд — цаг бүрт хэн хийх вэ (Аль ч мастер үед эхний сул нь). */
  const slots = useMemo(() => {
    if (!service) return [] as { start: number; staffId: string }[];
    if (branch.closedDays.includes(dateOf(today, day).getDay())) return [];
    const who = staffChoice === ANY ? team.map((m) => m.id) : [staffChoice];
    const nowMin = nowMinutes();
    const map = new Map<number, string>();
    for (const id of who) {
      for (const t of freeSlots(bookings, id, day, service.durationMin, undefined, branch.slotMinutes)) {
        if (day === 0 && t <= nowMin) continue;
        if (!map.has(t)) map.set(t, id);
      }
    }
    return [...map].sort((a, b) => a[0] - b[0]).map(([s, staffId]) => ({ start: s, staffId }));
  }, [service, staffChoice, team, bookings, day, today]);

  const chosen = slots.find((s) => s.start === start);
  const assignedStaff = chosen ? staffById(chosen.staffId) : undefined;

  const go = (n: number) => {
    setError(null);
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function confirm(paid?: number) {
    if (!service || !chosen) return;
    const created = addOnlineBooking({
      name: form.name.trim(),
      phone: form.phone.trim(),
      note: form.note.trim(),
      serviceId: service.id,
      staffId: chosen.staffId,
      day,
      start: chosen.start,
      deposit: paid,
    });
    if (!created) {
      // Энэ хооронд өөр таб (эсвэл админ) тэр цагийг авчихжээ.
      setBookings(loadDemo().bookings);
      setStart(null);
      setError("Уучлаарай, энэ цаг дөнгөж захиалагдлаа. Өөр цаг сонгоно уу.");
      setStep(2);
      return;
    }
    setDone(created);
  }

  if (done && service && assignedStaff) {
    return (
      <Success
        booking={done}
        serviceName={service.name}
        staffName={assignedStaff.name}
        dateLabel={fullDate(today, done.day)}
      />
    );
  }

  const detailsValid = form.name.trim().length >= 2 && form.phone.replace(/\D/g, "").length >= 8;

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
      <div className="min-w-0">
        <ol className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto border-b border-border/70 px-5 pb-4 text-sm">
          {steps.map((label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              className={`flex shrink-0 items-center gap-2 ${i === step ? "text-primary" : i < step ? "text-primary" : "text-muted"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                  i === step ? "border-primary bg-primary text-white" : i < step ? "border-primary" : "border-border"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>

        {error && (
          <p role="alert" className="mt-6 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-primary">
            {error}
          </p>
        )}

        <div className="mt-8">
          {step === 0 && (
            <StepServices
              selected={serviceId}
              onSelect={(id) => {
                setServiceId(id);
                setStaffChoice(ANY);
                setStart(null);
                go(1);
              }}
            />
          )}

          {step === 1 && service && (
            <section aria-labelledby="h-staff">
              <StepTitle id="h-staff" title="Мастер сонгох" tag={STAFF_CONFIRMED ? undefined : "Жишээ мастерууд"} />
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                <Choice
                  active={staffChoice === ANY}
                  onClick={() => {
                    setStaffChoice(ANY);
                    setStart(null);
                    go(2);
                  }}
                  title="Аль ч мастер"
                  sub="Хамгийн олон сул цаг"
                />
                {team.map((m) => (
                  <Choice
                    key={m.id}
                    active={staffChoice === m.id}
                    onClick={() => {
                      setStaffChoice(m.id);
                      setStart(null);
                      go(2);
                    }}
                    title={m.name}
                    sub={m.title}
                  />
                ))}
              </ul>
            </section>
          )}

          {step === 2 && service && (
            <section aria-labelledby="h-time">
              <StepTitle id="h-time" title="Өдөр ба цаг" />
              <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2" role="group" aria-label="Өдөр">
                {Array.from({ length: DAYS_AHEAD }, (_, d) => {
                  const date = dateOf(today, d);
                  const closed = branch.closedDays.includes(date.getDay());
                  const active = d === day;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={closed}
                      aria-pressed={active}
                      onClick={() => {
                        setDay(d);
                        setStart(null);
                      }}
                      className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 transition-colors disabled:opacity-40 ${
                        active ? "border-primary bg-primary text-white" : "border-border bg-surface hover:border-primary/50"
                      }`}
                    >
                      <span className={`text-[11px] ${active ? "text-background/70" : "text-muted"}`}>
                        {d === 0 ? "Өнөөдөр" : d === 1 ? "Маргааш" : WEEKDAYS[date.getDay()]}
                      </span>
                      <span className="mt-1 font-display text-2xl leading-none">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {slots.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-surface-2/70 px-5 py-6 text-center text-sm text-muted">
                  Энэ өдөр сул цаг алга. Өөр өдөр эсвэл “Аль ч мастер” сонгоно уу.
                </p>
              ) : (
                <ul className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5" aria-label="Сул цагууд">
                  {slots.map((s) => (
                    <li key={s.start}>
                      <button
                        type="button"
                        aria-pressed={start === s.start}
                        onClick={() => setStart(s.start)}
                        className={`w-full rounded-full border py-2.5 text-sm tabular-nums transition-colors ${
                          start === s.start
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-surface hover:border-primary hover:text-primary"
                        }`}
                      >
                        {hhmm(s.start)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted">
                Цаг бүр {durationLabel(service.durationMin)} үргэлжилнэ. Аль хэдийн захиалагдсан цаг харагдахгүй.
              </p>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="h-details">
              <StepTitle id="h-details" title="Таны мэдээлэл" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-foreground/75">Нэр</span>
                  <input
                    className="input"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-foreground/75">Утас</span>
                  <input
                    className="input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="8 оронтой дугаар"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-medium text-foreground/75">Тэмдэглэл (заавал биш)</span>
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder="Хүссэн дизайн, хэлбэр г.м"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </label>
              <p className="mt-4 text-xs text-muted">Демо: бодит хувийн мэдээлэл оруулах шаардлагагүй.</p>
            </section>
          )}

          {step === 4 && service && chosen && assignedStaff && (
            <section aria-labelledby="h-review">
              <StepTitle id="h-review" title="Захиалгаа шалгах" />
              <dl className="mt-6 divide-y divide-border/70 rounded-[1.5rem] border border-border/70 bg-surface px-6 text-sm">
                <Line label="Үйлчилгээ" value={service.name} />
                <Line label="Мастер" value={assignedStaff.name} />
                <Line label="Огноо" value={fullDate(today, day)} />
                <Line label="Цаг" value={`${hhmm(chosen.start)} – ${hhmm(chosen.start + service.durationMin)}`} />
                <Line label="Нэр" value={form.name} />
                <Line label="Утас" value={form.phone} />
                {form.note && <Line label="Тэмдэглэл" value={form.note} />}
                <Line label="Үнэ" value={`${money(service.price)}${PRICES_CONFIRMED ? "" : " (жишээ)"}`} />
              </dl>
              <p className="mt-4 text-xs leading-5 text-muted">
                {deposit
                  ? `Захиалгаа баталгаажуулахын тулд ${money(deposit)} урьдчилгаа төлнө. Үлдэгдлийг салон дээр төлнө.`
                  : "Төлбөрийг салон дээр төлнө."}{" "}
                Демо хувилбарт бодит төлбөр, SMS, имэйл байхгүй.
              </p>
            </section>
          )}

          {step === 5 && service && deposit > 0 && (
            <section aria-labelledby="h-deposit">
              <StepTitle id="h-deposit" title="Урьдчилгаа төлөх" tag="Демо төлбөр" />
              <div className="mt-6 grid items-center gap-6 rounded-[1.5rem] border border-border/70 bg-surface p-6 sm:grid-cols-[auto_1fr]">
                <div className="mx-auto text-center">
                  <SampleQr seed={`${service.id}-${day}-${start}`} />
                  <p className="mt-2 text-[11px] text-muted">Жишээ QR — уншуулах боломжгүй</p>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Урьдчилгаа</dt>
                    <dd className="text-2xl font-semibold text-foreground">{money(deposit)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Салон дээр төлөх үлдэгдэл</dt>
                    <dd className="text-foreground">{money(Math.max(0, service.price - deposit))}</dd>
                  </div>
                  <div className="rounded-2xl bg-surface-2/80 px-4 py-3 text-xs leading-5 text-muted">
                    Жинхэнэ системд энд QPay нэхэмжлэх гарч, банкны аппаар уншуулж төлнө. Төлбөр орсны дараа захиалга
                    шууд баталгаажна. <b className="text-foreground">Демо: бодит төлбөр авахгүй.</b>
                  </div>
                </dl>
              </div>
            </section>
          )}
        </div>

        {/* Үйлдлийн мөр */}
        {step > 0 && (
          <div className="mt-10 flex items-center justify-between gap-3 border-t border-border/70 pt-6">
            <button type="button" onClick={() => go(step - 1)} className="btn btn-soft">
              ← Буцах
            </button>
            {step === 2 && (
              <button type="button" disabled={start === null} onClick={() => go(3)} className="btn btn-primary disabled:opacity-40">
                Үргэлжлүүлэх
              </button>
            )}
            {step === 3 && (
              <button type="button" disabled={!detailsValid} onClick={() => go(4)} className="btn btn-primary disabled:opacity-40">
                Үргэлжлүүлэх
              </button>
            )}
            {step === 4 &&
              (deposit ? (
                <button type="button" onClick={() => go(5)} className="btn btn-primary">
                  Урьдчилгаа төлөх — {money(deposit)}
                </button>
              ) : (
                <button type="button" onClick={() => confirm()} className="btn btn-primary">
                  Захиалга баталгаажуулах
                </button>
              ))}
            {step === 5 && (
              <button type="button" onClick={() => confirm(deposit)} className="btn btn-primary">
                Төлсөн гэж үзэх (демо)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Хураангуй */}
      <aside className="h-fit rounded-[1.75rem] bg-surface-2/70 p-6 lg:sticky lg:top-28">
        <p className="eyebrow">Таны сонголт</p>
        <dl className="mt-5 space-y-3 text-sm">
          <Summary label="Үйлчилгээ" value={service?.name} />
          <Summary
            label="Мастер"
            value={assignedStaff?.name ?? (service ? (staffChoice === ANY ? "Аль ч мастер" : staffById(staffChoice)?.name) : undefined)}
          />
          <Summary label="Огноо" value={step >= 2 ? fullDate(today, day) : undefined} />
          <Summary label="Цаг" value={chosen ? hhmm(chosen.start) : undefined} />
        </dl>
        {service && (
          <p className="mt-5 flex items-baseline justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted">{durationLabel(service.durationMin)}</span>
            <span className="font-medium text-foreground">{money(service.price)}</span>
          </p>
        )}
        {service && deposit > 0 && (
          <p className="mt-2 flex items-baseline justify-between text-xs text-muted">
            <span>Урьдчилгаа (онлайн)</span>
            <span className="text-foreground">{money(deposit)}</span>
          </p>
        )}
        {!PRICES_CONFIRMED && service && (
          <p className="mt-3">
            <DemoTag>Жишээ үнэ</DemoTag>
          </p>
        )}
      </aside>
    </div>
  );
}

function StepServices({ selected, onSelect }: { selected?: string; onSelect: (id: string) => void }) {
  return (
    <section aria-labelledby="h-service">
      <StepTitle id="h-service" title="Үйлчилгээ сонгох" tag={PRICES_CONFIRMED ? undefined : "Жишээ үнэ"} />
      <div className="mt-6 space-y-8">
        {categories.map((c) => {
          const list = services.filter((s) => s.categoryId === c.id);
          return (
            <div key={c.id}>
              <h3 className="font-display text-xl font-medium text-foreground">{c.name}</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {list.map((s) => (
                  <Choice
                    key={s.id}
                    active={selected === s.id}
                    onClick={() => onSelect(s.id)}
                    title={s.name}
                    sub={`${durationLabel(s.durationMin)} · ${money(s.price)}`}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StepTitle({ id, title, tag }: { id: string; title: string; tag?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 id={id} className="font-display text-3xl font-medium text-foreground">
        {title}
      </h2>
      {tag && <DemoTag>{tag}</DemoTag>}
    </div>
  );
}

function Choice({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
          active ? "border-primary bg-primary-soft/40" : "border-border bg-surface hover:border-primary/50"
        }`}
      >
        <span className="min-w-0">
          <span className="block font-medium text-foreground">{title}</span>
          <span className="mt-0.5 block text-xs text-muted">{sub}</span>
        </span>
        <span
          aria-hidden
          className={`h-4 w-4 shrink-0 rounded-full border ${active ? "border-[5px] border-primary" : "border-border"}`}
        />
      </button>
    </li>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-3.5">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{value}</dd>
    </div>
  );
}

function Summary({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right ${value ? "text-foreground" : "text-muted/60"}`}>{value ?? "—"}</dd>
    </div>
  );
}

function fullDate(today: Date, day: number): string {
  const d = dateOf(today, day);
  return `${d.getMonth() + 1}-р сарын ${d.getDate()} · ${WEEKDAYS[d.getDay()]}`;
}

function Success({
  booking,
  serviceName,
  staffName,
  dateLabel,
}: {
  booking: DemoBooking;
  serviceName: string;
  staffName: string;
  dateLabel: string;
}) {
  return (
    <div className="mx-auto mt-10 max-w-xl animate-fade-up text-center" role="status">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent font-display text-2xl text-accent-ink">
        ✓
      </span>
      <h2 className="mt-6 font-display text-4xl font-medium text-foreground">
        {booking.paid > 0 ? "Захиалга баталгаажлаа" : "Захиалга хүлээн авлаа"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        {booking.paid > 0
          ? "Урьдчилгаа төлөгдсөн тул таны цаг баталгаажлаа."
          : "Салон баталгаажуулмагц таны захиалга идэвхжинэ."}
      </p>

      <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-surface p-6 text-left">
        <p className="text-center text-xs uppercase tracking-[0.18em] text-muted">Захиалгын код</p>
        <p className="mt-1 text-center font-display text-4xl tracking-wider text-foreground">{booking.code}</p>
        <dl className="mt-6 divide-y divide-border/70 text-sm">
          <Line label="Үйлчилгээ" value={serviceName} />
          <Line label="Мастер" value={staffName} />
          <Line label="Огноо" value={dateLabel} />
          <Line label="Цаг" value={hhmm(booking.start)} />
          <Line label="Төлөв" value={booking.status === "confirmed" ? "Баталгаажсан" : "Хүлээгдэж буй"} />
          {booking.paid > 0 && <Line label="Урьдчилгаа" value={`${money(booking.paid)} (демо)`} />}
        </dl>
      </div>

      <div className="mt-6 rounded-2xl bg-surface-2/80 px-5 py-4 text-left text-xs leading-5 text-muted">
        <b className="text-foreground">Демо:</b> захиалга зөвхөн энэ хөтөчид хадгалагдсан. Бодит төлбөр аваагүй,
        салон руу мэдэгдэл, үйлчлүүлэгч рүү SMS илгээгдээгүй.
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/demo/admin?tab=bookings" className="btn btn-primary">
          Админ дээр харах
        </Link>
        <Link href="/" className="btn btn-soft">
          Нүүр хуудас
        </Link>
      </div>
    </div>
  );
}

/**
 * Жишээ QR дүрс — бодит төлбөрийн мэдээлэл агуулаагүй, уншуулахад юу ч гарахгүй.
 * Захиалгын сонголтоос тогтвортой хэв гаргана.
 */
function SampleQr({ seed }: { seed: string }) {
  const n = 25;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const bit = (x: number, y: number) => {
    let v = (h ^ Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263)) >>> 0;
    v = Math.imul(v ^ (v >>> 13), 1274126177) >>> 0;
    return (v & 1) === 1;
  };
  const finder = (x: number, y: number) =>
    [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && bit(x, y)) cells.push([x, y]);
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="h-40 w-40 rounded-xl bg-white" aria-hidden>
      {[[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="#3b2b2c">
          <path d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5z`} fillRule="evenodd" />
          <rect x={x + 2} y={y + 2} width="3" height="3" />
        </g>
      ))}
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#3b2b2c" />
      ))}
    </svg>
  );
}
