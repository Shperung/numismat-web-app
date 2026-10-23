import Link from "next/link";
import { Suspense } from "react";
import styles from "@/components/admin-form.module.css";
import { requireSession } from "@/lib/admin";
import { getCountries } from "@/lib/data";

export const metadata = { title: "Країни", robots: { index: false } };

export default function CountriesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Link href="/admin" className={styles.back}>
        ← Адмінка
      </Link>
      <Suspense fallback={<p>Завантаження...</p>}>
        <Countries />
      </Suspense>
    </div>
  );
}

async function Countries() {
  await requireSession();
  const countries = (await getCountries()).toSorted((a, b) => a.name_ua.localeCompare(b.name_ua, "uk"));

  return (
    <div className={`card ${styles.form}`}>
      <h1 className={styles.title}>Країни</h1>
      {countries.map((c) => (
        <Link key={c.id} href={`/admin/countries/${c.id}`} className={styles.back}>
          {`${c.flag} ${c.name_ua} · ${c.id}`}
        </Link>
      ))}
    </div>
  );
}
