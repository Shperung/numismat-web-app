"use client";

import { useActionState } from "react";
import { login } from "@/lib/admin-actions";
import styles from "./admin-form.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className={`card ${styles.form}`}>
      <h1 className={styles.title}>Вхід в адмінку</h1>
      <label className={styles.field}>
        Email
        <input name="email" type="email" required autoComplete="username" className={styles.input} />
      </label>
      <label className={styles.field}>
        Пароль
        <input name="password" type="password" required autoComplete="current-password" className={styles.input} />
      </label>
      {state?.error && <p className={styles.error}>{state.error}</p>}
      <button disabled={pending} className={styles.button}>
        {pending ? "Вхід..." : "Увійти"}
      </button>
    </form>
  );
}
