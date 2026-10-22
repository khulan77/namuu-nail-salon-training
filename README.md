# Namuu NAIL Salon & Nail Training — client demo

A personalised sales demo for Namuu NAIL. It is built from the existing salon
booking system (`salon/`, a separate repo that is never modified here).

## Run locally

```bash
bun install
bun run dev            # http://localhost:3000
# or a production build:
bun run build && bun run start
```

No environment variables or database are needed.

| Route | What it is |
|---|---|
| `/` | Homepage |
| `/services` | Services, durations and example prices |
| `/portfolio` | Nail-art gallery (real photos from @namuu_nailart) |
| `/training` | Training courses and enquiry form |
| `/book` | Online booking flow |
| `/demo/admin` | Salon admin demo (dashboard, calendar, bookings, customers, training enquiries, services, staff) |
| `/demo` | Presenter guide: walkthrough, and what is real vs. simulated |

## How the demo works

- **No backend.** Bookings and enquiries are stored in the browser's
  `localStorage` (`app/demo/demo-store.ts`). `/book` and `/demo/admin` share it,
  so a booking made on the site appears in the admin in the same browser, live
  if the admin is open in another tab.
- **Slot availability** follows the real system's rules: opening hours, the
  30-minute slot step, service duration, overlap with a master's other
  bookings, and no past times today. Before saving, the slot is checked again.
- **No SMS, email or payment** is sent or taken. Every page says so.
- Admin → "Демо шинэчлэх" resets the demo data.
- **Revenue** (owner only): today, the last 7 days, or this month. Each figure
  is compared with the previous period; for "today" it is compared with the
  same weekday last week up to the same time. Breakdowns by service and by
  master. Revenue counts completed bookings only.
- **Deposit** (Admin → Тохиргоо, on by default at 20,000₮): `/book` gains a
  deposit step, and a booking whose deposit is "paid" is confirmed straight
  away, as in the real system. The payment is simulated and QPay is not
  connected.
- **Roles**: switch with the "Нэвтэрсэн (демо)" picker. The owner/admin sees
  everything; reception sees no revenue or settings; a master sees only their
  own bookings and attendance. Switching is a demo control, not real sign-in.
- **Attendance**: arrived / late / absent / on leave, with automatic check-in
  time, a warning when an absent master has bookings, and a monthly summary.
  Earlier days are sample history.
- The real system (`app/_live`) has admin and master roles and QPay deposits.
  The **reception role and attendance are new and demo-only**; adding them for
  real needs database tables and server-side permission checks.

## Replacing placeholder content

| What | Where |
|---|---|
| Phone, address, Instagram, logo | `app/lib/namuu/brand.ts` (phone and Instagram come from Namuu's own posts; logo is `public/brand/namuu-logo.png`) |
| Services, prices, staff, opening hours | `app/lib/namuu/catalog.ts` (set `PRICES_CONFIRMED` / `STAFF_CONFIRMED` to `true` to remove the "example" tags) |
| Portfolio photos | `public/portfolio/` + `src` in `app/lib/namuu/portfolio.ts`. The source Instagram screenshots are in `design/instagram-source/`, kept out of `public/` |
| Training courses | `app/lib/namuu/training.ts` |
| Brand colours | the `:root` block in `app/globals.css` |

## The real (database-backed) system

`app/_live/` holds the original Supabase-backed public site, admin, staff
portal, login, email confirm links and QPay callback, **unchanged**. A private
`_` folder is not routed, so none of it runs in the demo, but it is still
type-checked. To go live for real:

1. Create a **new, empty** Supabase project for Namuu. Never reuse another
   salon's project or keys.
2. Run `supabase/schema.sql` and then `supabase/migrations/001…009` on it.
3. Put `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SECRET_KEY`, `ADMIN_EMAILS`, `BOOKING_ACTION_SECRET` and
   `NEXT_PUBLIC_SITE_URL` in `.env.local`. Leave `RESEND_*` and `QPAY_*` unset
   until they are actually wanted.
4. Seed it with Namuu data (adapt `scripts/setup.ts`, which currently seeds
   hair-salon data), then move the routes out of `app/_live/` back into `app/`.
