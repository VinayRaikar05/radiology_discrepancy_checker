/**
 * Structured logger for RadiologyAI.
 *
 * Provides consistent, JSON-formatted log output with:
 * - Log levels (error, warn, info, debug)
 * - Timestamps
 * - Optional correlation IDs for request tracing
 * - Configurable via LOG_LEVEL env var
 *
 * Usage:
 *   import { logger } from "@/lib/logger"
 *   logger.info("Report analyzed", { reportId, confidence })
 *   logger.error("Analysis failed", { error: err.message, reportId })
 */

type LogLevel = "error" | "warn" | "info" | "debug"

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

function getCurrentLevel(): number {
  const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel
  return LOG_LEVELS[envLevel] ?? LOG_LEVELS.info
}

function formatMessage(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): string {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  }
  return JSON.stringify(entry)
}

class Logger {
  error(message: string, meta?: Record<string, unknown>): void {
    if (getCurrentLevel() >= LOG_LEVELS.error) {
      console.error(formatMessage("error", message, meta))
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (getCurrentLevel() >= LOG_LEVELS.warn) {
      console.warn(formatMessage("warn", message, meta))
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (getCurrentLevel() >= LOG_LEVELS.info) {
      console.info(formatMessage("info", message, meta))
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (getCurrentLevel() >= LOG_LEVELS.debug) {
      console.debug(formatMessage("debug", message, meta))
    }
  }

  /**
   * Create a child logger with preset metadata (e.g., correlationId).
   * Every log call from the child includes the preset fields.
   */
  child(defaultMeta: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, defaultMeta)
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultMeta: Record<string, unknown>,
  ) {}

  error(message: string, meta?: Record<string, unknown>): void {
    this.parent.error(message, { ...this.defaultMeta, ...meta })
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.defaultMeta, ...meta })
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.defaultMeta, ...meta })
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.defaultMeta, ...meta })
  }
}

export const logger = new Logger()
