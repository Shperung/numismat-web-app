import Image from "next/image";
import type { IconType } from "react-icons";
import { IoCalendarOutline, IoCashOutline, IoDocumentTextOutline, IoSparklesOutline } from "react-icons/io5";
import { getCountry } from "@/lib/data";
import { getProviders } from "@/lib/numismat-server";
import { AiAccordion } from "./ai-accordion";
import type { Coin } from "@/types/coin";
import styles from "./coin-details.module.css";

const sides = [
  { key: "avers", label: "Аверс" },
  { key: "revers", label: "Реверс" },
] as const;

export async function CoinDetails({ coin }: { coin: Coin }) {
  const country = await getCountry(coin.country);

  return (
    <div className={styles.container}>
      <section className={`card ${styles.hero}`}>
        <div className={styles.photos}>
          {sides.map(({ key, label }) => (
            <figure key={key} className={styles.side}>
              {coin[key] ? (
                <Image src={coin[key]} alt={label} width={130} height={130} className={styles.photo} />
              ) : (
                <div className={styles.photo} />
              )}
              <figcaption className={styles.caption}>{label}</figcaption>
            </figure>
          ))}
        </div>
        <h1 className={styles.name}>{coin.name}</h1>
        <span className={styles.countryPill}>{country ? `${country.flag}  ${country.name_ua}` : coin.country}</span>
      </section>

      <div className={styles.stats}>
        <Stat icon={IoCashOutline} label="Номінал" value={`${coin.value} ${coin.currency}`} />
        <Stat icon={IoCalendarOutline} label="Рік" value={String(coin.year)} />
      </div>

      {coin.info && (
        <section className={`card ${styles.section}`}>
          <h2 className={styles.sectionTitle}>
            <IoDocumentTextOutline size={18} color="var(--accent)" />
            Опис
          </h2>
          <p className={styles.body}>{coin.info}</p>
        </section>
      )}

      <h2 className={styles.sectionTitle}>
        <IoSparklesOutline size={18} color="var(--accent)" />
        Цікаві факти від AI
      </h2>
      <AiButtons coinId={coin.id} />
    </div>
  );
}

async function AiButtons({ coinId }: { coinId: string }) {
  const providers = await getProviders().catch((e) => String(e));

  return (
    <div className={styles.aiButtons}>
      <AiAccordion provider="gemini" title="Запитати в Gemini про монету" logo="/ai/gemini.png" coinId={coinId} />
      {typeof providers === "string" ? (
        <p className={styles.error}>Помилка завантаження моделей: {providers}</p>
      ) : (
        providers.map((p) => (
          <AiAccordion key={p.id} provider={p.id} title={`Запитати в ${p.title} про монету`} logo={p.logo} coinId={coinId} />
        ))
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className={`card ${styles.stat}`}>
      <span className={styles.statIcon}>
        <Icon size={18} color="var(--accent)" />
      </span>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
      </div>
    </div>
  );
}
