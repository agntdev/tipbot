type LogLevel = "INFO" | "ERROR";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

function emit(level: LogLevel, message: string, extra?: Record<string, unknown>): void {
  const entry: LogEntry & Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...extra,
  };
  process.stdout.write(JSON.stringify(entry) + "\n");
}

export const logger = {
  info(message: string, extra?: Record<string, unknown>): void {
    emit("INFO", message, extra);
  },
  error(message: string, extra?: Record<string, unknown>): void {
    emit("ERROR", message, extra);
  },
};