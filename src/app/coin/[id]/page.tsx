import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CoinDetails } from "@/components/coin-details";
import { getCoin } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/coin/[id]">) {
  const coin = await getCoin((await params).id);
  return { title: coin?.name ?? "Монета" };
}

export default function CoinPage({ params }: PageProps<"/coin/[id]">) {
  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <CoinContent params={params} />
    </Suspense>
  );
}

async function CoinContent({ params }: Pick<PageProps<"/coin/[id]">, "params">) {
  const coin = await getCoin((await params).id);
  if (!coin) notFound();

  return <CoinDetails coin={coin} />;
}
