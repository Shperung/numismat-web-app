"use server";

import type { ReactNode } from "react";
import Markdown from "react-markdown";
import { getCoin } from "./data";
import { askGemini } from "./ai";
import { askServer } from "./numismat-server";

const QUESTION = "Розкажи цікаві факти про цю монету";

export type AiResult = { answer: ReactNode } | { error: string };

export type AiState = { attempt: number; result: Promise<AiResult> } | null;

export async function askAi(provider: string, coinId: string, prev: AiState): Promise<AiState> {
  return { attempt: (prev?.attempt ?? 0) + 1, result: ask(provider, coinId) };
}

async function ask(provider: string, coinId: string): Promise<AiResult> {
  try {
    const coin = await getCoin(coinId);
    if (!coin) return { error: "Монету не знайдено" };
    const text =
      provider === "gemini"
        ? await askGemini(coin, QUESTION)
        : await askServer(provider, coin, [{ role: "user", content: QUESTION }]);
    return { answer: <Markdown>{text}</Markdown> };
  } catch (e) {
    return { error: String(e) };
  }
}
