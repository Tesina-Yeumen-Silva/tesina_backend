import { Expo } from "expo-server-sdk";
import type { ExpoPushMessage } from "expo-server-sdk";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

const expo = new Expo();

export const sendPushNotificationToUsers = async (
  userIds: number[],
  title: string,
  body: string,
  data?: Record<string, any>,
) => {
  if (userIds.length === 0) return;

  const pushTokens = await prisma.pushToken.findMany({
    where: { userId: { in: userIds } },
  });

  if (pushTokens.length === 0) {
    logger.info(
      `Ninguno de los usuarios [${userIds.join(", ")}] tiene tokens de notificaciones registrados.`,
    );
    return;
  }

  const messages: ExpoPushMessage[] = [];

  for (const pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken.token)) {
      logger.error(`Token inválido encontrado en la BD: ${pushToken.token}`);
      continue;
    }

    messages.push({
      to: pushToken.token,
      sound: "default",
      title,
      body,
      data,
    });
  }

  if (messages.length === 0) return;

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      logger.error("Error enviando lote de notificaciones a Expo:", error);
    }
  }

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const message = messages[i];
    if (!ticket || !message) continue;

    const tokenSent = message.to;

    if (ticket.status === "error" && typeof tokenSent === "string") {
      logger.error(
        `Error de entrega para el token ${tokenSent}:`,
        ticket.details,
      );

      if (ticket.details?.error === "DeviceNotRegistered") {
        await prisma.pushToken.delete({
          where: { token: tokenSent },
        });
        logger.info(`Token obsoleto eliminado de la BD: ${tokenSent}`);
      }
    }
  }
};

export const sendPushNotificationToUser = async (
  userId: number,
  title: string,
  body: string,
  data?: Record<string, any>,
) => {
  return sendPushNotificationToUsers([userId], title, body, data);
};

export const notifyReportStatusUpdateService = async (
  reportId: number,
  status: string,
): Promise<void> => {
  const report = await prisma.report.findUnique({
    where: { id: reportId, deletedAt: null },
    include: {
      category: true,
      reportAdhesion: {
        select: { userId: true },
      },
    },
  });

  if (!report) {
    logger.warn(
      `No se encontró el reporte ${reportId} para enviar notificaciones.`,
    );
    return;
  }

  const userIdsToNotify = new Set<number>();
  userIdsToNotify.add(report.userId);

  for (const adhesion of report.reportAdhesion) {
    userIdsToNotify.add(adhesion.userId);
  }

  const title = `Actualización: Reporte ${status}`;
  const body = `El reporte de "${report.category.name}" en la dirección "${report.address}" ha cambiado de estado`;

  await sendPushNotificationToUsers(Array.from(userIdsToNotify), title, body, {
    reportId: report.id,
    status: status,
  });
};
