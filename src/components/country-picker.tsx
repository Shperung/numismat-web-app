"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import type { Country } from "@/types/country";

export function CountryPicker({ countries, selected }: { countries: Country[]; selected: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [country, setCountry] = useOptimistic(selected);

  return (
    <select
      value={country}
      onChange={(e) => {
        const id = e.target.value;
        startTransition(() => {
          setCountry(id);
          router.replace(`/list?country=${id}`);
        });
      }}
      className="card"
      style={{ padding: 12, fontSize: 16, opacity: isPending ? 0.6 : 1 }}
    >
      {countries.map((c) => (
        <option key={c.id} value={c.id}>
          {`${c.flag} ${c.name_ua}`}
        </option>
      ))}
    </select>
  );
}
