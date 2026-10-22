"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "./nav";
import Wordmark from "./wordmark";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 sm:h-[4.5rem]">
        <Link href="/" onClick={close} className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Үндсэн цэс" className="ml-auto hidden items-center gap-8 md:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm tracking-wide transition-colors hover:text-primary ${
                  active ? "text-primary" : "text-foreground/80"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/book" className="btn btn-primary ml-auto hidden min-h-10 px-5 md:ml-0 md:inline-flex">
          Цаг захиалах
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Цэс хаах" : "Цэс нээх"}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-full md:hidden"
        >
          <span className="relative block h-3 w-5" aria-hidden>
            <span
              className={`absolute left-0 h-px w-5 bg-foreground transition-transform duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 h-px w-5 bg-foreground transition-transform duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Гар утасны цэс"
          className="animate-fade-up border-t border-border/70 bg-background px-5 pb-8 pt-4 md:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={close}
                  className="block border-b border-border/60 py-4 font-display text-2xl text-foreground"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/book" onClick={close} className="btn btn-primary mt-6 w-full">
            Цаг захиалах
          </Link>
        </nav>
      )}
    </header>
  );
}
