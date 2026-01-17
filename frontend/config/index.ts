const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!, //backend api url
  turnstile: {
    siteKey: process.env.NEXT_PUBLIC_SITE_KEY!, //turnstile site key
  },
};

export default config;
