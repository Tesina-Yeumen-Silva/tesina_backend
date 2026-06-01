export const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL ?? "amqp://admin:admin123@localhost",
  queues: {
    reportsValidate: "reports.validate",
    reportsResults: "reports.results",
  },
} as const;
