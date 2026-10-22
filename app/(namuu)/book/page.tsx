import { serviceById } from "@/app/lib/namuu/catalog";
import BookingDemo from "./booking-demo";

export const metadata = { title: "Цаг захиалах" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const initialServiceId = service && serviceById(service) ? service : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:pb-24 sm:pt-16">
      <p className="eyebrow">Онлайн захиалга</p>
      <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
        Цаг захиалах
      </h1>
      <BookingDemo initialServiceId={initialServiceId} />
    </div>
  );
}
