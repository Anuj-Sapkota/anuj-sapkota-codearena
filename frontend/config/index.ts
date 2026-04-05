const config = {
  appName: "CodeArena",
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  turnstile: {
    siteKey: process.env.NEXT_PUBLIC_SITE_KEY!,
  },
} as const;

export default config;
