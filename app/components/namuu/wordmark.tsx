import Image from "next/image";
import { brand } from "@/app/lib/namuu/brand";

/**
 * Брэндийн тэмдэг. `brand.logoSrc` байвал Namuu-ийн дугуй логог нэрийн хамт
 * харуулна (лого дээрх жижиг бичиг толгой хэсгийн хэмжээнд уншигдахгүй тул
 * нэрийг хажууд нь давхар бичнэ). Лого байхгүй бол зөвхөн текст.
 */
export default function Wordmark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  const badge = size === "lg" ? "h-16 w-16" : "h-11 w-11";
  return (
    <span className={`inline-flex items-center gap-3 leading-none ${className}`}>
      {brand.logoSrc && (
        <Image
          src={brand.logoSrc}
          alt=""
          width={128}
          height={128}
          priority={size === "md"}
          className={`${badge} shrink-0 rounded-full shadow-[0_0_0_1px_var(--border)]`}
        />
      )}
      <span className="flex flex-col gap-1" aria-label={brand.fullName}>
        <span className="font-display text-[1.35rem] tracking-[0.14em] text-foreground">NAMUU</span>
        <span className="text-[0.58rem] font-medium uppercase tracking-[0.32em] text-accent-ink">Nail Salon</span>
      </span>
    </span>
  );
}
