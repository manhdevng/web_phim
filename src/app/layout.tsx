import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "PhimHayViet - Classic Cinema",
  description:
    "A curated streaming platform dedicated to classic and world cinema. Experience timeless films in stunning quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
      <body
        suppressHydrationWarning
        className="antialiased bg-brick text-stone-300 selection:bg-rose-950 selection:text-amber-200"
        style={{
          backgroundImage:
            "radial-gradient(circle at top, rgba(255, 200, 100, 0.2), rgba(0, 0, 0, 0.85)), url('/img/brick.jpg')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {children}
      </body>
    </html>
  );
}
