import Link from "next/link";
import Wordmark from "@/app/components/namuu/wordmark";

/*
  Танилцуулагчийн удирдамж (/demo) — Namuu-д системээ үзүүлэх дараалал,
  юу нь ажилладаг, юу нь жишээ гэдгийг нэг дор. Индексжүүлэхгүй.
*/

export const metadata = {
  title: "Демо удирдамж",
  robots: { index: false, follow: false },
};

const walkthrough = [
  {
    title: "Нүүр хуудас",
    text: "Брэнд, онцлох үйлчилгээ, портфолио, сургалт, холбоо барих хэсэг.",
    href: "/",
    cta: "Сайт нээх",
  },
  {
    title: "Үйлчилгээ сонгох",
    text: "Ангиллаар, хугацаа ба үнэтэй. “Захиалах” дарахад тухайн үйлчилгээ сонгогдсон байдлаар захиалга нээгдэнэ.",
    href: "/services",
    cta: "Үйлчилгээ",
  },
  {
    title: "Онлайн захиалга",
    text: "Мастер → өдөр → сул цаг → мэдээлэл → баталгаажуулалт. Захиалагдсан цаг дахин харагдахгүй.",
    href: "/book",
    cta: "Захиалга өгөх",
  },
  {
    title: "Админ дээр харах",
    text: "Дөнгөж өгсөн захиалга “ШИНЭ · САЙТААС” гэж гарна. Баталгаажуулах, хуанлид харах, өөр мастер руу шилжүүлэх.",
    href: "/demo/admin?tab=bookings",
    cta: "Админ нээх",
  },
  {
    title: "Хуанли ба үйлчлүүлэгчид",
    text: "Бүх мастер нэг хуанлид, үйлчлүүлэгч бүрийн түүх, сургалтын хүсэлтүүд.",
    href: "/demo/admin?tab=calendar",
    cta: "Хуанли",
  },
  {
    title: "Орлого",
    text: "Өнөөдрийн болон сарын орлого, аль үйлчилгээ, аль мастер хэр орлого оруулсан.",
    href: "/demo/admin?tab=revenue",
    cta: "Орлого",
  },
  {
    title: "Эрх ба ирц",
    text: "“Нэвтэрсэн (демо)” сонголтоор Ресепшн, Мастер эрхээр үзүүлнэ. Ирц хэсэгт ажилтнуудыг бүртгэнэ.",
    href: "/demo/admin?tab=attendance",
    cta: "Ирц",
  },
];

const works = [
  "Сул цагийн тооцоо: ажлын цаг, үйлчилгээний хугацаа, давхцал, өнгөрсөн цаг",
  "Захиалга өгөх → админд шууд гарч ирэх (нэг хөтөч дотор, өөр табд ч)",
  "Захиалгын төлөв: баталгаажуулах, цуцлах, дууссан, ирээгүй",
  "Хуанли дээр захиалга нэмэх, засах, мастер солих",
  "Үйлчлүүлэгчдийн жагсаалт захиалгын түүхээс",
  "Сургалтын лавлагааны маягт → админы “Сургалтын хүсэлт”",
  "Орлого: өнөөдөр / 7 хоног / сар, үйлчилгээ ба мастераар, өмнөх үетэй харьцуулалт",
  "Урьдчилгааны тохиргоо → захиалгад урьдчилгааны алхам, төлсөн бол шууд баталгаажна",
  "Эрх: Эзэн, Ресепшн, Мастер — эрх бүр өөр цэс, өөр үйлдэл",
  "Ирц: ирсэн, хоцорсон, ирээгүй, чөлөө; сарын тайлан",
];

const simulated = [
  "Өгөгдөл зөвхөн тухайн хөтчийн localStorage-д — сервер, өгөгдлийн сан байхгүй",
  "SMS, имэйл мэдэгдэл илгээгдэхгүй",
  "Урьдчилгаа — “төлсөн гэж үзэх” товчоор дуурайна, QPay холбогдоогүй",
  "Эрх солих нь жинхэнэ нэвтрэлт биш — демо сонголт",
  "Ресепшн эрх ба ирц жинхэнэ системд хараахан байхгүй — нэмэх ажил шаардлагатай",
  "Өмнөх өдрүүдийн захиалга, ирц — зохиомол түүх",
  "Админ нэвтрэх эрхгүй — демо нээлттэй",
  "Үнэ, мастерын нэр, ажлын цаг, сургалтын агуулга — жишээ",
];

export default function DemoGuide() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:py-16">
        <Link href="/">
          <Wordmark />
        </Link>
        <p className="eyebrow mt-8 sm:mt-12">Танилцуулгын удирдамж</p>
        <h1 className="mt-3 font-display text-[2.375rem] font-medium leading-[1.1] text-foreground sm:mt-4 sm:text-6xl sm:leading-[1.05]">
          Namuu NAIL — <em className="font-normal text-primary">онлайн захиалгын систем</em>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted sm:mt-5 sm:text-base">
          Үйлчлүүлэгч сайтаар орж үйлчилгээ, цагаа сонгон захиалга өгөхөд салоны удирдлага тэр захиалгыг хүлээн
          авч удирддаг бүтэн урсгалыг харуулна.
        </p>

        {/* Гар утсанд дугаар гарчгийн хажууд, товч жижиг — бүтэн өргөн товч олон давтагдахгүй */}
        <ol className="mt-8 divide-y divide-border/70 border-y border-border/70 sm:mt-12">
          {walkthrough.map((s, i) => (
            <li key={s.title} className="flex items-start gap-4 py-5 sm:items-center sm:gap-8 sm:py-6">
              <span className="w-6 shrink-0 font-display text-2xl leading-8 text-accent-ink sm:w-auto sm:text-3xl">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-medium leading-8 text-foreground sm:text-2xl">{s.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{s.text}</p>
                <Link href={s.href} className="btn btn-soft mt-3 min-h-10 px-5 sm:hidden">
                  {s.cta} →
                </Link>
              </div>
              <Link href={s.href} className="btn btn-soft hidden shrink-0 sm:inline-flex">
                {s.cta}
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-6 rounded-2xl bg-primary-soft px-4 py-4 text-sm leading-6 text-foreground sm:px-5">
          <b>Зөвлөгөө:</b> админыг нэг табд, сайтыг өөр табд нээгээд захиалга өгвөл админ дээр мэдэгдэл шууд гарч
          ирнэ. Танилцуулгын дараа админы “Демо шинэчлэх” товчоор анхны байдалд нь буцаана.
        </p>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6">
          <section className="rounded-[1.75rem] border border-border/70 bg-surface p-5 sm:p-7">
            <h2 className="font-display text-2xl font-medium text-foreground">Ажилладаг</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-6 text-foreground/85">
              {works.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-[1.75rem] border border-dashed border-accent/70 bg-surface p-5 sm:p-7">
            <h2 className="font-display text-2xl font-medium text-foreground">Демо / жишээ</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-6 text-foreground/85">
              {simulated.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-10 text-xs leading-5 text-muted">
          Жинхэнэ хувилбарт захиалга тусгаарлагдсан өгөгдлийн санд (Supabase) хадгалагдаж, админ нэвтрэх эрхтэй,
          имэйл мэдэгдэлтэй болно — систем үүнийг аль хэдийн дэмждэг, зөвхөн тохиргоо шаардлагатай.
        </p>
      </div>
    </div>
  );
}
