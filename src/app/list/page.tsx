import { Suspense } from "react";
import { CoinList } from "@/components/coin-list";

export const metadata = { title: "Список" };

export default function ListPage({ searchParams }: PageProps<"/list">) {
  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <CoinList searchParams={searchParams} path="/list" coinHref="/coin/" />
    </Suspense>
  );
}
