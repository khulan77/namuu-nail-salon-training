"use client";

import Link from "next/link";
import { useState } from "react";
import { addEnquiry } from "@/app/demo/demo-store";

/*
  Сургалтын лавлагааны маягт — ДЕМО. Хүсэлт хөтчийн демо санд хадгалагдаж,
  админы демо дээр "Сургалт" хэсэгт харагдана. Имэйл, SMS илгээхгүй.
*/
export default function EnquiryForm({ courses }: { courses: { id: string; name: string }[] }) {
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (name.length < 2) return setError("Нэрээ оруулна уу.");
    if (phone.replace(/\D/g, "").length < 8) return setError("Утасны дугаараа бүтэн оруулна уу.");
    setError(null);
    addEnquiry({
      name,
      phone,
      courseId: String(data.get("course") ?? courses[0].id),
      message: String(data.get("message") ?? "").trim(),
    });
    setSent(name);
  }

  if (sent) {
    return (
      <div className="rounded-[1.75rem] border border-border/70 bg-surface p-8" role="status">
        <p className="font-display text-3xl font-medium text-foreground">Баярлалаа, {sent}!</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Таны хүсэлт салоны удирдлагын хэсэгт бүртгэгдлээ.
        </p>
        <p className="mt-5 rounded-2xl bg-surface-2 px-4 py-3 text-xs leading-5 text-muted">
          <b className="text-foreground">Демо:</b> хүсэлт зөвхөн энэ хөтөчид хадгалагдсан, салон руу мэдэгдэл
          илгээгдээгүй.{" "}
          <Link href="/demo/admin?tab=training" className="font-medium text-primary underline underline-offset-4">
            Админ дээр харах
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-[1.75rem] border border-border/70 bg-surface p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Нэр">
          <input name="name" autoComplete="name" className="input" required />
        </Field>
        <Field label="Утас">
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" className="input" required />
        </Field>
      </div>
      <Field label="Сонирхож буй сургалт" className="mt-4">
        <select name="course" className="input" defaultValue={courses[0].id}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Асуулт (заавал биш)" className="mt-4">
        <textarea name="message" rows={3} className="input resize-none" />
      </Field>
      {error && (
        <p role="alert" className="mt-4 text-sm text-primary">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto">
        Хүсэлт илгээх
      </button>
    </form>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-foreground/75">{label}</span>
      {children}
    </label>
  );
}
