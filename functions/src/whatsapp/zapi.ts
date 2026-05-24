import axios from "axios";

// Cliente HTTP para a Z-API (https://z-api.io)
// Cada usuária tem sua própria instância Z-API armazenada no Firestore.

export interface ZApiConfig {
  instanceId: string;
  token: string;
}

export async function sendText(config: ZApiConfig, phone: string, message: string): Promise<void> {
  const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-text`;
  await axios.post(url, { phone, message });
}

export async function sendList(
  config: ZApiConfig,
  phone: string,
  title: string,
  buttonLabel: string,
  sections: Array<{ title: string; rows: Array<{ title: string; description?: string; rowId: string }> }>
): Promise<void> {
  const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-option-list`;
  await axios.post(url, { phone, title, buttonLabel, sections });
}
