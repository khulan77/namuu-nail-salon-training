import Link from "next/link";
import PhotoFrame from "@/app/components/namuu/photo-frame";
import { DemoTag, Pending } from "@/app/components/namuu/pending";
import { brand } from "@/app/lib/namuu/brand";
import {
  PRICES_CONFIRMED,
  branch,
  categories,
  durationLabel,
  hhmm,
  money,
  services,
} from "@/app/lib/namuu/catalog";
import { photo, portfolio } from "@/app/lib/namuu/portfolio";

const hero = photo("stars");
const heroSmall = photo("pearls");
const aboutPhoto = photo("blue-french");

const featured = services.filter((s) => s.featured);

const steps = [
  { title: "Үйлчилгээ", text: "Хүссэн үйлчилгээгээ сонгоно." },
  { title: "Мастер ба цаг", text: "Мастер, өдөр, сул цагаа сонгоно — давхардал гарахгүй." },
  { title: "Баталгаажуулалт", text: "Нэр, утсаа үлдээгээд захиалгын кодоо авна." },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <p className="eyebrow">{brand.descriptor}</p>
            <h1 className="mt-6 font-display text-[2.75rem] font-medium leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.5rem]">
              Нарийн хийц,
              <br />
              <em className="font-normal text-primary">зөөлөн гоо үзэсгэлэн</em>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-muted sm:text-lg sm:leading-8">
              Маникюр, nail art болон хумсны сургалт нэг дор. Үйлчилгээ, мастер, цагаа сонгоод онлайнаар
              захиалаарай.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/book" className="btn btn-primary">
                Цаг захиалах
              </Link>
              <Link href="/services" className="btn btn-soft">
                Үйлчилгээ үзэх
              </Link>
            </div>
            <p className="mt-8 flex items-center gap-3 text-xs tracking-wide text-muted">
              <span className="rule" />
              Онлайн захиалга өдөр шөнөгүй нээлттэй
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <PhotoFrame
              id="hero"
              priority
              look={hero.look}
              src={hero.src}
              alt={hero.title}
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="aspect-[4/5] rounded-t-full rounded-b-[2rem]"
            />
            <div className="absolute -bottom-6 -left-4 w-32 sm:-left-10 sm:w-40">
              <PhotoFrame
                id="hero-2"
                look={heroSmall.look}
                src={heroSmall.src}
                alt={heroSmall.title}
                showTag={false}
                sizes="160px"
                className="aspect-square rounded-full ring-8 ring-background"
              />
            </div>
          </div>
        </div>

        <div className="border-y border-border/70">
          <ul className="no-scrollbar mx-auto flex w-full max-w-6xl items-center gap-x-6 overflow-x-auto px-5 py-5 text-sm tracking-wide text-foreground/75 sm:justify-between">
            {[...categories.map((c) => c.name), "Сургалт"].map((name, i) => (
              <li key={name} className="flex shrink-0 items-center gap-6">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />}
                <span className="font-display text-lg">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Онцлох үйлчилгээ ─────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="eyebrow">Үйлчилгээ</p>
            <h2 className="mt-3 font-display text-[2.125rem] sm:mt-4 font-medium leading-tight text-foreground sm:text-5xl">
              Онцлох үйлчилгээ
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {!PRICES_CONFIRMED && <DemoTag>Жишээ үнэ</DemoTag>}
            <Link href="/services" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Бүх үйлчилгээ →
            </Link>
          </div>
        </div>

        {/* Гар утсанд тусдаа цагаан карт (Үйлчилгээ хуудастай ижил), том дэлгэцэд 4 баганат хүснэгт */}
        <ul className="mt-6 space-y-3 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-px sm:space-y-0 sm:overflow-hidden sm:rounded-[1.75rem] sm:border sm:border-border/70 sm:bg-border/70 lg:grid-cols-4">
          {featured.map((s, i) => (
            <li
              key={s.id}
              className="flex flex-col rounded-2xl border border-border/70 bg-surface p-4 sm:rounded-none sm:border-0 sm:bg-background sm:p-7 sm:transition-colors sm:hover:bg-surface"
            >
              <span className="hidden font-display text-sm text-accent-ink sm:block">0{i + 1}</span>
              <h3 className="text-base font-medium text-foreground sm:mt-6 sm:font-display sm:text-2xl sm:leading-snug">
                {s.name}
              </h3>
              <p className="mt-1 flex-1 text-sm leading-6 text-muted sm:mt-3">{s.description}</p>
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-border/60 pt-3 sm:mt-6 sm:block sm:border-0 sm:pt-0">
                <p className="text-sm">
                  <span className="font-semibold text-foreground sm:font-normal">{money(s.price)}</span>
                  <span className="text-muted"> · </span>
                  <span className="text-xs text-muted sm:text-sm">{durationLabel(s.durationMin)}</span>
                </p>
                <Link
                  href={`/book?service=${s.id}`}
                  className="btn btn-primary min-h-10 shrink-0 px-5 sm:mt-4"
                  aria-label={`${s.name} — цаг захиалах`}
                >
                  Захиалах
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Портфолио ────────────────────────────────────────── */}
      <section className="bg-surface-2/60 py-14 sm:py-20 lg:py-28">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Портфолио</p>
              <h2 className="mt-3 font-display text-[2.125rem] sm:mt-4 font-medium leading-tight text-foreground sm:text-5xl">
                Nail art бүтээлүүд
              </h2>
            </div>
            <Link href="/portfolio" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Портфолио үзэх →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
            {portfolio.slice(3, 8).map((p, i) => (
              <PhotoFrame
                key={p.id}
                id={`home-${p.id}`}
                look={p.look}
                src={p.src}
                alt={p.title}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className={`rounded-[1.5rem] ${
                  i === 0 ? "col-span-2 aspect-[4/5] lg:col-span-2 lg:row-span-2 lg:aspect-auto" : "aspect-square"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Танилцуулга ──────────────────────────────────────── */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-14 sm:gap-12 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
        <PhotoFrame
          id="about"
          look={aboutPhoto.look}
          src={aboutPhoto.src}
          alt="Namuu NAIL студи"
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="order-last aspect-[5/4] rounded-[2rem] lg:order-first lg:aspect-[4/5]"
        />
        <div>
          <p className="eyebrow">Бидний тухай</p>
          <h2 className="mt-3 font-display text-[2.125rem] sm:mt-4 font-medium leading-tight text-foreground sm:text-5xl">
            Хумсны үйлчилгээ ба сургалт —<em className="font-normal text-primary"> нэг дор</em>
          </h2>
          <p className="mt-4 text-base leading-7 text-muted sm:mt-6 sm:leading-8">
            {brand.since} оноос хойш {brand.name} нь маникюр, nail art, хумсны үйлчилгээг санал болгохоос гадна хумсны урлагт суралцах хүсэлтэй
            хүмүүст зориулсан сургалт явуулдаг.
          </p>
          <p className="mt-4">
            <DemoTag>Танилцуулга текстийг Namuu-тай хамт бичнэ</DemoTag>
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-border/70 pt-6 sm:mt-10 sm:gap-6 sm:pt-8">
            {[
              ["Маникюр", "ба педикюр"],
              ["Nail art", "дизайн"],
              ["Сургалт", "хумсны"],
            ].map(([a, b]) => (
              <div key={a}>
                <dt className="font-display text-xl font-medium text-foreground sm:text-2xl">{a}</dt>
                <dd className="mt-1 text-xs text-muted">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Сургалт ──────────────────────────────────────────── */}
      <section className="px-3 sm:px-5">
        <div className="mx-auto grid w-full max-w-6xl gap-6 overflow-hidden rounded-[2rem] bg-primary px-6 py-10 text-white sm:gap-10 sm:px-12 sm:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">Nail Training</p>
            <h2 className="mt-3 font-display text-[2.125rem] sm:mt-4 font-medium leading-tight sm:text-5xl">
              Хумсны урлагт <em className="font-normal text-primary-soft">суралцах</em>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:mt-5 sm:text-base sm:leading-7">
              Анхан шатнаас эхлээд уртасгалт, nail art хүртэл. Сургалтын хөтөлбөр, хуваарийн талаар дэлгэрэнгүй
              мэдээлэл аваарай.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/training" className="btn btn-white">
              Сургалтын мэдээлэл
            </Link>
          </div>
        </div>
      </section>

      {/* ── Захиалах алхам ───────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20 lg:py-28">
        <p className="eyebrow sm:text-center">Онлайн захиалга</p>
        <h2 className="mt-3 font-display text-[2.125rem] font-medium leading-tight text-foreground sm:mt-4 sm:text-center sm:text-5xl">
          Гурван алхамд цагаа аваарай
        </h2>
        {/* Гар утсанд нягт жагсаалт (дугаар зүүн талд), том дэлгэцэд 3 багана */}
        <ol className="mt-7 divide-y divide-border/70 border-y border-border/70 sm:mt-14 sm:grid sm:grid-cols-3 sm:gap-8 sm:divide-y-0 sm:border-0">
          {steps.map((s, i) => (
            <li key={s.title} className="flex items-start gap-4 py-4 sm:block sm:py-0 sm:text-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent font-display text-lg text-accent-ink sm:mx-auto sm:h-14 sm:w-14 sm:text-xl">
                {i + 1}
              </span>
              <span className="min-w-0">
                <h3 className="font-display text-xl font-medium text-foreground sm:mt-5 sm:text-2xl">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted sm:mx-auto sm:mt-2 sm:max-w-[16rem]">{s.text}</p>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-7 sm:mt-12 sm:text-center">
          <Link href="/book" className="btn btn-primary w-full sm:w-auto">
            Цаг захиалах
          </Link>
        </div>
      </section>

      {/* ── Холбоо барих ─────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-24 border-t border-border/70 bg-surface-2/60">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow">Холбоо барих</p>
            <h2 className="mt-3 font-display text-[2.125rem] sm:mt-4 font-medium leading-tight text-foreground sm:text-5xl">
              Биднийг зорин ирээрэй
            </h2>
            <dl className="mt-6 divide-y divide-border/70 border-y border-border/70 text-sm sm:mt-10">
              <Row label="Хаяг">{brand.address ?? <Pending />}</Row>
              <Row label="Утас">
                {brand.phone ? <a href={`tel:${brand.phone.replace(/\s/g, "")}`}>{brand.phone}</a> : <Pending />}
              </Row>
              <Row label="Instagram">
                {brand.instagram ? (
                  <a href={brand.instagram} target="_blank" rel="noreferrer" className="hover:text-primary">
                    {brand.instagramHandle}
                  </a>
                ) : (
                  <Pending />
                )}
              </Row>
              <Row label="Цагийн хуваарь">
                <span className="flex flex-wrap items-center gap-2">
                  Өдөр бүр {hhmm(branch.openMin)}–{hhmm(branch.closeMin)} <DemoTag />
                </span>
              </Row>
            </dl>
            {/* Дээрх "Захиалах алхам" хэсэгт товч бий — гар утсанд давхардуулахгүй */}
            <Link href="/book" className="btn btn-primary mt-10 hidden sm:inline-flex">
              Цаг захиалах
            </Link>
          </div>

          {/* Хаяг тодорхойгүй тул хоосон газрын зургийг гар утсанд нуух */}
          <div className="relative hidden min-h-72 items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-accent/60 bg-background lg:flex">
            <div className="text-center">
              <p className="font-display text-2xl text-foreground/70">Газрын зураг</p>
              <p className="mt-2 text-xs text-muted">Хаяг баталгаажсаны дараа энд байршил харагдана</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3.5 sm:justify-start sm:gap-6 sm:py-4">
      <dt className="shrink-0 text-muted sm:w-36">{label}</dt>
      <dd className="text-right text-foreground sm:text-left">{children}</dd>
    </div>
  );
}
