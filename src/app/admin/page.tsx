import { Suspense } from "react";
import { AdminForms } from "@/components/admin-forms";
import styles from "@/components/admin-form.module.css";
import { requireSession } from "@/lib/admin";
import { logout } from "@/lib/admin-actions";
import { getCountries } from "@/lib/data";

export const metadata = { title: "Адмінка", robots: { index: false } };

export default function AdminPage() {
  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <Admin />
    </Suspense>
  );
}

async function Admin() {
  await requireSession();
  const countries = await getCountries();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <form action={logout} style={{ display: "flex" }}>
        <button className={styles.link}>Вийти</button>
      </form>
      <AdminForms countries={countries} />
    </div>
  );
}
