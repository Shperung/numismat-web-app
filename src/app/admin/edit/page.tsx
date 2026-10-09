import Link from "next/link";
import { Suspense } from "react";
import styles from "@/components/admin-form.module.css";
import { CoinList } from "@/components/coin-list";
import { requireSession } from "@/lib/admin";

export const metadata = { title: "Редагування", robots: { index: false } };

export default function EditListPage({ searchParams }: PageProps<"/admin/edit">) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Link href="/admin" className={styles.back}>
        ← Адмінка
      </Link>
      <Suspense fallback={<p>Завантаження...</p>}>
        <EditList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function EditList({ searchParams }: Pick<PageProps<"/admin/edit">, "searchParams">) {
  await requireSession();
  return <CoinList searchParams={searchParams} path="/admin/edit" coinHref="/admin/edit/" />;
}
