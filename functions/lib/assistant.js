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
exports.assistant = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const admin = __importStar(require("firebase-admin"));
const assistant_intent_1 = require("./assistant-intent");
const assistant_executor_1 = require("./assistant-executor");
if (!admin.apps.length)
    admin.initializeApp();
exports.assistant = functions.onRequest({
    region: "us-central1",
    secrets: ["ANTHROPIC_API_KEY"],
    cors: true,
}, async (req, res) => {
    var _a;
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    // Verificar Firebase ID token
    const authHeader = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ error: "Token ausente" });
        return;
    }
    let userId;
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        userId = decoded.uid;
    }
    catch (_b) {
        res.status(401).json({ error: "Token inválido" });
        return;
    }
    const { text } = req.body;
    if (!(text === null || text === void 0 ? void 0 : text.trim())) {
        res.status(400).json({ error: "Texto vazio" });
        return;
    }
    try {
        const intent = await (0, assistant_intent_1.parseIntent)(text.trim());
        const message = await (0, assistant_executor_1.executeIntent)(userId, intent);
        res.json({ message, action: intent.action });
    }
    catch (err) {
        console.error("[assistant] erro:", err);
        res.status(500).json({ error: "Erro interno" });
    }
});
//# sourceMappingURL=assistant.js.map