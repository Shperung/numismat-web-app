import { connection } from "next/server";
import { Suspense } from "react";
import { CoinDetails } from "@/components/coin-details";
import { getCoinsByCountry, getCountries } from "@/lib/data";
import { pickRandom } from "@/lib/pick-random";

export default function Home() {
  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <RandomCoin />
    </Suspense>
  );
}

async function RandomCoin() {
  await connection();
  const country = pickRandom(await getCountries());
  const coin = country && pickRandom(await getCoinsByCountry(country.id));

  return coin ? <CoinDetails coin={coin} /> : <p>Монет не знайдено</p>;
}
