import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { parseIntent } from "./assistant-intent";
import { executeIntent } from "./assistant-executor";

if (!admin.apps.length) admin.initializeApp();

export const assistant = functions.onRequest(
  {
    region: "us-central1",
    secrets: ["ANTHROPIC_API_KEY"],
    cors: true,
  },
  async (req, res) => {
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
    if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

    // Verificar Firebase ID token
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) { res.status(401).json({ error: "Token ausente" }); return; }

    let userId: string;
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      userId = decoded.uid;
    } catch {
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    const { text } = req.body as { text?: string };
    if (!text?.trim()) { res.status(400).json({ error: "Texto vazio" }); return; }

    try {
      const intent = await parseIntent(text.trim());
      const message = await executeIntent(userId, intent);
      res.json({ message, action: intent.action });
    } catch (err) {
      console.error("[assistant] erro:", err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);
