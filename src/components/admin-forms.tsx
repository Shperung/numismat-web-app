"use client";

import { useActionState } from "react";
import { describeCoin } from "@/lib/admin-actions";
import type { Coin } from "@/types/coin";
import type { Country } from "@/types/country";
import { CoinForm } from "./coin-form";
import { CountryForm } from "./country-form";

export function AdminForms({ countries, coin }: { countries: Country[]; coin?: Coin }) {
  const [described, describe, describing] = useActionState(describeCoin.bind(null, coin?.id ?? null), { attempt: 0 });
  const draftCountry = described.draft?.newCountry;
  const newCountry = countries.some((c) => c.id === draftCountry?.id) ? undefined : draftCountry;

  return (
    <>
      <CoinForm
        countries={newCountry ? [...countries, newCountry] : countries}
        editing={coin}
        newCountry={newCountry}
        described={described}
        describe={describe}
        describing={describing}
      />
      <CountryForm key={described.attempt} draft={newCountry} />
    </>
  );
}
