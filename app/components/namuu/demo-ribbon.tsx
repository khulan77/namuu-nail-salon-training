import Link from "next/link";

/** Сайтын хамгийн дээд талд — энэ бол танилцуулах демо гэдгийг үргэлж сануулна. */
export default function DemoRibbon() {
  return (
    <div className="bg-primary-soft text-foreground">
      <p className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-5 py-2 text-center text-[11px] tracking-wide sm:text-xs">
        <span>
          <span className="font-semibold uppercase tracking-[0.2em] text-primary">Демо</span>
          <span className="mx-2 opacity-40">·</span>
          Үнэ, мастер, цагийн хуваарь нь жишээ мэдээлэл. Захиалга зөвхөн энэ хөтөчид хадгалагдана.
        </span>
        <Link href="/demo" className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
          Демо удирдамж
        </Link>
      </p>
    </div>
  );
}
