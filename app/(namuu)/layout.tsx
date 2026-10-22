import DemoRibbon from "@/app/components/namuu/demo-ribbon";
import SiteFooter from "@/app/components/namuu/site-footer";
import SiteHeader from "@/app/components/namuu/site-header";

/*
  Namuu NAIL-ийн нийтийн сайт. Өгөгдлийн сан ашигладаггүй — бүх агуулга
  `app/lib/namuu/*`-аас, захиалга нь хөтчийн демо сангаас (`app/demo/demo-store.ts`).
*/
export default function NamuuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
      >
        Үндсэн агуулга руу шилжих
      </a>
      <DemoRibbon />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
