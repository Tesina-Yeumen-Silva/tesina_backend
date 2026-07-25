import { getChannel } from "../connection.js";
import { rabbitmqConfig } from "../../config/rabbitmq.js";
import type { ReportResultMessage } from "../../types/queue.js";
import { logger } from "../../utils/logger.js";
import { notifyReportStatusUpdateService } from "../../services/notification.services.js";

export async function startReportConsumer(): Promise<void> {
  try {
    const channel = await getChannel();
    const queue = rabbitmqConfig.queues.reportsResults;

    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);

    logger.info(`RabbitMQ: Inicializando consumidor para la cola '${queue}'`);

    channel.consume(queue, async (msg) => {
      if (!msg) {
        logger.warn("RabbitMQ: Consumidor recibió un mensaje nulo/vacío.");
        return;
      }

      try {
        const rawContent = msg.content.toString();
        logger.debug(
          `RabbitMQ: Mensaje recibido en la cola '${queue}':`,
          rawContent,
        );

        let result: ReportResultMessage;
        try {
          result = JSON.parse(rawContent);
        } catch (parseError) {
          logger.error(
            "RabbitMQ: Error de parseo JSON en el mensaje recibido. Descartando mensaje.",
            parseError,
          );
          channel.nack(msg, false, false);
          return;
        }

        logger.info(
          `RabbitMQ: Reporte ${result.reportId} finalizado con estado: ${result.status}`,
        );

        await notifyReportStatusUpdateService(result.reportId, result.status);

        channel.ack(msg);
      } catch (processingError) {
        logger.error(
          "RabbitMQ: Error inesperado procesando el mensaje de reporte:",
          processingError,
        );
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    logger.error(
      "RabbitMQ: Error al iniciar el consumidor startReportConsumer:",
      error,
    );
    throw error;
  }
}
