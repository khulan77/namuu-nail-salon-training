import type { NailLook } from "@/app/components/namuu/photo-frame";

/*
  Портфолио — Namuu-ийн Instagram (@namuu_nailart)-ын бодит бүтээлүүд.
  Эх screenshot-оос зөвхөн зургийн хэсгийг тайрсан (`design/instagram-source/`).
  Зарим пост бусад мастертай хамтарсан тул нийтэд гаргахаас өмнө Namuu-аар
  баталгаажуулна.

  `look` — зураг ачаалагдах хүртэлх дэвсгэр өнгө (src байхгүй бол жишээ дүрслэл).
*/

export type PortfolioItem = {
  id: string;
  title: string;
  tag: "Nail art" | "Франц" | "Омбре" | "Педикюр";
  look: NailLook;
  src?: string;
  /** Галерейд өндөр (portrait) эсвэл дөрвөлжин харагдах */
  tall?: boolean;
};

const soft: NailLook = { bg: "#f6e4e1", base: "#e8b9b4", finish: "gloss" };

export const portfolio: PortfolioItem[] = [
  { id: "stars", title: "Од ба омбре", tag: "Омбре", tall: true, src: "/portfolio/namuu-08.jpg", look: soft },
  { id: "blue-french", title: "Цэнхэр франц, од", tag: "Франц", tall: true, src: "/portfolio/namuu-05.jpg", look: soft },
  { id: "pearls", title: "Сувд ба нум", tag: "Nail art", src: "/portfolio/namuu-07.jpg", look: soft },
  { id: "pinterest", title: "Pinterest дизайн", tag: "Nail art", src: "/portfolio/namuu-02.jpg", look: soft },
  { id: "almond", title: "Бүйлсэн хэлбэр, өнгөт үзүүр", tag: "Франц", tall: true, src: "/portfolio/namuu-01.jpg", look: soft },
  { id: "swirl", title: "Од ба эргүүлэг", tag: "Nail art", tall: true, src: "/portfolio/namuu-03.jpg", look: soft },
  { id: "gems", title: "Чулуун чимэглэл", tag: "Nail art", src: "/portfolio/namuu-04.jpg", look: soft },
  { id: "pedicure", title: "Франц педикюр", tag: "Педикюр", src: "/portfolio/namuu-06.jpg", look: soft },
];

export const PORTFOLIO_TAGS = ["Бүгд", "Nail art", "Франц", "Омбре", "Педикюр"] as const;

export const photo = (id: string) => portfolio.find((p) => p.id === id) ?? portfolio[0];
