import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "generated/**",
  ]),
  {
    rules: {
      // These are noisy but don't affect correctness — TypeScript handles the real type safety
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-object-type": "off",

      // Next.js image rule — we use <img> intentionally in some places (e.g. user-uploaded content)
      "@next/next/no-img-element": "off",

      // React hooks — exhaustive-deps produces false positives with stable refs
      "react-hooks/exhaustive-deps": "warn",

      // These are stylistic, not bugs
      "prefer-const": "warn",
      "no-console": "off",
    },
  },
]);

export default eslintConfig;
