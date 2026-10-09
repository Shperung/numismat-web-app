"use client";

import { Fragment, startTransition, useActionState, useRef, useState, useTransition } from "react";
import { type DescribeState, enhancePhoto, saveCoin } from "@/lib/admin-actions";
import type { Coin } from "@/types/coin";
import type { Country } from "@/types/country";
import styles from "./admin-form.module.css";

type Props = {
  countries: Country[];
  editing?: Coin;
  newCountry?: Country;
  described: DescribeState;
  describe: (formData: FormData) => void;
  describing: boolean;
};

export function CoinForm({ countries, editing, newCountry, described, describe, describing }: Props) {
  const [state, action, pending] = useActionState(saveCoin.bind(null, editing?.id ?? null), null);
  const [photos, setPhotos] = useState<Record<string, boolean>>({});
  const coin = described.draft?.coin ?? editing;

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
      <h1 className={styles.title}>{editing ? "Редагування монети" : "Нова монета"}</h1>

      <div className={styles.photos}>
        {(["avers", "revers"] as const).map((name) => (
          <PhotoInput
            key={name}
            name={name}
            label={name === "avers" ? "Аверс" : "Реверс"}
            initial={editing?.[name]}
            coinId={editing?.id}
            onSelect={(selected) => setPhotos((p) => ({ ...p, [name]: selected }))}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={
          !(photos.avers || editing?.avers) || !(photos.revers || editing?.revers) || describing || pending
        }
        className={styles.secondary}
        onClick={(e) => {
          const formData = new FormData(e.currentTarget.form!);
          startTransition(() => describe(formData));
        }}
      >
        {describing ? "Gemini аналізує фото..." : "✨ Згенерувати опис монети з допомогою Gemini"}
      </button>
      {described.error && <p className={styles.error}>{described.error}</p>}
      {newCountry && (
        <p className={styles.hint}>
          Країни {newCountry.flag} {newCountry.name_ua} немає в базі — спершу збережіть її у формі нижче
        </p>
      )}

      <Fragment key={described.attempt}>
        <label className={styles.field}>
          Назва
          <input name="name" required defaultValue={coin?.name} className={styles.input} />
        </label>
        <label className={styles.field}>
          Країна
          <select name="country" required defaultValue={coin?.country} className={styles.input}>
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
            <input
              name="value"
              type="number"
              min="0"
              step="any"
              required
              defaultValue={coin?.value}
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            Валюта
            <input
              name="currency"
              required
              placeholder="cent, копійка..."
              defaultValue={coin?.currency}
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            Рік
            <input
              name="year"
              type="number"
              min="1"
              step="1"
              required
              defaultValue={coin?.year}
              className={styles.input}
            />
          </label>
        </div>
        <label className={styles.field}>
          Опис
          <textarea name="info" rows={4} defaultValue={coin?.info} className={styles.input} />
        </label>
      </Fragment>

      {state?.error && <p className={styles.error}>{state.error}</p>}
      <button disabled={pending || describing} className={styles.button}>
        {pending ? "Збереження..." : editing ? "Зберегти зміни" : "Додати монету"}
      </button>
    </form>
  );
}

type PhotoInputProps = {
  name: "avers" | "revers";
  label: string;
  initial?: string;
  coinId?: string;
  onSelect: (selected: boolean) => void;
};

function PhotoInput({ name, label, initial, coinId, onSelect }: PhotoInputProps) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(initial);
  // не undefined → показано покращене фото, а тут те, що було до покращення (file: undefined — збережене фото)
  const [original, setOriginal] = useState<{ file?: File }>();
  const [error, setError] = useState<string>();
  const [enhancing, startEnhancing] = useTransition();

  function show(file?: File) {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : initial);
    onSelect(!!file);
  }

  function put(file?: File) {
    const transfer = new DataTransfer();
    if (file) transfer.items.add(file);
    input.current!.files = transfer.files;
    show(file);
  }

  function enhance() {
    const current = input.current!.files?.[0];
    const formData = new FormData();
    if (current) formData.set("photo", current);
    setError(undefined);
    startEnhancing(async () => {
      const result = await enhancePhoto(coinId ?? null, name, formData);
      if (!result.image) {
        setError(result.error);
        return;
      }
      const blob = await (await fetch(result.image)).blob();
      setOriginal((o) => o ?? { file: current });
      put(new File([blob], `${name}.jpg`, { type: "image/jpeg" }));
    });
  }

  return (
    <div className={styles.photoSlot}>
      <label className={styles.photo}>
        <span
          className={enhancing ? `${styles.preview} ${styles.busy}` : styles.preview}
          style={preview ? { backgroundImage: `url(${preview})` } : undefined}
        >
          {!preview && "+"}
        </span>
        {label}
        <input
          ref={input}
          name={name}
          type="file"
          accept="image/*"
          required={!initial}
          className={styles.fileInput}
          onChange={(e) => {
            setOriginal(undefined);
            setError(undefined);
            show(e.target.files?.[0]);
          }}
        />
      </label>
      <button type="button" disabled={!preview || enhancing} className={styles.small} onClick={enhance}>
        {enhancing ? "Обробка..." : "✨ Покращити"}
      </button>
      {original && !enhancing && (
        <button
          type="button"
          className={styles.link}
          onClick={() => {
            put(original.file);
            setOriginal(undefined);
          }}
        >
          ↩ Оригінал
        </button>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
