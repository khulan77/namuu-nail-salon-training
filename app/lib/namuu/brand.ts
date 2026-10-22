/*
  Namuu NAIL-ийн брэндийн мэдээлэл — сайтын бүх хэсэг эндээс уншина.

  Утас, Instagram — Namuu-ийн өөрийн Instagram постуудаас (@namuu_nailart).
  `null` = клиентээс хараахан ирээгүй мэдээлэл. Сайт тэр хэсэгт зохиомол
  утга бичихийн оронд "мэдээлэл оруулна" гэсэн тэмдэглэгээ харуулна.
  Клиент баталгаажуулмагц энд бөглөхөд хангалттай.
*/
export const brand = {
  name: "Namuu NAIL",
  fullName: "Namuu NAIL Salon & Nail Training",
  descriptor: "Nail Salon & Nail Training",
  /** Сайтын тайлбар (SEO, OG) — үйл ажиллагааны чиглэлээс өөр баримт агуулаагүй. */
  description:
    "Namuu NAIL — маникюр, nail art, хумсны үйлчилгээ болон хумсны сургалт. Онлайнаар цаг захиална уу.",

  phone: "9964 0161" as string | null,
  email: null as string | null,
  address: null as string | null,
  instagram: "https://www.instagram.com/namuu_nailart/" as string | null,
  instagramHandle: "@namuu_nailart",
  since: 2020,
  facebook: null as string | null,
  /** Лого зураг (public/ доторх зам). null бол текстэн wordmark харагдана. */
  logoSrc: "/brand/namuu-logo.png" as string | null,
};

/** Сайт хаана нээгдэж байгаа — OG зураг, metadata-д. Production URL-ыг санаатайгаар оруулаагүй. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
