import { cacheLife } from "next/cache";
import type { Coin } from "@/types/coin";

const API_URL = "https://inua.tetiana-redko.com";

type Message = { role: "user" | "assistant"; content: string };

export type Provider = { id: string; title: string; logo: string };

export async function getProviders() {
  "use cache";
  cacheLife("hours");
  const res = await fetch(`${API_URL}/providers`);
  if (!res.ok) throw new Error(`${res.status}`);
  return (await res.json()) as Provider[];
}

export async function askServer(provider: string, coin: Coin, messages: Message[]) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, coin, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${data.error}`);
  return data.text as string;
}
