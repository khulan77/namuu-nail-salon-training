"use client";

import { useState } from "react";
import PhotoFrame from "@/app/components/namuu/photo-frame";
import { PORTFOLIO_TAGS, portfolio } from "@/app/lib/namuu/portfolio";

type Tag = (typeof PORTFOLIO_TAGS)[number];

export default function Gallery() {
  const [tag, setTag] = useState<Tag>("Бүгд");
  const items = tag === "Бүгд" ? portfolio : portfolio.filter((p) => p.tag === tag);

  return (
    <>
      <div role="group" aria-label="Шүүлтүүр" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
        {PORTFOLIO_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            aria-pressed={tag === t}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
              tag === t ? "bg-primary text-white" : "bg-surface-2 text-foreground/80 hover:bg-primary-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CSS багана — өндөр, намхан зургууд хоорондоо зайгүй уялдана. */}
      <ul className="mt-8 columns-2 gap-3 sm:gap-4 lg:columns-3">
        {items.map((p) => (
          <li key={p.id} className="mb-3 break-inside-avoid sm:mb-4">
            <figure>
              <PhotoFrame
                id={`pf-${p.id}`}
                look={p.look}
                src={p.src}
                alt={p.title}
                sizes="(min-width: 1024px) 33vw, 50vw"
                className={`rounded-[1.5rem] ${p.tall ? "aspect-[3/4]" : "aspect-square"}`}
              />
              <figcaption className="mt-2.5 flex items-baseline justify-between gap-3 px-1">
                <span className="font-display text-lg text-foreground">{p.title}</span>
                <span className="shrink-0 text-xs text-muted">{p.tag}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </>
  );
}
