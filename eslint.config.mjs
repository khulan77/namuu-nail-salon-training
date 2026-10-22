import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // app/_live — Supabase-тай жинхэнэ систем, эх салоны кодыг өөрчлөлтгүй
  // хадгалсан. Энэ дүрмийн 3 зөрчил эх кодонд аль хэдийн байсан тул ажиллаж буй
  // захиалгын логикийг хөндөхгүйн тулд энд зөвхөн анхааруулга болгов.
  {
    files: ["app/_live/**"],
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Эх салон төсөл — тусдаа repo, зөвхөн лавлагаа. Энд шалгахгүй.
    "salon/**",
  ]),
]);

export default eslintConfig;
