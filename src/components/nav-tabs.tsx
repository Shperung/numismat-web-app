"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, use } from "react";
import styles from "./nav-tabs.module.css";

const tabs = [
  { href: "/", title: "Головна" },
  { href: "/list", title: "Список" },
];

export function NavTabs({ session }: { session: Promise<boolean> }) {
  return (
    <Suspense fallback={<Tabs />}>
      <ActiveTabs session={session} />
    </Suspense>
  );
}

function ActiveTabs({ session }: { session: Promise<boolean> }) {
  const admin = use(session);
  const authTab = admin ? { href: "/admin", title: "Адмінка" } : { href: "/admin/login", title: "Увійти" };
  return <Tabs pathname={usePathname()} items={[...tabs, authTab]} />;
}

function Tabs({ pathname, items = tabs }: { pathname?: string; items?: typeof tabs }) {
  return (
    <nav className={styles.nav}>
      {items.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={
            pathname === tab.href || (tab.href !== "/" && pathname?.startsWith(`${tab.href}/`))
              ? styles.active
              : styles.tab
          }
        >
          {tab.title}
        </Link>
      ))}
    </nav>
  );
}
