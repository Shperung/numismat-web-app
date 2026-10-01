import type { Metadata } from "next";
import { NavTabs } from "@/components/nav-tabs";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Numismat", template: "%s · Numismat" },
  description: "Персональна колекція монет",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <NavTabs />
        <main>{children}</main>
      </body>
    </html>
  );
}
