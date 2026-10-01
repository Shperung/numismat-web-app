"use client";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      <p style={{ color: "var(--error)" }}>Помилка: {error.message}</p>
      <button onClick={retry}>Спробувати ще</button>
    </div>
  );
}
