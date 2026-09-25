import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aegis · Autonomous Financial Defense",
  description:
    "Autonomous financial defense for high-volume merchants. Investigates billing disputes against real PayPal sandbox transactions using Swytchcode execution guardrails.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050506] text-[#EDEDEF] antialiased selection:bg-[#5E6AD2]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
