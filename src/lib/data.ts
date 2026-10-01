import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore/lite";
import { cacheLife } from "next/cache";
import type { Coin } from "@/types/coin";
import type { Country } from "@/types/country";
import { db } from "./firebase";

export async function getCountries() {
  "use cache";
  cacheLife("minutes");
  const snapshot = await getDocs(collection(db, "countries"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Country);
}

export async function getCountry(id: string) {
  return (await getCountries()).find((c) => c.id === id);
}

export async function getCoinsByCountry(country: string) {
  "use cache";
  cacheLife("minutes");
  const snapshot = await getDocs(query(collection(db, "coins"), where("country", "==", country)));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Coin);
}

export async function getCoin(id: string) {
  "use cache";
  cacheLife("minutes");
  const snapshot = await getDoc(doc(db, "coins", id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Coin) : null;
}
