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
      <header className="mx-auto w-full max-w-6xl px-5 pb-10 pt-14 sm:pt-20">
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
        <ul className="no-scrollbar mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-5 py-3">
          {categories.map((c) => (
            <li key={c.id} className="shrink-0">
              <a
                href={`#${c.id}`}
                className="block rounded-full px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-primary-soft hover:text-primary"
              >
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto w-full max-w-6xl px-5 pb-24">
        {categories.map((c) => {
          const list = services.filter((s) => s.categoryId === c.id);
          if (list.length === 0) return null;
          return (
            <section key={c.id} id={c.id} className="scroll-mt-36 grid gap-8 border-b border-border/70 py-14 lg:grid-cols-[1fr_2fr] lg:gap-16">
              <div>
                <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">{c.name}</h2>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{c.intro}</p>
              </div>
              <ul className="divide-y divide-border/70">
                {list.map((s) => (
                  <li key={s.id} className="flex flex-col gap-4 py-6 first:pt-0 sm:flex-row sm:items-center sm:gap-8">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-2xl font-medium text-foreground">{s.name}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted">{s.description}</p>
                    </div>
                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <p className="text-sm sm:text-right">
                        <span className="block font-medium text-foreground">{money(s.price)}</span>
                        <span className="block text-xs text-muted">{durationLabel(s.durationMin)}</span>
                      </p>
                      <Link
                        href={`/book?service=${s.id}`}
                        className="btn btn-soft min-h-10 px-5"
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
