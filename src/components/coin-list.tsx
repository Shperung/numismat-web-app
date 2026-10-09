import { CoinCard } from "@/components/coin-card";
import { CountryPicker } from "@/components/country-picker";
import { getCoinsByCountry, getCountries } from "@/lib/data";
import { pickRandom } from "@/lib/pick-random";

type Props = {
  searchParams: Promise<{ country?: string | string[] }>;
  path: string;
  coinHref: string;
};

export async function CoinList({ searchParams, path, coinHref }: Props) {
  const { country: param } = await searchParams;
  const countries = await getCountries();
  const country = countries.find((c) => c.id === param) ?? pickRandom(countries);
  if (!country) return <p>Країн не знайдено</p>;

  const coins = await getCoinsByCountry(country.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <CountryPicker countries={countries} selected={country.id} path={path} />
      {coins.map((coin) => (
        <CoinCard key={coin.id} coin={coin} country={country} href={`${coinHref}${coin.id}`} />
      ))}
      {coins.length === 0 && <p>Монет цієї країни немає</p>}
    </div>
  );
}
