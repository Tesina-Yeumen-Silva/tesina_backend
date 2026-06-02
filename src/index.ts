import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { startReportConsumer } from "./queues/consumers/reportConsumer.js";
import { closeConnection } from "./queues/connection.js";
import { logger } from "./utils/logger.js";
import type { Server } from "http";

let server: Server;

const main = async () => {
  try {
    await prisma.$connect();
    logger.info("¡DB connected successfully!");

    await startReportConsumer();
    logger.info("Escuchando resultados de Python (RabbitMQ)...");

    const port = process.env.PORT || 5000;

    server = app.listen(port, () => {
      logger.info(
        `Server running on port ${port} [env: ${process.env.NODE_ENV || "development"}]`,
      );
    });
  } catch (error) {
    logger.error("Error crítico durante el inicio del servidor:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (reason: string, exitCode = 0) => {
  logger.info(`Iniciando apagado gradual del servidor por: ${reason}...`);

  if (server) {
    server.close(() => {
      logger.info("Servidor Express cerrado para nuevas conexiones.");
    });
  }

  try {
    await closeConnection();
    logger.info("Conexión de RabbitMQ cerrada de forma limpia.");

    await prisma.$disconnect();
    logger.info("Conexión con la base de datos cerrada de forma limpia.");

    logger.info(`Proceso finalizado exitosamente con código ${exitCode}.`);
    process.exit(exitCode);
  } catch (error) {
    logger.error("Error al cerrar recursos durante el apagado gradual:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM", 0));
process.on("SIGINT", () => gracefulShutdown("SIGINT", 0));

process.on("uncaughtException", (error) => {
  logger.error("EXCEPCIÓN NO CAPTURADA (uncaughtException):", error);
  gracefulShutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("PROMISE REJECTION NO CONTROLADA (unhandledRejection):", reason);
  gracefulShutdown("unhandledRejection", 1);
});

main();
