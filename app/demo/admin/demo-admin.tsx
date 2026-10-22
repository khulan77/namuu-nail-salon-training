"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Wordmark from "@/app/components/namuu/wordmark";
import { PRICES_CONFIRMED, categories, durationLabel } from "@/app/lib/namuu/catalog";
import { courses } from "@/app/lib/namuu/training";
import {
  loadDemo,
  nowMinutes,
  resetDemo,
  saveDemo,
  subscribeDemo,
  todayStart,
  type Enquiry,
} from "../demo-store";
import { Attendance, CheckInCard } from "./attendance";
import type { AttendanceMark } from "./attendance-data";
import DemoCalendar, { StatusBadge, type CalState } from "./demo-calendar";
import { MoneySummary, Revenue } from "./revenue";
import { ROLE_LABEL, ROLE_SHORT, TABS, accountById, accounts, type Account, type NavKey, type Role } from "./roles";
import { Settings, Team } from "./team";
import {
  branchOf,
  branches,
  canDo,
  dayLabel,
  freeSlots,
  hhmm,
  incoming,
  itemInfo,
  money,
  services,
  staff,
  type DemoBooking,
} from "./demo-data";

/*
  Namuu NAIL — админы ҮЗҮҮЛЭН. Жинхэнэ админ (`app/_live/admin`) Supabase
  шаарддаг тул демод холбогдоогүй — энэ хуудас түүнийг огт хөнддөггүй.

  Бүх таб НЭГ захиалгын жагсаалтыг хуваалцана, жагсаалт нь хөтчийн демо
  санд (`demo-store.ts`) хадгалагдана. Тиймээс:
    • нийтийн сайтын /book дээр өгсөн захиалга энд "ШИНЭ · сайтаас" гэж гарна;
    • өөр таб дээр /book нээлттэй бол захиалга энд шууд (refresh-гүй) орж ирнэ;
    • хуудсыг сэргээсэн ч өөрчлөлтүүд хадгалагдана (зөвхөн энэ хөтөчид).
  SMS, имэйл, төлбөр ИЛГЭЭГДЭХГҮЙ.
*/

type IconName = keyof typeof ICONS;

const nav: { key: NavKey; label: string; icon: IconName }[] = [
  { key: "dash", label: "Хянах самбар", icon: "grid" },
  { key: "calendar", label: "Хуанли", icon: "calendar" },
  { key: "bookings", label: "Захиалгууд", icon: "list" },
  { key: "customers", label: "Үйлчлүүлэгчид", icon: "users" },
  { key: "revenue", label: "Орлого", icon: "chart" },
  { key: "attendance", label: "Ирц", icon: "check" },
  { key: "training", label: "Сургалтын хүсэлт", icon: "book" },
  { key: "services", label: "Үйлчилгээ", icon: "sparkle" },
  { key: "staff", label: "Мастерууд", icon: "user" },
  { key: "team", label: "Ажилтан ба эрх", icon: "shield" },
  { key: "settings", label: "Тохиргоо", icon: "gear" },
];

type Filter = "pending" | "online" | "today" | "tomorrow" | "cancelled";

const isNavKey = (v: string | undefined): v is NavKey => nav.some((n) => n.key === v);

const noopSubscribe = () => () => {};

export default function DemoAdmin({ initialTab }: { initialTab?: string }) {
  // Жишээ захиалгууд "өнөөдөр"-өөс хамаардаг, өгөгдөл localStorage-д бий.
  // Сервертэй зөрж hydration алдаа гаргахгүйн тулд зөвхөн хөтөч дээр зурна.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return <Skeleton />;
  return <AdminApp initialTab={isNavKey(initialTab) ? initialTab : "dash"} />;
}

