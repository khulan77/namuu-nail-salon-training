import Link from "next/link";
import { DemoTag } from "@/app/components/namuu/pending";
import {
  PRICES_CONFIRMED,
  categories,
  durationLabel,
  money,
  services,
} from "@/app/lib/namuu/catalog";

export const metadata = { title: "Үйлчилгээ" };

export default function ServicesPage() {
  return (
    <>
      <header className="mx-auto w-full max-w-6xl px-5 pb-8 pt-10 sm:pb-10 sm:pt-20">
        <p className="eyebrow">Үйлчилгээ ба үнэ</p>
        <h1 className="mt-5 font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
          Үйлчилгээ
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted">
          Үйлчилгээ бүрийн үргэлжлэх хугацааг харгалзан онлайн захиалгын сул цаг автоматаар тооцогдоно.
        </p>
        {!PRICES_CONFIRMED && (
          <p className="mt-6">
            <DemoTag>Үнэ, хугацаа жишээ — Namuu баталгаажуулна</DemoTag>
          </p>
        )}
      </header>

      <nav aria-label="Ангилал" className="sticky top-16 z-30 border-y border-border/70 bg-background/90 backdrop-blur-md sm:top-[4.5rem]">
        <ul className="no-scrollbar mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-5 py-2.5 sm:py-3">
          {categories.map((c) => (
            <li key={c.id} className="shrink-0">
              <a
                href={`#${c.id}`}
                className="block rounded-full bg-surface px-4 py-2 text-sm text-foreground/80 ring-1 ring-border transition-colors hover:bg-primary-soft hover:text-primary sm:bg-transparent sm:ring-0"
              >
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 sm:pb-24">
        {categories.map((c) => {
          const list = services.filter((s) => s.categoryId === c.id);
          if (list.length === 0) return null;
          return (
            <section
              key={c.id}
              id={c.id}
              className="scroll-mt-36 grid gap-4 py-8 sm:gap-8 sm:border-b sm:border-border/70 sm:py-14 lg:grid-cols-[1fr_2fr] lg:gap-16"
            >
              {/* Гар утсанд ангиллын гарчиг жижиг, тоотой — үйлчилгээний нэрээс ялгарна */}
              <div className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-3 sm:block sm:border-0 sm:pb-0">
                <h2 className="font-display text-[1.75rem] font-medium text-foreground sm:text-4xl">{c.name}</h2>
                <span className="shrink-0 text-xs text-muted sm:hidden">{list.length} үйлчилгээ</span>
                <p className="mt-3 hidden max-w-xs text-sm leading-6 text-muted sm:block">{c.intro}</p>
              </div>
              {/* Гар утсанд цагаан карт, том дэлгэцэд зураасаар тусгаарласан жагсаалт */}
              <ul className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-border/70">
                {list.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-2xl border border-border/70 bg-surface p-4 sm:flex sm:items-center sm:gap-8 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:py-6 sm:first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-medium text-foreground sm:font-display sm:text-2xl">{s.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted sm:mt-1.5">{s.description}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4 border-t border-border/60 pt-3 sm:mt-0 sm:justify-end sm:gap-6 sm:border-0 sm:pt-0">
                      <p className="text-sm sm:text-right">
                        <span className="font-semibold text-foreground sm:block sm:font-medium">{money(s.price)}</span>
                        <span className="text-muted sm:hidden"> · </span>
                        <span className="text-xs text-muted sm:block">{durationLabel(s.durationMin)}</span>
                      </p>
                      <Link
                        href={`/book?service=${s.id}`}
                        className="btn btn-primary min-h-10 shrink-0 px-5"
                        aria-label={`${s.name} — цаг захиалах`}
                      >
                        Захиалах
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
