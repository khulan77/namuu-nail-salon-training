import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel-ийн зураг оновчлох (/_next/image) квот дууссан тул 402 буцааж,
    // deploy дээр зураг харагдахгүй байсан. Зургууд аль хэдийн жижигрүүлсэн
    // (≤1000px, ~130KB) тул шууд `public/`-ээс үзүүлнэ.
    unoptimized: true,
  },
};

export default nextConfig;
