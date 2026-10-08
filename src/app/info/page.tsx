import Link from "next/link";

export const metadata = { title: "Інфо" };

export default function InfoPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>Інфо</h1>
      <Link href="/admin">Адмінка</Link>
    </div>
  );
}
