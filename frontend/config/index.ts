const config = {
  appName: "CodeArena",
  // Fallback to empty string so the build doesn't crash — set the real URL in Vercel env vars
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",
  turnstile: {
    siteKey: process.env.NEXT_PUBLIC_SITE_KEY || "",
  },
} as const;

export default config;
