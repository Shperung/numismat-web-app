import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Numismat",
  description: "Персональна колекція монет",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
