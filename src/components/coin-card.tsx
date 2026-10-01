import Image from "next/image";
import Link from "next/link";
import { IoCalendarOutline, IoCashOutline, IoChevronForward } from "react-icons/io5";
import type { Coin } from "@/types/coin";
import type { Country } from "@/types/country";
import styles from "./coin-card.module.css";

export function CoinCard({ coin, country }: { coin: Coin; country?: Country }) {
  return (
    <Link href={`/coin/${coin.id}`} className={`card ${styles.card}`}>
      <div className={styles.photos}>
        {coin.avers && <Image src={coin.avers} alt="Аверс" width={56} height={56} className={styles.photo} />}
        {coin.revers && (
          <Image src={coin.revers} alt="Реверс" width={56} height={56} className={`${styles.photo} ${styles.photoBack}`} />
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.name}>{coin.name}</p>
        <p className={styles.meta}>
          <IoCashOutline color="var(--accent)" />
          <span>
            {coin.value} {coin.currency}
          </span>
          <IoCalendarOutline color="var(--accent)" />
          <span>{coin.year}</span>
        </p>
        <p className={styles.country}>{country ? `${country.flag}  ${country.name_ua}` : coin.country}</p>
      </div>
      <IoChevronForward size={20} color="var(--muted)" />
    </Link>
  );
}
