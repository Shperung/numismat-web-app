import { Suspense } from "react";
import { CoinCard } from "@/components/coin-card";
import { CountryPicker } from "@/components/country-picker";
import { getCoinsByCountry, getCountries } from "@/lib/data";
import { pickRandom } from "@/lib/pick-random";

export const metadata = { title: "Список" };

export default function ListPage({ searchParams }: PageProps<"/list">) {
  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <CoinList searchParams={searchParams} />
    </Suspense>
  );
}

async function CoinList({ searchParams }: Pick<PageProps<"/list">, "searchParams">) {
  const { country: param } = await searchParams;
  const countries = await getCountries();
  const country = countries.find((c) => c.id === param) ?? pickRandom(countries);
  if (!country) return <p>Країн не знайдено</p>;

  const coins = await getCoinsByCountry(country.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <CountryPicker countries={countries} selected={country.id} />
      {coins.map((coin) => (
        <CoinCard key={coin.id} coin={coin} country={country} />
      ))}
      {coins.length === 0 && <p>Монет цієї країни немає</p>}
    </div>
  );
}
