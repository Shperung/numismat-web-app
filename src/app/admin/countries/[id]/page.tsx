import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import styles from "@/components/admin-form.module.css";
import { CountryForm } from "@/components/country-form";
import { requireSession } from "@/lib/admin";
import { getCountry } from "@/lib/data";

export const metadata = { title: "Редагування країни", robots: { index: false } };

export default function EditCountryPage({ params }: PageProps<"/admin/countries/[id]">) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Link href="/admin/countries" className={styles.back}>
        ← До країн
      </Link>
      <Suspense fallback={<p>Завантаження...</p>}>
        <EditCountry params={params} />
      </Suspense>
    </div>
  );
}

async function EditCountry({ params }: Pick<PageProps<"/admin/countries/[id]">, "params">) {
  await requireSession();
  const country = await getCountry((await params).id);
  if (!country) notFound();

  return <CountryForm editing={country} />;
}
