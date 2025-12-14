import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeArena",
  description: "Problem Solving and Learning",
  keywords: "coding challenges, competitive programming, online judge, algorithm practice, code submission, problem solving platform, real-time coding, programming contests, online compiler, user dashboard, progress tracking, leaderboard, Node.js, Next.js, React, Express.js, PostgreSQL, Tailwind CSS, responsive web app, code evaluation, challenge categories, programming education"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
