"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  addDocument,
  getIdToken,
  requireSession,
  SESSION_COOKIE,
  signIn,
  updateDocument,
  uploadPhoto,
} from "./admin";
import { type CoinDraft, describeCoinPhotos } from "./ai";
import { getCoin, getCountries, getCountry } from "./data";

export type FormState = { error?: string; success?: string } | null;

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

export async function saveCoin(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const country = text("country");
  const name = text("name");
  const currency = text("currency");
  const info = text("info");
  const value = Number(text("value"));
  const year = Number(text("year"));
  const avers = photo(formData.get("avers"));
  const revers = photo(formData.get("revers"));

  if (!country || !name || !currency || !(value > 0) || !Number.isInteger(year) || year <= 0) {
    return { error: "Заповніть назву, країну, номінал, валюту та рік" };
  }
  if (!id && (!avers || !revers)) {
    return { error: "Додайте фото аверсу і реверсу" };
  }

  if (!(await getCountry(country))) {
    return { error: `Спершу додайте країну «${country}»` };
  }

  try {
    const idToken = await getIdToken(session);
    const prefix = `coins/${country}/${value}-${currency}-${year}-${Date.now()}`;
    const upload = (file: File | undefined, side: string) =>
      file && uploadPhoto(idToken, `${prefix}-${side}.${extension(file)}`, file);
    const [aversUrl, reversUrl] = await Promise.all([upload(avers, "avers"), upload(revers, "revers")]);
    const values = {
      country,
      name,
      value,
      currency,
      year,
      ...(info && { info }),
      ...(aversUrl && { avers: aversUrl }),
      ...(reversUrl && { revers: reversUrl }),
    };
    if (id) {
      // "info" у масці без значення → поле видаляється, якщо опис очистили
      await updateDocument(idToken, "coins", id, values, [...Object.keys(values), ...(info ? [] : ["info"])]);
    } else {
      id = await addDocument(idToken, "coins", values);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  updateTag("coins");
  redirect(`/coin/${id}`);
}

export async function addCountry(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const id = text("id").toLowerCase();
  const name_ua = text("name_ua");
  const name_en = text("name_en");
  const flag = text("flag");

  if (!/^[a-z]{2,3}$/.test(id) || !name_ua || !name_en || !flag) {
    return { error: "Заповніть код (2–3 латинські літери), назви та прапор" };
  }

  try {
    await addDocument(await getIdToken(session), "countries", { name_ua, name_en, flag }, id);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message.startsWith("Document already exists") ? `Країна «${id}» вже існує` : message };
  }

  updateTag("countries");
  return { success: `Додано ${flag} ${name_ua}` };
}

export type DescribeState = { attempt: number; draft?: CoinDraft; error?: string };

export async function describeCoin(
  id: string | null,
  prev: DescribeState,
  formData: FormData,
): Promise<DescribeState> {
  await requireSession();
  const attempt = prev.attempt + 1;
  try {
    const saved = id ? await getCoin(id) : null;
    const [avers, revers] = await Promise.all([
      photo(formData.get("avers")) ?? download(saved?.avers),
      photo(formData.get("revers")) ?? download(saved?.revers),
    ]);
    if (!avers || !revers) return { attempt, error: "Додайте фото аверсу і реверсу" };
    return { attempt, draft: await describeCoinPhotos(avers, revers, await getCountries()) };
  } catch (e) {
    return { attempt, error: e instanceof Error ? e.message : String(e) };
  }
}

function photo(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : undefined;
}

async function download(url: string | undefined) {
  if (!url) return undefined;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Не вдалося завантажити фото: ${res.status}`);
  return new File([await res.blob()], "photo", { type: res.headers.get("content-type") ?? "image/jpeg" });
}

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "jpg";
}
