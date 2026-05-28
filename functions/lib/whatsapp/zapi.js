"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendText = sendText;
exports.sendList = sendList;
const axios_1 = __importDefault(require("axios"));
async function sendText(config, phone, message) {
    const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-text`;
    await axios_1.default.post(url, { phone, message });
}
async function sendList(config, phone, title, buttonLabel, sections) {
    const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-option-list`;
    await axios_1.default.post(url, { phone, title, buttonLabel, sections });
}
//# sourceMappingURL=zapi.js.map