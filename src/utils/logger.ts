const isProduction = process.env.NODE_ENV === "production";

const COLORS = {
  reset: "\x1b[0m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  debug: "\x1b[36m",
  timestamp: "\x1b[90m",
};

function formatMessage(
  level: keyof typeof COLORS,
  message: string,
  meta: any[],
): string {
  const timestamp = new Date().toISOString();

  if (isProduction) {
    const logObject = {
      timestamp,
      level,
      message,
      ...(meta.length > 0 ? { metadata: meta } : {}),
    };
    return JSON.stringify(logObject);
  } else {
    const color = COLORS[level] || COLORS.reset;
    const metaString =
      meta.length > 0
        ? "\n" +
          meta
            .map((m) =>
              m instanceof Error ? m.stack : JSON.stringify(m, null, 2),
            )
            .join("\n")
        : "";
    return `${COLORS.timestamp}[${timestamp}]${COLORS.reset} ${color}[${level.toUpperCase()}]${COLORS.reset}: ${message}${metaString}`;
  }
}

export const logger = {
  info: (message: string, ...meta: any[]) => {
    console.log(formatMessage("info", message, meta));
  },
  warn: (message: string, ...meta: any[]) => {
    console.warn(formatMessage("warn", message, meta));
  },
  error: (message: string, ...meta: any[]) => {
    console.error(formatMessage("error", message, meta));
  },
  debug: (message: string, ...meta: any[]) => {
    if (!isProduction) {
      console.log(formatMessage("debug", message, meta));
    }
  },
};
