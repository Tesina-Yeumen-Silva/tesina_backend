import type { Channel, ChannelModel } from "amqplib";
import amqp from "amqplib";
import { rabbitmqConfig } from "../config/rabbitmq.js";
import { logger } from "../utils/logger.js";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

async function connectWithRetry(retries = MAX_RETRIES): Promise<ChannelModel> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await amqp.connect(rabbitmqConfig.url);
      logger.info("RabbitMQ: Conexión establecida exitosamente.");
      return conn;
    } catch (error) {
      if (attempt === retries) {
        logger.error(`RabbitMQ: Falló la conexión después de ${retries} intentos.`, error);
        throw error;
      }
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      logger.warn(`RabbitMQ: Intento ${attempt}/${retries} falló. Reintentando en ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("RabbitMQ: Unreachable");
}

export async function getChannel(): Promise<Channel> {
  if (!channel) {
    connection = await connectWithRetry();
    channel = await connection.createChannel();

    connection.on("close", () => {
      logger.warn("RabbitMQ: Conexión cerrada. Se reconectará en el próximo uso.");
      connection = null;
      channel = null;
    });

    connection.on("error", (err) => {
      logger.error("RabbitMQ: Error de conexión.", err);
      connection = null;
      channel = null;
    });
  }
  return channel;
}

export async function closeConnection(): Promise<void> {
  await connection?.close();
}
