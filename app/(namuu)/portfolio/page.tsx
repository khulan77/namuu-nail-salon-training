import Link from "next/link";
import { brand } from "@/app/lib/namuu/brand";
import Gallery from "./gallery";

export const metadata = { title: "Портфолио" };

export default function PortfolioPage() {
  return (
    <>
      <header className="mx-auto w-full max-w-6xl px-5 pb-10 pt-14 sm:pt-20">
        <p className="eyebrow">Портфолио</p>
        <h1 className="mt-5 font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
          Nail art <em className="font-normal text-primary">бүтээлүүд</em>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted">
          Гель, франц, хром, омбре болон гараар зурсан дизайн.
        </p>
        {brand.instagram && (
          <a
            href={brand.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Instagram дээр илүү ихийг үзэх · {brand.instagramHandle}
          </a>
        )}
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 pb-20">
        <Gallery />
      </div>

      <section className="border-t border-border/70 bg-surface-2/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">Таалагдсан дизайнаа захиалаарай</h2>
          <Link href="/book" className="btn btn-primary">
            Цаг захиалах
          </Link>
        </div>
      </section>
    </>
  );
}
