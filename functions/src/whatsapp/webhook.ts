import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { handleMessage } from "./bot";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// Webhook HTTP que recebe mensagens da Z-API
// Configure a URL deste endpoint no painel Z-API de cada instância:
// https://us-central1-<PROJECT_ID>.cloudfunctions.net/whatsappWebhook
export const whatsappWebhook = functions.onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const body = req.body as ZApiWebhookPayload;

      // Z-API envia vários tipos de eventos; só processa mensagens de texto recebidas
      if (!body.text?.message || body.fromMe || body.isGroup) {
        res.status(200).send("ok");
        return;
      }

      const instanceId = body.instanceId;
      const fromPhone = body.phone?.replace(/\D/g, "") ?? "";
      const message = body.text.message;

      if (!instanceId || !fromPhone) {
        res.status(200).send("ok");
        return;
      }

      // Encontra o userId pelo instanceId armazenado no perfil
      const usersSnap = await db.collection("users").listDocuments();
      let userId: string | null = null;
      let zapiToken: string | null = null;

      for (const userRef of usersSnap) {
        const profileSnap = await userRef.collection("meta").doc("profile").get();
        if (!profileSnap.exists) continue;
        const profile = profileSnap.data() as { zapiInstance?: string; zapiToken?: string };
        if (profile.zapiInstance === instanceId) {
          userId = userRef.id;
          zapiToken = profile.zapiToken ?? null;
          break;
        }
      }

      if (!userId || !zapiToken) {
        console.warn(`[whatsapp-webhook] Instância não encontrada: ${instanceId}`);
        res.status(200).send("ok");
        return;
      }

      await handleMessage(userId, { instanceId, token: zapiToken }, fromPhone, message);
      res.status(200).send("ok");

    } catch (err) {
      console.error("[whatsapp-webhook] Erro:", err);
      res.status(200).send("ok"); // sempre 200 para Z-API não retentar
    }
  }
);

interface ZApiWebhookPayload {
  instanceId?: string;
  phone?: string;
  fromMe?: boolean;
  isGroup?: boolean;
  text?: { message: string };
  [key: string]: unknown;
}
