import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const KEY = process.env.FIREBASE_API_KEY;
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
const DOCUMENTS = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export const SESSION_COOKIE = "admin_session";

export async function requireSession() {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) redirect("/admin/login");
  return session;
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? res.statusText);
  return data;
}

export async function signIn(email: string, password: string) {
  const data = await request<{ refreshToken: string }>(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  return data.refreshToken;
}

export async function getIdToken(refreshToken: string) {
  const data = await request<{ id_token: string }>(
    `https://securetoken.googleapis.com/v1/token?key=${KEY}`,
    {
      method: "POST",
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    },
  );
  return data.id_token;
}

export async function uploadPhoto(idToken: string, path: string, file: File) {
  const data = await request<{ downloadTokens: string }>(
    `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?name=${encodeURIComponent(path)}`,
    {
      method: "POST",
      headers: { Authorization: `Firebase ${idToken}`, "Content-Type": file.type },
      body: file,
    },
  );
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media&token=${data.downloadTokens}`;
}

export async function addDocument(
  idToken: string,
  collection: string,
  values: Record<string, string | number>,
  id?: string,
) {
  const fields = Object.fromEntries(
    Object.entries(values).map(([key, v]) => [
      key,
      typeof v === "string" ? { stringValue: v } : Number.isInteger(v) ? { integerValue: v } : { doubleValue: v },
    ]),
  );
  const query = id ? `?documentId=${encodeURIComponent(id)}` : "";
  const data = await request<{ name: string }>(`${DOCUMENTS}/${collection}${query}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  return data.name.split("/").pop()!;
}
