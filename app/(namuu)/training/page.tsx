import PhotoFrame from "@/app/components/namuu/photo-frame";
import { DemoTag, Pending } from "@/app/components/namuu/pending";
import { money } from "@/app/lib/namuu/catalog";
import { photo } from "@/app/lib/namuu/portfolio";

const cover = photo("almond");
import { courses } from "@/app/lib/namuu/training";
import EnquiryForm from "./enquiry-form";

export const metadata = { title: "Хумсны сургалт" };

export default function TrainingPage() {
  return (
    <>
      <header className="mx-auto grid w-full max-w-6xl items-end gap-8 px-5 pb-10 pt-10 sm:gap-10 sm:pb-14 sm:pt-20 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">Nail Training</p>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
            Хумсны <em className="font-normal text-primary">сургалт</em>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            Хумсны урлагийг мэргэжил болгох, эсвэл ур чадвараа ахиулах хүсэлтэй хүмүүст зориулсан хөтөлбөрүүд.
          </p>
          <p className="mt-6">
            <DemoTag>Хөтөлбөрийн бүтэц жишээ — Namuu баталгаажуулна</DemoTag>
          </p>
        </div>
        <PhotoFrame
          id="training"
          look={cover.look}
          src={cover.src}
          alt="Хумсны сургалт"
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="aspect-[16/10] rounded-[2rem]"
        />
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 sm:pb-20">
        <ul className="grid gap-5 lg:grid-cols-3">
          {courses.map((c, i) => (
            <li key={c.id} className="flex flex-col rounded-[1.75rem] border border-border/70 bg-surface p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-sm text-accent-ink">0{i + 1}</span>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-medium text-primary">
                  {c.level}
                </span>
              </div>
              <h2 className="mt-6 font-display text-3xl font-medium leading-tight text-foreground">{c.name}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{c.summary}</p>

              <p className="mt-5 text-xs font-medium uppercase sm:mt-7 tracking-[0.16em] text-foreground/70">Хөтөлбөр</p>
              <ul className="mt-3 flex-1 space-y-2.5 text-sm text-foreground/85">
                {c.topics.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>

              <dl className="mt-6 grid grid-cols-3 gap-3 border-t sm:mt-8 border-border/70 pt-5 text-xs">
                <Info label="Хугацаа" value={c.duration} />
                <Info label="Төлбөр" value={c.price === null ? null : money(c.price)} />
                <Info label="Эхлэх" value={c.nextStart} />
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section id="enquiry" className="scroll-mt-24 border-t border-border/70 bg-surface-2/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:gap-12 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">Лавлагаа</p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
              Сургалтын талаар лавлах
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted">
              Хүсэлтээ үлдээвэл салон тантай холбогдож хуваарь, төлбөрийн мэдээлэл өгнө. Онлайнаар бүртгэл, төлбөр
              авахгүй.
            </p>
          </div>
          <EnquiryForm courses={courses.map((c) => ({ id: c.id, name: c.name }))} />
        </div>
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 text-foreground">{value ?? <Pending>Лавлана уу</Pending>}</dd>
    </div>
  );
}
