import Image from "next/image";

/*
  Зургийн хүрээ. `src` байвал next/image-ээр оновчтой ачаална. Байхгүй бол
  (клиентийн зураг хараахан ирээгүй) хумсны хийцийг дүрсэлсэн SVG зураг
  зурж, "Жишээ дүрслэл" гэж тэмдэглэнэ — бусдын бүтээлийн stock зургийг
  Namuu-ийнх мэтээр харуулахгүйн тулд.
*/

export type NailLook = {
  /** Дэвсгэр өнгө */
  bg: string;
  /** Хумсны үндсэн өнгө */
  base: string;
  finish: "gloss" | "french" | "chrome" | "ombre" | "art";
  /** Омбре/хром/дизайны хоёрдогч өнгө */
  second?: string;
};

const NAILS = [
  { x: 118, lift: 18, rot: -9, scale: 0.92 },
  { x: 182, lift: -10, rot: -3, scale: 1 },
  { x: 246, lift: -18, rot: 3, scale: 1.02 },
  { x: 308, lift: 4, rot: 9, scale: 0.94 },
];

// Бүйлсэн хэлбэртэй хумс (0,0 цэгт төвлөрсөн).
const NAIL_PATH =
  "M0 -62 C17 -62 23 -40 23 -8 L23 48 Q23 60 11 60 L-11 60 Q-23 60 -23 48 L-23 -8 C-23 -40 -17 -62 0 -62 Z";

export function NailIllustration({ look, id }: { look: NailLook; id: string }) {
  const g = `g-${id}`;
  const clip = `c-${id}`;
  const second = look.second ?? "#ffffff";
  const fill =
    look.finish === "chrome" || look.finish === "ombre" ? `url(#${g})` : look.base;

  return (
    <svg
      viewBox="0 0 420 520"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2={look.finish === "chrome" ? "1" : "0"} y2="1">
          <stop offset="0" stopColor={look.finish === "chrome" ? "#ffffff" : second} />
          <stop offset={look.finish === "chrome" ? "0.45" : "0.15"} stopColor={look.finish === "chrome" ? second : second} />
          <stop offset="1" stopColor={look.base} />
        </linearGradient>
        <clipPath id={clip}>
          <path d={NAIL_PATH} />
        </clipPath>
      </defs>
      <rect width="420" height="520" fill={look.bg} />
      <circle cx="330" cy="96" r="120" fill="#ffffff" opacity="0.28" />

      {NAILS.map((n, i) => (
        <g key={i} transform={`translate(${n.x} ${300 + n.lift}) rotate(${n.rot}) scale(${n.scale})`}>
          {/* хуруу */}
          <rect x="-34" y="-74" width="68" height="420" rx="34" fill="#efdcd0" />
          <rect x="-34" y="-74" width="68" height="420" rx="34" fill="#000" opacity="0.025" />
          {/* хумс */}
          <path d={NAIL_PATH} fill={fill} />
          {look.finish === "french" && (
            <g clipPath={`url(#${clip})`}>
              <path d="M-30 -70 L30 -70 L30 -30 Q0 -14 -30 -30 Z" fill={second} />
            </g>
          )}
          {look.finish === "art" && (
            <g clipPath={`url(#${clip})`} fill={second}>
              {i % 2 === 0 ? (
                <>
                  <circle cx="-6" cy="-14" r="5" />
                  <circle cx="7" cy="-6" r="5" />
                  <circle cx="-4" cy="2" r="5" />
                  <circle cx="0" cy="-6" r="3" fill={look.bg} />
                </>
              ) : (
                <path d="M-30 30 Q0 -10 30 20 L30 70 L-30 70 Z" opacity="0.9" />
              )}
            </g>
          )}
          {/* гялбаа */}
          <path d="M-12 -44 Q-15 -10 -12 30" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.45" />
        </g>
      ))}
    </svg>
  );
}

export default function PhotoFrame({
  id,
  look,
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  showTag = true,
}: {
  id: string;
  look: NailLook;
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showTag?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <>
          <NailIllustration look={look} id={id} />
          <span className="sr-only">{alt} — жишээ дүрслэл</span>
          {showTag && (
            <span className="absolute bottom-3 left-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-medium tracking-wide text-accent-ink backdrop-blur-sm">
              Жишээ дүрслэл
            </span>
          )}
        </>
      )}
    </div>
  );
}
