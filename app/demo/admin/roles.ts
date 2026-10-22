/*
  Ажилтны эрх — ДЕМО.

  Жинхэнэ систем (`app/_live`) одоогоор 2 эрхтэй: админ (ADMIN_EMAILS) ба
  мастер (өөрийн захиалгыг л харна). "Ресепшн" эрх ба ирцийн бүртгэл нь энэ
  демод зориулсан шинэ санал — жинхэнэ системд нэмэхэд өгөгдлийн сангийн
  хүснэгт (staff_roles, attendance) ба серверийн эрхийн шалгалт шаардлагатай.
*/
import { staff } from "./demo-data";

export type Role = "owner" | "reception" | "master";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Эзэн / Админ",
  reception: "Ресепшн",
  master: "Мастер",
};

/** Нарийн талбарт (сонгогч) — товч нэр */
export const ROLE_SHORT: Record<Role, string> = { owner: "Админ", reception: "Ресепшн", master: "Мастер" };

export type Account = {
  id: string;
  name: string;
  title: string;
  /** Анхдагч эрх — "Ажилтан ба эрх" табаас өөрчилж болно. */
  role: Role;
  /** Мастер бол хуанлийн баганатай холбогдоно. */
  staffId?: string;
};

/** Жишээ хэрэглэгчид — нэрс зохиомол. */
export const accounts: Account[] = [
  { id: "owner", name: "Эзэн", title: "Салоны эзэн", role: "owner" },
  { id: "reception", name: "Солонго", title: "Ресепшн", role: "reception" },
  ...staff.map((m) => ({ id: m.id, name: m.name, title: m.title, role: "master" as Role, staffId: m.id })),
];

export const accountById = (id: string) => accounts.find((a) => a.id === id) ?? accounts[0];

export type NavKey =
  | "dash"
  | "calendar"
  | "bookings"
  | "customers"
  | "revenue"
  | "attendance"
  | "training"
  | "services"
  | "staff"
  | "team"
  | "settings";

/** Эрх бүрт харагдах цэс. */
export const TABS: Record<Role, NavKey[]> = {
  owner: ["dash", "calendar", "bookings", "customers", "revenue", "attendance", "training", "services", "staff", "team", "settings"],
  reception: ["dash", "calendar", "bookings", "customers", "attendance", "training"],
  master: ["dash", "calendar", "attendance"],
};

/** Эрхийн хүснэгт — "Ажилтан ба эрх" табд харуулна. */
export const PERMISSIONS: { label: string; roles: Role[] }[] = [
  { label: "Бүх мастерын хуанли харах", roles: ["owner", "reception"] },
  { label: "Захиалга нэмэх, баталгаажуулах, цуцлах", roles: ["owner", "reception"] },
  { label: "Зөвхөн өөрийн захиалга харах", roles: ["master"] },
  { label: "Үйлчлүүлэгчдийн мэдээлэл", roles: ["owner", "reception"] },
  { label: "Сургалтын хүсэлт", roles: ["owner", "reception"] },
  { label: "Ирц бүртгэх (бусдынх)", roles: ["owner", "reception"] },
  { label: "Өөрийн ирц бүртгүүлэх", roles: ["owner", "reception", "master"] },
  { label: "Орлого, тайлан харах", roles: ["owner"] },
  { label: "Үйлчилгээ, үнэ засах", roles: ["owner"] },
  { label: "Ажилтан, эрх удирдах", roles: ["owner"] },
  { label: "Урьдчилгаа тохируулах", roles: ["owner"] },
];
