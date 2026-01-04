const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    turnstile: 
    {
        siteKey: process.env.NEXT_PUBLIC_SITE_KEY || "",
    }
}

export default config;