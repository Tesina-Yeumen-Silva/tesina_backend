import { getChannel } from "../connection.js";
import { rabbitmqConfig } from "../../config/rabbitmq.js";
import type { ReportResultMessage } from "../../types/queue.js";

export async function startReportConsumer(): Promise<void> {
  const channel = await getChannel();
  const queue = rabbitmqConfig.queues.reportsResults;

  await channel.assertQueue(queue, { durable: true });
  channel.prefetch(1);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    const result: ReportResultMessage = JSON.parse(msg.content.toString());
    console.log(
      `Reporte ${result.reportId} finalizado con estado: ${result.status}`,
    );

    channel.ack(msg);
  });
}
