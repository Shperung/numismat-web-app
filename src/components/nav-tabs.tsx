"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./nav-tabs.module.css";

const tabs = [
  { href: "/", title: "Головна" },
  { href: "/list", title: "Список" },
  { href: "/info", title: "Інфо" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={pathname === tab.href ? styles.active : styles.tab}
        >
          {tab.title}
        </Link>
      ))}
    </nav>
  );
}
