"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { addDocument, getIdToken, requireSession, SESSION_COOKIE, signIn, uploadPhoto } from "./admin";

export type FormState = { error: string } | null;

const WRONG_CREDENTIALS = ["INVALID_LOGIN_CREDENTIALS", "EMAIL_NOT_FOUND", "INVALID_PASSWORD", "INVALID_EMAIL"];

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const refreshToken = await signIn(String(formData.get("email")), String(formData.get("password")));
    (await cookies()).set(SESSION_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: WRONG_CREDENTIALS.includes(message) ? "Невірний email або пароль" : message };
  }
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function addCoin(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const country = text("country");
  const name = text("name");
  const currency = text("currency");
  const info = text("info");
  const value = Number(text("value"));
  const year = Number(text("year"));
  const avers = formData.get("avers");
  const revers = formData.get("revers");

  if (!country || !name || !currency || !(value > 0) || !Number.isInteger(year) || year <= 0) {
    return { error: "Заповніть назву, країну, номінал, валюту та рік" };
  }
  if (!(avers instanceof File) || !avers.size || !(revers instanceof File) || !revers.size) {
    return { error: "Додайте фото аверсу і реверсу" };
  }

  let id: string;
  try {
    const idToken = await getIdToken(session);
    const prefix = `coins/${country}/${value}-${currency}-${year}-${Date.now()}`;
    const [aversUrl, reversUrl] = await Promise.all([
      uploadPhoto(idToken, `${prefix}-avers.${extension(avers)}`, avers),
      uploadPhoto(idToken, `${prefix}-revers.${extension(revers)}`, revers),
    ]);
    id = await addDocument(idToken, "coins", {
      country,
      name,
      value,
      currency,
      year,
      ...(info && { info }),
      avers: aversUrl,
      revers: reversUrl,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  updateTag("coins");
  redirect(`/coin/${id}`);
}

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "jpg";
}
