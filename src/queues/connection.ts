import type { Channel, ChannelModel } from "amqplib";
import amqp from "amqplib";
import { rabbitmqConfig } from "../config/rabbitmq.js";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getChannel(): Promise<Channel> {
  if (!channel) {
    connection = await amqp.connect(rabbitmqConfig.url);
    channel = await connection.createChannel();

    connection.on("close", () => {
      connection = null;
      channel = null;
    });
  }
  return channel;
}

export async function closeConnection(): Promise<void> {
  await connection?.close();
}
