import type { Metadata, Viewport } from "next";
import { Inter, Prata } from "next/font/google";
import { brand, SITE_URL } from "@/app/lib/namuu/brand";
import "./globals.css";

/*
  Google Fonts. Гарчиг — Prata: эх салоны Playfair Display-тэй ижил Didone
  хэв маяг, гэхдээ Монгол Ө, Ү үсгийг (cyrillic-ext) бүрэн агуулдаг —
  Playfair-д эдгээр байхгүй тул өөр фонт холилддог. Үндсэн текст — Inter
  (эх салонтой ижил). Ө, Ү нь `cyrillic-ext`-д байдаг тул заавал ачаална.
*/
const display = Prata({
  variable: "--font-display",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

/**
 * Демо хувилбар өгөгдлийн сан ашигладаггүй тул metadata тогтмол. Хайлтын
 * системд индексжүүлэхгүй — клиент батлахаас өмнө нийтэд гарах ёсгүй.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${brand.fullName}`, template: `%s — ${brand.name}` },
  description: brand.description,
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: brand.fullName,
    title: brand.fullName,
    description: brand.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf6f5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={`${display.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
