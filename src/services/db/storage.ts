// Re-exporta a interface de storage do Firestore.
// Os repos em index.ts importam daqui para não precisar saber qual backend está ativo.

export { loadDb, subscribe, notify } from "./firestore";

// Compatibilidade com exports anteriores — não usados na versão Firestore
export function saveDb(): void {}
export function resetDb(): never { throw new Error("resetDb não suportado no Firestore"); }
export function clearDb(): void {}
