"use client";

import Image from "next/image";
import { Suspense, startTransition, use, useActionState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { askAi, type AiResult } from "@/lib/ai-actions";
import styles from "./ai-accordion.module.css";

type Props = { provider: string; title: string; logo: string; coinId: string };

export function AiAccordion({ provider, title, logo, coinId }: Props) {
  const [state, ask] = useActionState(askAi.bind(null, provider, coinId), null);
  const retry = () => startTransition(ask);

  return (
    <details
      className={`card ${styles.item}`}
      onToggle={(e) => {
        if (e.currentTarget.open && !state) retry();
      }}
    >
      <summary className={styles.summary}>
        <Image src={logo} alt="" width={28} height={28} className={styles.logo} unoptimized />
        <span className={styles.title}>{title}</span>
        <IoChevronDown size={20} className={styles.chevron} />
      </summary>
      {state && (
        <Suspense key={state.attempt} fallback={<div className={styles.spinner} />}>
          <Answer result={state.result} retry={retry} />
        </Suspense>
      )}
    </details>
  );
}

function Answer({ result, retry }: { result: Promise<AiResult>; retry: () => void }) {
  const value = use(result);

  if ("error" in value) {
    return (
      <div className={`${styles.answer} ${styles.error}`}>
        <p>Помилка: {value.error}</p>
        <button onClick={retry}>Спробувати ще</button>
      </div>
    );
  }

  return <div className={styles.answer}>{value.answer}</div>;
}
