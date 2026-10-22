"use client";

import { money } from "./demo-data";
import type { DemoSettings } from "../demo-store";
import { PERMISSIONS, ROLE_LABEL, accounts, type Role } from "./roles";

/* ── Ажилтан ба эрх ───────────────────────────────────────────────── */

export function Team({
  roleOf,
  setRole,
  selfId,
}: {
  roleOf: (id: string) => Role;
  setRole: (id: string, role: Role) => void;
  selfId: string;
}) {
  const roles: Role[] = ["owner", "reception", "master"];
  return (
    <div>
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">Ажилтан ба эрх</h1>
      <p className="mt-1 text-sm text-muted">
        Ажилтан бүр өөрийн нэвтрэх эрхтэй. Эрхээс хамаарч харах цэс, хийж болох үйлдэл өөр. Нэрс жишээ.
      </p>

      <ul className="card mt-6 divide-y divide-border/60 overflow-hidden">
        {accounts.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-primary">
              {a.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {a.name}
                {a.id === selfId && <span className="ml-2 text-xs font-normal text-muted">(та)</span>}
              </span>
              <span className="block text-xs text-muted">{a.title}</span>
            </span>
            <label className="sr-only" htmlFor={`role-${a.id}`}>
              {a.name} — эрх
            </label>
            <select
              id={`role-${a.id}`}
              value={roleOf(a.id)}
              disabled={a.id === "owner"}
              onChange={(e) => setRole(a.id, e.target.value as Role)}
              className="field w-auto min-w-36 disabled:opacity-60"
            >
              {roles
                .filter((r) => r !== "master" || a.staffId)
                .map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
            </select>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-display text-2xl text-foreground">Эрхийн хүснэгт</h2>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-border/70 text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Үйлдэл</th>
              {roles.map((r) => (
                <th key={r} className="px-3 py-3 text-center font-medium">
                  {ROLE_LABEL[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {PERMISSIONS.map((p) => (
              <tr key={p.label}>
                <td className="px-5 py-2.5 text-foreground">{p.label}</td>
                {roles.map((r) => (
                  <td key={r} className="px-3 py-2.5 text-center">
                    {p.roles.includes(r) ? (
                      <span className="font-semibold text-emerald-700" aria-label="Тийм">
                        ✓
                      </span>
                    ) : (
                      <span className="text-muted" aria-label="Үгүй">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">
        Демо: зүүн доод талын “Нэвтэрсэн” сонголтоор эрх бүрээр системийг үзэж болно. Жинхэнэ системд Админ ба Мастер
        эрх бэлэн байгаа; Ресепшн эрх ба ирцийн бүртгэлийг нэмэхэд өгөгдлийн сангийн өөрчлөлт шаардлагатай.
      </p>
    </div>
  );
}

/* ── Тохиргоо (урьдчилгаа) ────────────────────────────────────────── */

export function Settings({
  settings,
  setSettings,
}: {
  settings: DemoSettings;
  setSettings: (s: DemoSettings) => void;
}) {
  const steps = [10000, 20000, 30000, 50000];
  return (
    <div>
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">Тохиргоо</h1>
      <p className="mt-1 text-sm text-muted">Онлайн захиалгын урьдчилгаа.</p>

      <section className="card mt-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-medium text-foreground">Урьдчилгаа шаардах</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Идэвхтэй бол үйлчлүүлэгч онлайнаар захиалахдаа урьдчилгаа төлж, захиалга шууд баталгаажна. Ирэхгүй өнжих
              захиалгыг багасгана.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.depositEnabled}
            aria-label="Урьдчилгаа шаардах"
            onClick={() => setSettings({ ...settings, depositEnabled: !settings.depositEnabled })}
            className={`mt-1 flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
              settings.depositEnabled ? "bg-primary" : "bg-border"
            }`}
          >
            <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.depositEnabled ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <fieldset className={`mt-6 ${settings.depositEnabled ? "" : "pointer-events-none opacity-50"}`} disabled={!settings.depositEnabled}>
          <legend className="text-xs font-medium text-foreground/75">Урьдчилгааны дүн</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {steps.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={settings.depositAmount === v}
                onClick={() => setSettings({ ...settings, depositAmount: v })}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  settings.depositAmount === v ? "bg-primary text-white" : "bg-surface-2 text-foreground/80 hover:bg-primary-soft"
                }`}
              >
                {money(v)}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="mt-6 rounded-2xl bg-surface-2/80 px-4 py-3 text-xs leading-5 text-muted">
          <b className="text-foreground">Демо:</b> төлбөр бодитоор авахгүй — сайт дээр “төлсөн гэж үзэх” товчоор дуурайна.
          Жинхэнэ систем QPay-ээр урьдчилгаа авах боломжтой (QPay merchant данс, тохиргоо шаардлагатай).
        </p>
      </section>
    </div>
  );
}
