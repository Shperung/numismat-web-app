"use client";

import { startTransition, useActionState } from "react";
import { saveCountry } from "@/lib/admin-actions";
import type { Country } from "@/types/country";
import styles from "./admin-form.module.css";

export function CountryForm({ draft, editing }: { draft?: Country; editing?: Country }) {
  const [state, action, pending] = useActionState(saveCountry.bind(null, editing?.id ?? null), null);
  const country = editing ?? draft;

  return (
    <form
      key={state?.success}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className={`card ${styles.form}`}
    >
      <h1 className={styles.title}>{editing ? "Редагування країни" : "Нова країна"}</h1>
      <div className={styles.row}>
        <label className={styles.field}>
          Код
          <input
            name="id"
            required
            pattern="[a-zA-Z]{2,3}"
            maxLength={3}
            placeholder="ua"
            defaultValue={country?.id}
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          Прапор
          <input name="flag" required placeholder="🇺🇦" defaultValue={country?.flag} className={styles.input} />
        </label>
      </div>
      {editing && <p className={styles.hint}>Зміна коду оновить поле країни в усіх її монетах</p>}
      <label className={styles.field}>
        Назва українською
        <input name="name_ua" required placeholder="Україна" defaultValue={country?.name_ua} className={styles.input} />
      </label>
      <label className={styles.field}>
        Назва англійською
        <input name="name_en" required placeholder="Ukraine" defaultValue={country?.name_en} className={styles.input} />
      </label>

      {state?.error && <p className={styles.error}>{state.error}</p>}
      {state?.success && <p className={styles.success}>{state.success}</p>}
      <button disabled={pending} className={styles.button}>
        {pending ? "Збереження..." : editing ? "Зберегти країну" : "Додати країну"}
      </button>
    </form>
  );
}
