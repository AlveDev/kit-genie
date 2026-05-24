import * as functions from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// Dispara ao atualizar um componente — verifica se estoque ficou abaixo do mínimo
export const onComponentLowStock = functions.onDocumentUpdated(
  "users/{userId}/components/{componentId}",
  async (event) => {
    const after = event.data?.after.data() as {
      name: string; stock: number; minStock: number;
    } | undefined;

    if (!after) return;

    const userId = event.params.userId;

    // Lê configurações do usuário
    const settingsSnap = await db.doc(`users/${userId}/meta/settings`).get();
    if (!settingsSnap.exists) return;
    const settings = settingsSnap.data() as {
      notifyLowStock?: boolean;
      lowStockMultiplier?: number;
    };

    if (!settings.notifyLowStock) return;

    const multiplier = settings.lowStockMultiplier ?? 1;
    const threshold = after.minStock * multiplier;

    if (after.stock > threshold) return;

    // Grava notificação no Firestore (o dashboard lê alertas de estoque em tempo real)
    const notifRef = db
      .collection(`users/${userId}/notifications`)
      .doc(`low-stock-${event.params.componentId}`);

    await notifRef.set({
      type: "low_stock",
      componentId: event.params.componentId,
      componentName: after.name,
      stock: after.stock,
      minStock: after.minStock,
      threshold,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    console.log(`[low-stock] Alerta gravado: ${after.name} (${after.stock}/${after.minStock}) — usuário ${userId}`);
  }
);
