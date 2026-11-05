import {initializeServerApp} from "firebase/app";
import {
  AgentPlatformBackend,
  type AI,
  getAI,
  getGenerativeModel,
  Schema,
} from "firebase/ai";
import {cert, getApps, initializeApp} from "firebase-admin/app";
import {getAppCheck} from "firebase-admin/app-check";
import type {Coin} from "@/types/coin";
import type {Country} from "@/types/country";
import {config} from "./firebase";

// App Check token from createToken lives 1 hour by default.
let cached: {ai: Promise<AI>; expires: number} | undefined;

function getAi() {
  if (!cached || Date.now() > cached.expires) {
    cached = {ai: createAi(), expires: Date.now() + 50 * 60_000};
    cached.ai.catch(() => (cached = undefined));
  }
  return cached.ai;
}

async function createAi() {
  const admin =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  const {token} = await getAppCheck(admin).createToken(config.appId!);
  const app = initializeServerApp(config, {appCheckToken: token});
  return getAI(app, {backend: new AgentPlatformBackend("global")});
}

export async function askGemini(coin: Coin, question: string) {
  const model = getGenerativeModel(await getAi(), {
    model: "gemini-3.5-flash-lite",
    systemInstruction:
      "Ти досвідчений нумізмат. Відповідай українською, коротко і цікаво. " +
      `Розмова про монету: ${JSON.stringify(coin)}, які факти про ню є, чи вона ще в вжитку, що за ню можна купити або можна було купити у рік виходу.  Які основні геополвтичні події відбулись в рік випуску монети в країні випуску?. Що ціківе про музику відбулось в рік випуску монети в країні випуску (бажано стилі музики метал [sympho / doom / gothic / melodic death / folk metal] або rave, якщо в ті роки взагалі була така музика в тій кріїні вибери групу і трек із ції музики)?. Який самий популярний фільм вийшов рік випуску монети в країні випуску (якщо в ті роки взагалі був такий фільм в тій країні)?.`,
  });
  const result = await model.startChat().sendMessage(question);
  return result.response.text();
}

export type CoinDraft = {
  coin: Omit<Coin, "id" | "avers" | "revers">;
  newCountry?: Country;
};

const draftSchema = Schema.object({
  properties: {
    coin: Schema.object({
      properties: {
        name: Schema.string({
          description:
            "Назва монети англійською, напр. «Quarter Dollar», «One Cent»",
        }),
        country: Schema.string({
          description:
            "Код країни: зі списку наявних або новий ISO 3166-1 alpha-2, нижній регістр",
        }),
        value: Schema.number({
          description:
            "Номінал числом в одиницях currency; для розмінних монет — у дрібних: 25 (cent), а не 0.25 (dollar)",
        }),
        currency: Schema.string({
          description:
            "Одиниця номіналу англійською в однині: дрібна для розмінних (cent, kopiyka), основна для інших (dollar, hryvnia)",
        }),
        year: Schema.integer({description: "Рік карбування з фото"}),
        info: Schema.string({
          description:
            "Опис українською: що зображено на аверсі й реверсі, написи, 2–3 речення",
        }),
      },
    }),
    newCountry: Schema.object({
      description: "Лише якщо країни монети немає в списку наявних",
      properties: {
        id: Schema.string({
          description:
            "ISO 3166-1 alpha-2, нижній регістр, той самий, що coin.country",
        }),
        name_ua: Schema.string(),
        name_en: Schema.string(),
        flag: Schema.string({description: "Емодзі прапора"}),
      },
    }),
  },
  optionalProperties: ["newCountry"],
});

export async function describeCoinPhotos(
  avers: File,
  revers: File,
  countries: Country[],
) {
  const model = getGenerativeModel(await getAi(), {
    model: "gemini-3.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: draftSchema,
    },
  });
  const known = countries.map((c) => `${c.id} — ${c.name_en}`).join(", ");
  const result = await model.generateContent([
    "Ти досвідчений нумізмат. Перше фото — аверс монети, друге — реверс. Визнач монету й заповни дані. " +
      `Наявні країни: ${known}. Якщо країна монети серед них — візьми її код і не заповнюй newCountry.`,
    await toPart(avers),
    await toPart(revers),
  ]);
  return JSON.parse(result.response.text()) as CoinDraft;
}

export type CoinLocation = {box_2d: number[]; round: boolean};

const locationSchema = Schema.object({
  properties: {
    box_2d: Schema.array({
      items: Schema.integer(),
      description:
        "Рамка монети [ymin, xmin, ymax, xmax] у масштабі 0–1000, щільно по зовнішньому краю (ободу)",
    }),
    round: Schema.boolean({
      description: "Чи монета кругла (на фото може бути овалом через ракурс)",
    }),
  },
});

export async function locateCoin(jpeg: Buffer) {
  const model = getGenerativeModel(await getAi(), {
    model: "gemini-3.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: locationSchema,
    },
  });
  const result = await model.generateContent([
    "На фото одна сторона монети. Знайди її межі та форму.",
    {inlineData: {data: jpeg.toString("base64"), mimeType: "image/jpeg"}},
  ]);
  return JSON.parse(result.response.text()) as CoinLocation;
}

async function toPart(file: File) {
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  return {inlineData: {data, mimeType: file.type || "image/jpeg"}};
}
