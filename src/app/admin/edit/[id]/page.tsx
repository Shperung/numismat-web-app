import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminForms } from "@/components/admin-forms";
import styles from "@/components/admin-form.module.css";
import { requireSession } from "@/lib/admin";
import { getCoin, getCountries } from "@/lib/data";

export const metadata = { title: "Редагування монети", robots: { index: false } };

export default function EditCoinPage({ params }: PageProps<"/admin/edit/[id]">) {
  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <EditCoin params={params} />
    </Suspense>
  );
}

async function EditCoin({ params }: Pick<PageProps<"/admin/edit/[id]">, "params">) {
  await requireSession();
  const { id } = await params;
  const [coin, countries] = await Promise.all([getCoin(id), getCountries()]);
  if (!coin) notFound();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Link href={`/admin/edit?country=${coin.country}`} className={styles.back}>
        ← До списку
      </Link>
      <AdminForms countries={countries} coin={coin} />
    </div>
  );
}
