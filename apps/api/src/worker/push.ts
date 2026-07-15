import { Expo, type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN || undefined });

/**
 * Envía mensajes por Expo Push en lotes (chunks) y devuelve los tickets.
 * Filtra tokens con formato inválido antes de enviar.
 */
export async function sendPushMessages(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  const valid = messages.filter((m) => {
    const to = Array.isArray(m.to) ? m.to[0] : m.to;
    return typeof to === "string" && Expo.isExpoPushToken(to);
  });

  const tickets: ExpoPushTicket[] = [];
  for (const chunk of expo.chunkPushNotifications(valid)) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...receipts);
    } catch (err) {
      console.error("[worker] error enviando chunk de push:", err);
    }
  }
  return tickets;
}

export { Expo };
