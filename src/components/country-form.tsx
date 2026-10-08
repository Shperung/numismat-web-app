"use client";

import { startTransition, useActionState } from "react";
import { addCountry } from "@/lib/admin-actions";
import styles from "./admin-form.module.css";

export function CountryForm() {
  const [state, action, pending] = useActionState(addCountry, null);

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
      <h1 className={styles.title}>Нова країна</h1>
      <div className={styles.row}>
        <label className={styles.field}>
          Код
          <input
            name="id"
            required
            pattern="[a-zA-Z]{2,3}"
            maxLength={3}
            placeholder="ua"
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          Прапор
          <input name="flag" required placeholder="🇺🇦" className={styles.input} />
        </label>
      </div>
      <label className={styles.field}>
        Назва українською
        <input name="name_ua" required placeholder="Україна" className={styles.input} />
      </label>
      <label className={styles.field}>
        Назва англійською
        <input name="name_en" required placeholder="Ukraine" className={styles.input} />
      </label>

      {state?.error && <p className={styles.error}>{state.error}</p>}
      {state?.success && <p className={styles.success}>{state.success}</p>}
      <button disabled={pending} className={styles.button}>
        {pending ? "Збереження..." : "Додати країну"}
      </button>
    </form>
  );
}
