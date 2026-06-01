import { getChannel } from "../connection.js";
import { rabbitmqConfig } from "../../config/rabbitmq.js";
import type { ReportValidateMessage } from "../../types/queue.js";

export async function publishReportValidation(reportId: number): Promise<void> {
  const channel = await getChannel();
  const queue = rabbitmqConfig.queues.reportsValidate;

  await channel.assertQueue(queue, { durable: true });

  const message: ReportValidateMessage = {
    reportId,
    action: "validate_report",
    timestamp: new Date().toISOString(),
  };

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}
