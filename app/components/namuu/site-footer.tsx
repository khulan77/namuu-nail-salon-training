import Link from "next/link";
import { brand } from "@/app/lib/namuu/brand";
import { NAV } from "./nav";
import { Pending } from "./pending";
import Wordmark from "./wordmark";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-surface-2/60">
      <div className="mx-auto grid w-full max-w-6xl gap-7 px-5 py-10 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark size="lg" />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted sm:mt-4">
            {brand.descriptor}. Маникюр, nail art, хумсны үйлчилгээ болон сургалт.
          </p>
        </div>

        <nav aria-label="Хөл цэс">
          <p className="eyebrow hidden sm:block">Цэс</p>
          {/* Гар утсанд 2 багана — урт ганц баганаас нягт */}
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:mt-4 sm:block sm:space-y-2.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-foreground/80 transition-colors hover:text-primary">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="text-foreground/80 transition-colors hover:text-primary">
                Цаг захиалах
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow">Холбоо барих</p>
          <dl className="mt-3 space-y-2 text-sm sm:mt-4 sm:space-y-2.5">
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-muted">Утас</dt>
              <dd>
                {brand.phone ? (
                  <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                    {brand.phone}
                  </a>
                ) : (
                  <Pending />
                )}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-muted">Хаяг</dt>
              <dd>{brand.address ?? <Pending />}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-muted">Instagram</dt>
              <dd>
                {brand.instagram ? (
                  <a href={brand.instagram} className="hover:text-primary" target="_blank" rel="noreferrer">
                    {brand.instagramHandle}
                  </a>
                ) : (
                  <Pending />
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5 px-5 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <p>© {brand.fullName}</p>
          <p>
            Танилцуулах демо хувилбар ·{" "}
            <Link href="/demo/admin" className="underline underline-offset-4 hover:text-primary">
              Салоны удирдлага (демо)
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
