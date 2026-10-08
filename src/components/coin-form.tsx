"use client";

import { startTransition, useActionState, useState } from "react";
import { addCoin } from "@/lib/admin-actions";
import type { Country } from "@/types/country";
import styles from "./admin-form.module.css";

export function CoinForm({ countries }: { countries: Country[] }) {
  const [state, action, pending] = useActionState(addCoin, null);

  return (
    <form
      // onSubmit замість action={...}: form action після завершення скидає поля (і вибрані фото) навіть при помилці
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className={`card ${styles.form}`}
    >
      <h1 className={styles.title}>Нова монета</h1>

      <div className={styles.photos}>
        <PhotoInput name="avers" label="Аверс" />
        <PhotoInput name="revers" label="Реверс" />
      </div>

      <label className={styles.field}>
        Назва
        <input name="name" required className={styles.input} />
      </label>
      <label className={styles.field}>
        Країна
        <select name="country" required className={styles.input}>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {`${c.flag} ${c.name_ua}`}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.row}>
        <label className={styles.field}>
          Номінал
          <input name="value" type="number" min="0" step="any" required className={styles.input} />
        </label>
        <label className={styles.field}>
          Валюта
          <input name="currency" required placeholder="cent, копійка..." className={styles.input} />
        </label>
        <label className={styles.field}>
          Рік
          <input name="year" type="number" min="1" step="1" required className={styles.input} />
        </label>
      </div>
      <label className={styles.field}>
        Опис
        <textarea name="info" rows={4} className={styles.input} />
      </label>

      {state && <p className={styles.error}>{state.error}</p>}
      <button disabled={pending} className={styles.button}>
        {pending ? "Збереження..." : "Додати монету"}
      </button>
    </form>
  );
}

function PhotoInput({ name, label }: { name: string; label: string }) {
  const [preview, setPreview] = useState<string>();

  return (
    <label className={styles.photo}>
      <span
        className={styles.preview}
        style={preview ? { backgroundImage: `url(${preview})` } : undefined}
      >
        {!preview && "+"}
      </span>
      {label}
      <input
        name={name}
        type="file"
        accept="image/*"
        required
        className={styles.fileInput}
        onChange={(e) => {
          if (preview) URL.revokeObjectURL(preview);
          const file = e.target.files?.[0];
          setPreview(file && URL.createObjectURL(file));
        }}
      />
    </label>
  );
}
