import type { Metadata } from "next";
import "./globals.css";
import "./consultation.css";

export const metadata: Metadata = {
  title: "AIwithBishal | AI Powered Digital Marketing",
  description: "AI-powered marketing systems built to help ambitious businesses attract, convert, and grow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
