"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const admin = __importStar(require("firebase-admin"));
const bot_1 = require("./bot");
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
// Webhook HTTP que recebe mensagens da Z-API
// Configure a URL deste endpoint no painel Z-API de cada instância:
// https://us-central1-<PROJECT_ID>.cloudfunctions.net/whatsappWebhook
exports.whatsappWebhook = functions.onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
    var _a, _b, _c, _d;
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const body = req.body;
        // Z-API envia vários tipos de eventos; só processa mensagens de texto recebidas
        if (!((_a = body.text) === null || _a === void 0 ? void 0 : _a.message) || body.fromMe || body.isGroup) {
            res.status(200).send("ok");
            return;
        }
        const instanceId = body.instanceId;
        const fromPhone = (_c = (_b = body.phone) === null || _b === void 0 ? void 0 : _b.replace(/\D/g, "")) !== null && _c !== void 0 ? _c : "";
        const message = body.text.message;
        if (!instanceId || !fromPhone) {
            res.status(200).send("ok");
            return;
        }
        // Encontra o userId pelo instanceId armazenado no perfil
        const usersSnap = await db.collection("users").listDocuments();
        let userId = null;
        let zapiToken = null;
        for (const userRef of usersSnap) {
            const profileSnap = await userRef.collection("meta").doc("profile").get();
            if (!profileSnap.exists)
                continue;
            const profile = profileSnap.data();
            if (profile.zapiInstance === instanceId) {
                userId = userRef.id;
                zapiToken = (_d = profile.zapiToken) !== null && _d !== void 0 ? _d : null;
                break;
            }
        }
        if (!userId || !zapiToken) {
            console.warn(`[whatsapp-webhook] Instância não encontrada: ${instanceId}`);
            res.status(200).send("ok");
            return;
        }
        await (0, bot_1.handleMessage)(userId, { instanceId, token: zapiToken }, fromPhone, message);
        res.status(200).send("ok");
    }
    catch (err) {
        console.error("[whatsapp-webhook] Erro:", err);
        res.status(200).send("ok"); // sempre 200 para Z-API não retentar
    }
});
//# sourceMappingURL=webhook.js.map