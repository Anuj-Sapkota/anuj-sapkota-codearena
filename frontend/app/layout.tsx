import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";

export const metadata: Metadata = {
  title: "CodeArena - Learn and Grow",
  description: "Problem Solving and Learning",
  keywords:
    "coding challenges, competitive programming, online judge, algorithm practice, code submission, problem solving platform, real-time coding, programming contests, online compiler, user dashboard, progress tracking, leaderboard, Node.js, Next.js, React, Express.js, PostgreSQL, Tailwind CSS, responsive web app, code evaluation, challenge categories, programming education",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
<StoreProvider>{children}</StoreProvider>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          defer
        ></script>
      </body>
    </html>
  );
}