function AdminApp({ initialTab }: { initialTab: NavKey }) {
  const [today] = useState(todayStart);
  const [nowMin, setNowMin] = useState(nowMinutes);
  const [bookings, setBookings] = useState(() => loadDemo().bookings);
  const [enquiries, setEnquiries] = useState(() => loadDemo().enquiries);
  const [settings, setSettings] = useState(() => loadDemo().settings);
  const [roles, setRoles] = useState(() => loadDemo().roles);
  const [session, setSession] = useState(() => loadDemo().session);
  const [attendance, setAttendance] = useState(() => loadDemo().attendance);
  const [tab, setTab] = useState<NavKey>(initialTab);
  const [cal, setCal] = useState<CalState>({ day: 0, branchId: branches[0].id, view: "day" });
  const [filter, setFilter] = useState<Filter>(() =>
    loadDemo().bookings.some((b) => b.fresh && b.source === "online") ? "online" : "pending",
  );
  const [query, setQuery] = useState("");
  const [incomingCount, setIncomingCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toastTimer = useRef<number | undefined>(undefined);
  const knownIds = useRef(new Set(bookings.map((b) => b.id)));

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  // Өөрчлөлт бүрийг демо санд хадгална (ижил бол бичихгүй).
  useEffect(
    () => saveDemo({ bookings, enquiries, settings, roles, session, attendance }),
    [bookings, enquiries, settings, roles, session, attendance],
  );

  // Өөр таб дээр (/book, /training) шинэ өгөгдөл орж ирэхэд шууд шинэчилнэ.
  useEffect(
    () =>
      subscribeDemo(() => {
        const next = loadDemo();
        const arrived = next.bookings.filter((b) => !knownIds.current.has(b.id) && b.source === "online");
        next.bookings.forEach((b) => knownIds.current.add(b.id));
        setBookings(next.bookings);
        setEnquiries(next.enquiries);
        setSettings(next.settings);
        setAttendance(next.attendance);
        if (arrived.length > 0) {
          const b = arrived[arrived.length - 1];
          notify(`Сайтаас шинэ захиалга: ${b.name} — ${itemInfo(b.item).label}, ${hhmm(b.start)}`);
        }
      }),
    [notify],
  );

  // Гар утасны цэс нээлттэй үед: Esc-ээр хаагдана, ар талын хуудас гүйхгүй.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  // "Яг одоо" шугам хуанли дээр урагшилна.
  useEffect(() => {
    const id = window.setInterval(() => setNowMin(nowMinutes()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const switchTab = (key: NavKey) => {
    setTab(key);
    window.scrollTo({ top: 0 });
  };

  const openInCalendar = (b: DemoBooking) => {
    setCal({ day: b.day, branchId: branchOf(b.staffId), view: "day", openId: b.id });
    switchTab("calendar");
  };

  const setStatus = (b: DemoBooking, status: "confirmed" | "cancelled") => {
    setBookings((list) => list.map((x) => (x.id === b.id ? { ...x, status, fresh: false } : x)));
    notify(status === "confirmed" ? `${b.name} — баталгаажлаа` : `${b.name} — захиалга цуцлагдлаа`);
  };

  /* Жишээ онлайн захиалга нэмнэ: хамгийн ойрын сул цагт хуанли дээр тодоор
     гарч, "хүлээгдэж буй" тоо өснө. Сайтын жинхэнэ урсгалыг (/book) нөгөө
     таб дээр үзүүлэх боломжгүй үед хэрэглэнэ. */
  const simulateBooking = () => {
    const w = incoming[incomingCount % incoming.length];
    const duration = itemInfo(w.item).durationMin;
    const after = Math.ceil((nowMin + 30) / 15) * 15;
    let slot: { staffId: string; day: number; start: number } | undefined;
    for (const day of [0, 1, 2, 3]) {
      for (const m of staff.filter((s) => canDo(s, w.item))) {
        const start = freeSlots(bookings, m.id, day, duration).find((t) => day > 0 || t >= after);
        if (start !== undefined) {
          slot = { staffId: m.id, day, start };
          break;
        }
      }
      if (slot) break;
    }
    if (!slot) {
      notify("Ойрын өдрүүдэд сул цаг олдсонгүй");
      return;
    }

    const found = slot;
    setIncomingCount((n) => n + 1);
    setBookings((list) => {
      const id = `w${Date.now().toString(36)}`;
      knownIds.current.add(id);
      return [
        ...list.map((b) => (b.fresh ? { ...b, fresh: false } : b)),
        { ...w, ...found, id, code: `NM-${5200 + list.length}`, status: "pending", paid: 0, fresh: true },
      ];
    });
    setCal({ day: found.day, branchId: branches[0].id, view: "day" });
    switchTab("calendar");
    notify(
      `Жишээ захиалга: ${w.name} — ${itemInfo(w.item).label}, ${dayLabel(today, found.day).toLowerCase()} ${hhmm(found.start)}`,
    );
  };

  const reset = () => {
    if (!window.confirm("Демо өгөгдлийг анхны байдалд нь буцаах уу? Сайтаас өгсөн захиалгууд устна.")) return;
    const fresh = resetDemo();
    knownIds.current = new Set(fresh.bookings.map((b) => b.id));
    setBookings(fresh.bookings);
    setEnquiries(fresh.enquiries);
    setSettings(fresh.settings);
    setRoles(fresh.roles);
    setSession(fresh.session);
    setAttendance(fresh.attendance);
    notify("Демо өгөгдөл шинэчлэгдлээ");
  };

  // Эрх — "нэвтэрсэн" хэрэглэгчээс хамаарч цэс, үйлдэл өөрчлөгдөнө.
  const roleOf = (id: string): Role => roles[id] ?? accountById(id).role;
  const self = accountById(session);
  const role = roleOf(session);
  const allowed = TABS[role];
  const visibleNav = nav.filter((n) => allowed.includes(n.key));
  const current: NavKey = allowed.includes(tab) ? tab : "dash";
  const ownStaffId = role === "master" ? self.staffId : undefined;

  const setMark = (key: string, accountId: string, mark: AttendanceMark | null) => {
    setAttendance((log) => {
      const day = { ...log[key] };
      if (mark) day[accountId] = mark;
      else delete day[accountId];
      return { ...log, [key]: day };
    });
    const who = accountById(accountId).name;
    notify(mark ? `${who} — ирц бүртгэгдлээ` : `${who} — ирц арилгагдлаа`);
  };

  const switchUser = (id: string) => {
    setSession(id);
    notify(`${accountById(id).name} (${ROLE_LABEL[roleOf(id)]}) эрхээр харж байна`);
  };

  const pending = bookings.filter((b) => b.status === "pending" && b.day >= 0);
  const openEnquiries = enquiries.filter((e) => !e.handled);
  const badge = (key: NavKey) =>
    key === "bookings" ? pending.length : key === "training" ? openEnquiries.length : 0;

  /** Хажуугийн цэсийн агуулга — өргөн дэлгэцийн aside ба гар утасны гулсах цэс хоёулаа ашиглана. */
  const menuBody = (after?: () => void) => (
    <>
      <span className="mx-2 mt-3 inline-flex w-fit rounded-full border border-dashed border-accent-ink/50 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-accent-ink">
        ДЕМО · ЖИШЭЭ ӨГӨГДӨЛ
      </span>
      <UserSwitcher className="mx-2 mt-5" session={session} roleOf={roleOf} onChange={switchUser} />

      <nav className="mt-5 flex flex-col gap-0.5" aria-label="Админ цэс">
        {visibleNav.map((n) => (
          <button
            key={n.key}
            type="button"
            onClick={() => {
              switchTab(n.key);
              after?.();
            }}
            aria-current={current === n.key ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-2 text-left text-sm transition-colors ${
              current === n.key ? "bg-primary text-white" : "text-foreground/80 hover:bg-surface-2"
            }`}
          >
            <NavIcon name={n.icon} />
            <span className="flex-1">{n.label}</span>
            {badge(n.key) > 0 && (
              <span
                className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold ${
                  current === n.key ? "bg-white text-primary" : "bg-primary text-white"
                }`}
              >
                {badge(n.key)}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6">
        <Link
          href="/book"
          target="_blank"
          className="block rounded-xl bg-primary-soft px-4 py-3 text-xs leading-5 text-foreground transition-colors hover:bg-primary-soft/70"
        >
          <span className="font-medium text-primary">Сайтаас захиалга өгөх ↗</span>
          <span className="mt-0.5 block text-[11px] text-muted">Шинэ табд нээгдэнэ — захиалга энд шууд орж ирнэ</span>
        </Link>
        {role !== "master" && (
          <button
            type="button"
            onClick={() => {
              simulateBooking();
              after?.();
            }}
            className="w-full rounded-xl bg-surface-2 px-4 py-3 text-left text-xs leading-5 text-foreground transition-colors hover:bg-border/60"
          >
            <span className="font-medium">Жишээ захиалга нэмэх</span>
            <span className="mt-0.5 block text-[11px] text-muted">Хуанли дээр хэрхэн гарахыг үзүүлнэ</span>
          </button>
        )}
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted">
          <Link href="/demo" className="transition-colors hover:text-primary">
            ← Демо удирдамж
          </Link>
          <button
            type="button"
            onClick={() => {
              reset();
              after?.();
            }}
            className="transition-colors hover:text-primary"
          >
            Демо шинэчлэх
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Хажуугийн цэс — өргөн дэлгэцэд */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface px-4 py-6 lg:flex">
        <Link href="/" className="px-2" aria-label="Сайт руу">
          <Wordmark />
        </Link>
        {menuBody()}
      </aside>

      {/* Утасны толгой — лого · хуудасны нэр · ☰ (цэс хажуугаас гулсаж гарна) */}
      <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 px-4 py-2">
          <Link href="/" aria-label="Сайт руу" className="shrink-0">
            <Wordmark size="sm" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg leading-tight text-foreground">
              {nav.find((n) => n.key === current)?.label}
            </p>
            <p className="truncate text-[11px] text-muted">
              Демо · {self.name} ({ROLE_SHORT[role]})
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Цэс нээх"
            aria-expanded={menuOpen}
            aria-controls="admin-drawer"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
          >
            <span className="flex w-5 flex-col gap-[5px]" aria-hidden>
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
            </span>
            {pending.length > 0 && role !== "master" && (
              <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-5 text-white ring-2 ring-surface">
                {pending.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Админ цэс">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Цэс хаах"
            onClick={closeMenu}
            className="animate-fade-in absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
          />
          <div
            id="admin-drawer"
            className="animate-drawer-in absolute inset-y-0 right-0 flex w-[86%] max-w-xs flex-col overflow-y-auto bg-surface px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 px-2">
              <Wordmark />
              <button
                type="button"
                autoFocus
                onClick={closeMenu}
                aria-label="Цэс хаах"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xl leading-none text-foreground"
              >
                ×
              </button>
            </div>
            {menuBody(closeMenu)}
          </div>
        </div>
      )}

      {/* `min-w-0` — өргөн хуанли main-ийг сунгалгүй, өөрөө хажуу тийш гүйлгэнэ. */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-5xl">
          {current === "dash" && (
            <Dashboard
              today={today}
              bookings={bookings}
              pending={pending}
              enquiries={openEnquiries.length}
              nowMin={nowMin}
              onPending={() => {
                setFilter("pending");
                switchTab("bookings");
              }}
              onOnline={() => {
                setFilter("online");
                switchTab("bookings");
              }}
              onTab={switchTab}
              onOpen={openInCalendar}
              onReset={reset}
              role={role}
              self={self}
              ownStaffId={ownStaffId}
              attendanceCard={
                <CheckInCard account={self} today={today} nowMin={nowMin} log={attendance} setMark={setMark} />
              }
            />
          )}

          {current === "calendar" && (
            <DemoCalendar
              today={today}
              nowMin={nowMin}
              bookings={bookings}
              setBookings={setBookings}
              cal={cal}
              setCal={setCal}
              notify={notify}
              onlyStaffId={ownStaffId}
            />
          )}

          {current === "bookings" && (
            <Bookings
              today={today}
              bookings={bookings}
              filter={filter}
              setFilter={setFilter}
              query={query}
              setQuery={setQuery}
              onStatus={setStatus}
              onOpen={openInCalendar}
            />
          )}

          {current === "customers" && <Customers today={today} bookings={bookings} onOpen={openInCalendar} />}

          {current === "training" && (
            <Training
              list={enquiries}
              onToggle={(id) =>
                setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, handled: !e.handled } : e)))
              }
            />
          )}

          {current === "revenue" && <Revenue today={today} nowMin={nowMin} bookings={bookings} />}

          {current === "attendance" && (
            <Attendance
              today={today}
              nowMin={nowMin}
              log={attendance}
              setMark={setMark}
              bookings={bookings}
              self={self}
              canManage={role !== "master"}
              onCalendar={() => {
                setCal({ day: 0, branchId: branches[0].id, view: "day" });
                switchTab("calendar");
              }}
            />
          )}

          {current === "team" && (
            <Team
              roleOf={roleOf}
              selfId={session}
              setRole={(id, next) => {
                setRoles((map) => ({ ...map, [id]: next }));
                notify(`${accountById(id).name} — ${ROLE_LABEL[next]} эрхтэй боллоо`);
              }}
            />
          )}

          {current === "settings" && (
            <Settings
              settings={settings}
              setSettings={(next) => {
                setSettings(next);
                notify(next.depositEnabled ? `Урьдчилгаа: ${money(next.depositAmount)}` : "Урьдчилгаа унтраалаа");
              }}
            />
          )}

          {current === "services" && <Services notify={notify} />}

          {current === "staff" && (
            <Staff
              bookings={bookings}
              onCalendar={() => {
                setCal({ day: 0, branchId: branches[0].id, view: "day" });
                switchTab("calendar");
              }}
            />
          )}
        </div>
      </main>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
          <p role="status" className="animate-fade-up rounded-full bg-foreground px-5 py-3 text-center text-sm text-background shadow-lg">
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}

const priceOf = (b: DemoBooking) => itemInfo(b.item).price;
const staffName = (id: string) => staff.find((m) => m.id === id)?.name ?? "—";
const digits = (phone: string) => phone.replace(/\D/g, "");

/* ── Хянах самбар ─────────────────────────────────────────────────── */

function Dashboard({
  today,
  bookings,
  pending,
  enquiries,
  nowMin,
  onPending,
  onOnline,
  onTab,
  onOpen,
  onReset,
  role,
  self,
  ownStaffId,
  attendanceCard,
}: {
  today: Date;
  bookings: DemoBooking[];
  pending: DemoBooking[];
  enquiries: number;
  nowMin: number;
  onPending: () => void;
  onOnline: () => void;
  onTab: (key: NavKey) => void;
  onOpen: (b: DemoBooking) => void;
  onReset: () => void;
  role: Role;
  self: Account;
  ownStaffId?: string;
  attendanceCard: React.ReactNode;
}) {
  const mine = (b: DemoBooking) => !ownStaffId || b.staffId === ownStaffId;
  const todays = bookings.filter((b) => b.day === 0 && b.status !== "cancelled" && mine(b));
  const online = bookings.filter((b) => b.source === "online" && b.day >= 0);
  if (role === "master") {
    const next = bookings
      .filter((b) => mine(b) && b.day >= 0 && b.day <= 1 && (b.status === "confirmed" || b.status === "pending"))
      .filter((b) => b.day > 0 || b.start + itemInfo(b.item).durationMin > nowMin)
      .sort((a, b) => a.day - b.day || a.start - b.start);
    return (
      <div>
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">Сайн байна уу, {self.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {dayLabel(today, 0)} · Өнөөдөр {todays.length} захиалга. Та зөвхөн өөрийн захиалгыг харна.
        </p>
        {attendanceCard}
        <h2 className="mt-8 font-display text-xl text-foreground sm:text-2xl">Миний дараагийн захиалгууд</h2>
        {next.length === 0 ? (
          <p className="card mt-4 p-6 text-center text-sm text-muted">Ойрын захиалга алга.</p>
        ) : (
          <ul className="card mt-4 divide-y divide-border/60 overflow-hidden">
            {next.map((b) => (
              <BookingRow key={b.id} today={today} b={b} onOpen={onOpen} showDay now={b.day === 0 && b.start <= nowMin} />
            ))}
          </ul>
        )}
      </div>
    );
  }

  const upcoming = todays
    .filter((b) => b.status !== "no_show" && b.start + itemInfo(b.item).durationMin > nowMin)
    .sort((a, b) => a.start - b.start)
    .slice(0, 6);
  const latestOnline = [...online].reverse().slice(0, 3);

  const stats: { label: string; value: string; tab: NavKey; onClick?: () => void }[] = [
    { label: "Өнөөдрийн захиалга", value: String(todays.length), tab: "calendar" },
    { label: "Хүлээгдэж буй", value: String(pending.length), tab: "bookings", onClick: onPending },
    { label: "Сайтаас ирсэн", value: String(online.length), tab: "bookings", onClick: onOnline },
    { label: "Сургалтын хүсэлт", value: String(enquiries), tab: "training" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">Хянах самбар</h1>
      <p className="mt-1 text-sm text-muted">
        {dayLabel(today, 0)} · Үйлчлүүлэгчдийн нэр, утас бүгд зохиомол жишээ.
      </p>

      {pending.length > 0 && (
        <button
          type="button"
          onClick={onPending}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-left text-white shadow-sm transition-transform hover:scale-[1.01] sm:px-5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 font-display text-lg">
            {pending.length}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">захиалга баталгаажуулалт хүлээж байна</span>
            <span className="block text-xs text-white/80">Баталгаажуулах эсвэл цуцлах</span>
          </span>
          <span aria-hidden>→</span>
        </button>
      )}

      {role === "owner" ? (
        <MoneySummary today={today} nowMin={nowMin} bookings={bookings} onOpen={() => onTab("revenue")} />
      ) : (
        attendanceCard
      )}

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={s.onClick ?? (() => onTab(s.tab))}
            className="rounded-2xl bg-surface-2/70 px-4 py-4 text-left transition-colors hover:bg-primary-soft/70"
          >
            <span className="block text-3xl font-semibold leading-none text-foreground">{s.value}</span>
            <span className="mt-2 block truncate text-xs text-muted">{s.label}</span>
          </button>
        ))}
      </div>

      {latestOnline.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-xl font-medium text-foreground sm:text-2xl">Сайтаас ирсэн захиалга</h2>
          <ul className="card mt-4 divide-y divide-border/60 overflow-hidden">
            {latestOnline.map((b) => (
              <BookingRow key={b.id} today={today} b={b} onOpen={onOpen} showDay />
            ))}
          </ul>
        </>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-medium text-foreground sm:text-2xl">Өнөөдрийн дараагийн захиалгууд</h2>
        <button
          type="button"
          onClick={() => onTab("calendar")}
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          Хуанли →
        </button>
      </div>
      {upcoming.length === 0 ? (
        <p className="card mt-4 p-6 text-center text-sm text-muted">Өнөөдрийн захиалгууд дууслаа.</p>
      ) : (
        <ul className="card mt-4 divide-y divide-border/60 overflow-hidden">
          {upcoming.map((b) => (
            <BookingRow key={b.id} today={today} b={b} onOpen={onOpen} now={b.start <= nowMin} />
          ))}
        </ul>
      )}

      {/* Гар утсан дээр хажуугийн цэс байхгүй тул демогийн удирдлага энд */}
      <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:hidden">
        <Link href="/book" className="rounded-2xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
          Сайтаас захиалга өгөх →
        </Link>
        <div className="flex items-center justify-between rounded-2xl bg-surface-2/70 px-4 py-3 text-xs text-muted">
          <Link href="/demo" className="hover:text-primary">
            ← Демо удирдамж
          </Link>
          <button type="button" onClick={onReset} className="hover:text-primary">
            Демо шинэчлэх
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingRow({
  today,
  b,
  onOpen,
  now,
  showDay,
}: {
  today: Date;
  b: DemoBooking;
  onOpen: (b: DemoBooking) => void;
  now?: boolean;
  showDay?: boolean;
}) {
  const info = itemInfo(b.item);
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(b)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/50 sm:px-5"
      >
        <span className="w-14 shrink-0 text-sm font-semibold tabular-nums text-primary">{hhmm(b.start)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {b.name}
            {now && (
              <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-white">
                ЯГ ОДОО
              </span>
            )}
            {b.source === "online" && (
              <span className="ml-2 rounded-full border border-primary/40 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                САЙТААС
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-muted">
            {showDay && `${dayLabel(today, b.day)} · `}
            {info.label} · {staffName(b.staffId)}
          </span>
        </span>
        <StatusBadge status={b.status} />
      </button>
    </li>
  );
}

/* ── Захиалгууд ───────────────────────────────────────────────────── */

function Bookings({
  today,
  bookings,
  filter,
  setFilter,
  query,
  setQuery,
  onStatus,
  onOpen,
}: {
  today: Date;
  bookings: DemoBooking[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  query: string;
  setQuery: (q: string) => void;
  onStatus: (b: DemoBooking, status: "confirmed" | "cancelled") => void;
  onOpen: (b: DemoBooking) => void;
}) {
  const matchers: Record<Filter, (b: DemoBooking) => boolean> = {
    pending: (b) => b.status === "pending" && b.day >= 0,
    online: (b) => b.source === "online",
    today: (b) => b.day === 0,
    tomorrow: (b) => b.day === 1,
    cancelled: (b) => b.status === "cancelled" && b.day >= 0,
  };
  const chips: { key: Filter; label: string }[] = [
    { key: "pending", label: "Хүлээгдэж буй" },
    { key: "online", label: "Сайтаас" },
    { key: "today", label: "Өнөөдөр" },
    { key: "tomorrow", label: "Маргааш" },
    { key: "cancelled", label: "Цуцлагдсан" },
  ];

  const q = query.trim().toLowerCase().replace(/\s/g, "");
  const list = bookings
    .filter((b) =>
      q
        ? `${b.name}${b.phone}${b.code}`.toLowerCase().replace(/\s/g, "").includes(q)
        : matchers[filter](b),
    )
    // Шинээр ирсэн нь хамгийн дээр.
    .sort((a, b) => Number(Boolean(b.fresh)) - Number(Boolean(a.fresh)) || a.day - b.day || a.start - b.start);
  const shown = list.slice(0, 40);

  return (
    <Section title="Захиалгууд" note="Хүлээгдэж буй захиалгыг баталгаажуулах эсвэл цуцлах. Төлөв хуанлитай нэг дор шинэчлэгдэнэ.">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Нэр, утас эсвэл код (NM-…)"
        aria-label="Захиалга хайх"
        className="field"
      />
      {!q && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {chips.map((c) => {
            const count = bookings.filter(matchers[c.key]).length;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                aria-pressed={filter === c.key}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors ${
                  filter === c.key ? "bg-foreground text-background" : "bg-surface-2 text-foreground/80"
                }`}
              >
                {c.label}
                <span className={`text-xs ${filter === c.key ? "text-background/70" : "text-muted"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="card mt-4 p-6 text-center text-sm text-muted">
          {q
            ? "Олдсонгүй."
            : filter === "online"
              ? "Сайтаас хараахан захиалга ороогүй. /book хуудсаар захиалга өгч үзнэ үү."
              : "Энд захиалга алга."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {shown.map((b) => {
            const info = itemInfo(b.item);
            return (
              <li key={b.id} className={`card p-4 ${b.fresh ? "animate-fade-up ring-2 ring-primary/40" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                    {initialOf(b.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate text-sm font-medium text-foreground">{b.name}</p>
                      <span className="font-mono text-[11px] text-muted">{b.code}</span>
                      {b.source === "online" && (
                        <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          САЙТААС
                        </span>
                      )}
                      {b.fresh && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">ШИНЭ</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {dayLabel(today, b.day)} · {hhmm(b.start)} · {info.label} · {staffName(b.staffId)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {money(info.price)}
                      {b.paid > 0 && b.status !== "done" && (
                        <span className="font-medium text-emerald-700"> · урьдчилгаа {money(b.paid)} төлсөн</span>
                      )}{" "}
                      · {b.phone}
                      {b.note && ` · “${b.note}”`}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onStatus(b, "confirmed")}
                        className="min-h-10 flex-1 rounded-full bg-primary px-4 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
                      >
                        Баталгаажуулах
                      </button>
                      <button
                        type="button"
                        onClick={() => onStatus(b, "cancelled")}
                        className="min-h-10 flex-1 rounded-full bg-surface-2 px-4 text-xs font-medium text-foreground transition-colors hover:bg-border/60"
                      >
                        Цуцлах
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpen(b)}
                    className="min-h-10 rounded-full px-3 text-xs font-medium text-primary transition-colors hover:bg-primary-soft"
                  >
                    Хуанлид харах →
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > shown.length && (
        <p className="mt-4 text-center text-xs text-muted">
          + {list.length - shown.length} захиалга. Хайлтаар нарийсгана уу.
        </p>
      )}
    </Section>
  );
}

const initialOf = (name: string) => (name.includes(". ") ? name.split(". ")[1] : name).slice(0, 1).toUpperCase();

/* ── Үйлчлүүлэгчид ────────────────────────────────────────────────── */

/**
 * Тусдаа хүснэгтгүй — захиалгуудыг утасны дугаараар бүлэглэж гаргана.
 * Жинхэнэ системд ч мөн адил аргаар (bookings → customer_phone) хийх боломжтой.
 */
function Customers({
  today,
  bookings,
  onOpen,
}: {
  today: Date;
  bookings: DemoBooking[];
  onOpen: (b: DemoBooking) => void;
}) {
  const [query, setQuery] = useState("");
  const map = new Map<string, DemoBooking[]>();
  for (const b of bookings) {
    const key = digits(b.phone);
    map.set(key, [...(map.get(key) ?? []), b]);
  }
  const rows = [...map.values()]
    .map((list) => {
      const sorted = [...list].sort((a, b) => a.day - b.day || a.start - b.start);
      const visits = sorted.filter((b) => b.status === "done");
      const next = sorted.find((b) => b.day >= 0 && (b.status === "pending" || b.status === "confirmed"));
      const last = [...visits].pop();
      return {
        name: sorted[sorted.length - 1].name,
        phone: sorted[0].phone,
        visits: visits.length,
        spent: visits.reduce((sum, b) => sum + priceOf(b), 0),
        noShows: sorted.filter((b) => b.status === "no_show").length,
        online: sorted.some((b) => b.source === "online"),
        last,
        next,
      };
    })
    .sort((a, b) => Number(b.online) - Number(a.online) || b.visits - a.visits || b.spent - a.spent);

  const q = query.trim().toLowerCase().replace(/\s/g, "");
  const filtered = q ? rows.filter((r) => `${r.name}${r.phone}`.toLowerCase().replace(/\s/g, "").includes(q)) : rows;
  const shown = filtered.slice(0, 40);

  return (
    <Section
      title="Үйлчлүүлэгчид"
      note={`${rows.length} үйлчлүүлэгч · захиалгын түүхээс утасны дугаараар нэгтгэсэн. Бүх нэр, утас зохиомол.`}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Нэр эсвэл утас"
        aria-label="Үйлчлүүлэгч хайх"
        className="field"
      />
      <div className="card mt-4 overflow-x-auto">
        {/* Гар утсанд 3 багана — "Сүүлд", "Дараагийн" нь нэрийн доор шилжинэ */}
        <table className="w-full text-left text-sm sm:min-w-[40rem]">
          <thead className="border-b border-border/70 text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium sm:px-5">Үйлчлүүлэгч</th>
              <th className="px-2 py-3 text-right font-medium sm:px-3 sm:text-left">Ирсэн</th>
              <th className="px-4 py-3 text-right font-medium sm:px-3 sm:text-left">Нийт</th>
              <th className="hidden px-3 py-3 font-medium sm:table-cell">Сүүлд</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Дараагийн захиалга</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {shown.map((r) => (
              <tr key={r.phone}>
                <td className="px-4 py-3 sm:px-5">
                  <span className="block font-medium text-foreground">
                    {r.name}
                    {r.online && (
                      <span className="ml-2 rounded-full border border-primary/40 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                        САЙТААС
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-muted">
                    {r.phone}
                    {r.noShows > 0 && <span className="text-primary"> · {r.noShows} удаа ирээгүй</span>}
                  </span>
                  {r.next && (
                    <button
                      type="button"
                      onClick={() => onOpen(r.next!)}
                      className="mt-1 block text-left text-xs text-primary hover:underline sm:hidden"
                    >
                      Дараагийн: {dayLabel(today, r.next.day)} · {hhmm(r.next.start)}
                    </button>
                  )}
                </td>
                <td className="px-2 py-3 text-right tabular-nums sm:px-3 sm:text-left">{r.visits}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums sm:px-3 sm:text-left">{money(r.spent)}</td>
                <td className="hidden px-3 py-3 text-xs text-muted sm:table-cell">{r.last ? dayLabel(today, r.last.day) : "—"}</td>
                <td className="hidden px-5 py-3 sm:table-cell">
                  {r.next ? (
                    <button
                      type="button"
                      onClick={() => onOpen(r.next!)}
                      className="text-left text-xs text-primary hover:underline"
                    >
                      {dayLabel(today, r.next.day)} · {hhmm(r.next.start)}
                      <span className="block text-muted">{itemInfo(r.next.item).label}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > shown.length && (
        <p className="mt-4 text-center text-xs text-muted">+ {filtered.length - shown.length}. Хайлтаар нарийсгана уу.</p>
      )}
    </Section>
  );
}

/* ── Сургалтын хүсэлт ─────────────────────────────────────────────── */

function Training({ list, onToggle }: { list: Enquiry[]; onToggle: (id: string) => void }) {
  return (
    <Section title="Сургалтын хүсэлт" note="Сайтын “Сургалт” хуудсаар ирсэн лавлагаа. Холбогдсоныхоо дараа тэмдэглэнэ.">
      {list.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted">Хүсэлт хараахан ирээгүй.</p>
          <Link href="/training#enquiry" target="_blank" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Сайтаас хүсэлт илгээж үзэх ↗
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((e) => (
            <li key={e.id} className={`card p-5 transition-opacity ${e.handled ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {e.name} <span className="font-normal text-muted">· {e.phone}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-primary">
                    {courses.find((c) => c.id === e.courseId)?.name ?? "Сургалт"}
                  </p>
                  {e.message && <p className="mt-2 text-sm leading-6 text-foreground/85">{e.message}</p>}
                  <p className="mt-2 text-[11px] text-muted">
                    {new Date(e.createdAt).toLocaleString("mn-MN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(e.id)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                    e.handled ? "bg-surface-2 text-muted" : "bg-primary text-white hover:bg-primary-hover"
                  }`}
                >
                  {e.handled ? "Холбогдсон ✓" : "Холбогдсон гэж тэмдэглэх"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* ── Үйлчилгээ ────────────────────────────────────────────────────── */

function Services({ notify }: { notify: (m: string) => void }) {
  const edit = () => notify("Демо — жинхэнэ системд үнэ, хугацаа, зураг эндээс засагдана");
  return (
    <Section
      title="Үйлчилгээ"
      note={`Үнэ, хугацааг салон өөрөө засна. ${PRICES_CONFIRMED ? "" : "Одоогийн үнэ жишээ."}`}
    >
      <div className="space-y-6">
        {categories.map((c) => (
          <div key={c.id}>
            <h2 className="font-display text-xl font-medium text-foreground">{c.name}</h2>
            <ul className="card mt-3 divide-y divide-border/60 overflow-hidden">
              {services
                .filter((s) => s.categoryId === c.id)
                .map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{s.name}</span>
                      <span className="block text-xs text-muted">{durationLabel(s.durationMin)}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-foreground">{money(s.price)}</span>
                    <button
                      type="button"
                      onClick={edit}
                      className="shrink-0 rounded-full bg-surface-2 px-3 py-1.5 text-xs text-muted transition-colors hover:text-primary"
                    >
                      Засах
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Мастерууд ────────────────────────────────────────────────────── */

function Staff({ bookings, onCalendar }: { bookings: DemoBooking[]; onCalendar: () => void }) {
  return (
    <Section
      title="Мастерууд"
      note="Мастер бүр ямар үйлчилгээ хийхийг тохируулна — онлайн захиалгад зөвхөн тохирох мастер санал болгогдоно. Нэрс жишээ."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {staff.map((m) => {
          const todays = bookings.filter((b) => b.staffId === m.id && b.day === 0 && b.status !== "cancelled");
          const busy = todays.reduce((sum, b) => sum + itemInfo(b.item).durationMin, 0);
          return (
            <li key={m.id} className="card flex items-center gap-4 p-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-2xl text-primary">
                {m.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{m.name}</span>
                <span className="block text-xs text-primary">{m.title}</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted">
                  {m.serviceIds.length === services.length
                    ? "Бүх үйлчилгээ"
                    : services
                        .filter((s) => m.serviceIds.includes(s.id))
                        .map((s) => s.name)
                        .join(" · ")}
                </span>
              </span>
              <button
                type="button"
                onClick={onCalendar}
                className="shrink-0 rounded-2xl bg-surface-2 px-3 py-2 text-center text-xs text-foreground transition-colors hover:bg-primary-soft"
              >
                <b className="block text-sm">{todays.length}</b>
                өнөөдөр
                <span className="block text-[10px] text-muted">{durationLabel(busy || 0)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-xs leading-5 text-muted">
        Ажлын цаг: өдөр бүр {hhmm(branches[0].openMin)}–{hhmm(branches[0].closeMin)} (жишээ). Жинхэнэ системд мастер
        бүр өөрийн нэвтрэх эрхтэй бөгөөд зөвхөн өөрийн захиалгыг хардаг.
      </p>
    </Section>
  );
}

/* ── Жижиг хэсгүүд ────────────────────────────────────────────────── */

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-1 text-sm text-muted">{note}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/** Демо: "нэвтэрсэн" хэрэглэгчийг солих — эрх бүрээр системийг үзүүлнэ. */
function UserSwitcher({
  session,
  roleOf,
  onChange,
  className = "",
  compact = false,
}: {
  session: string;
  roleOf: (id: string) => Role;
  onChange: (id: string) => void;
  className?: string;
  /** Гар утасны толгойд — гарчиггүй, намхан */
  compact?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span
        className={
          compact ? "sr-only" : "mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted"
        }
      >
        Нэвтэрсэн (демо)
      </span>
      <select
        value={session}
        onChange={(e) => onChange(e.target.value)}
        className={`field text-sm ${compact ? "min-h-10 py-1.5" : "py-2"}`}
      >
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {compact ? "Демо: " : ""}
            {a.name} · {ROLE_SHORT[roleOf(a.id)]}
          </option>
        ))}
      </select>
    </label>
  );
}

const ICONS = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 6.5M21 20c0-2.8-1.7-5-4-5.7",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8",
  chart: "M4 20h16M7 16v-5M12 16V7M17 16v-8",
  check: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 15l2 2 4-4",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
};

function NavIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block" />
      <div className="flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-48 rounded-full bg-surface-2" />
          <div className="mt-6 h-28 rounded-[1.75rem] bg-surface-2/70" />
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface-2/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
