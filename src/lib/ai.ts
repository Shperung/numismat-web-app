import { AgentPlatformBackend, getAI, getGenerativeModel } from "firebase/ai";
import type { Coin } from "@/types/coin";
import { app } from "./firebase";

const ai = getAI(app, { backend: new AgentPlatformBackend("global") });

export async function askGemini(coin: Coin, question: string) {
  const model = getGenerativeModel(ai, {
    model: "gemini-3.5-flash-lite",
    systemInstruction:
      "Ти досвідчений нумізмат. Відповідай українською, коротко і цікаво. " +
      `Розмова про монету: ${JSON.stringify(coin)}, які факти про ню є, чи вона ще в вжитку, що за ню можна купити або можна було купити у рік виходу`,
  });
  const result = await model.startChat().sendMessage(question);
  return result.response.text();
}
