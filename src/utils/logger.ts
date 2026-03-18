const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const

interface LogContext {
  timestamp: string
  level: string
  module: string
  message: string
  data?: Record<string, unknown>
}

class Logger {
  private module: string
  private level: number

  constructor(module: string, level: number = LogLevel.INFO) {
    this.module = module
    this.level = level
  }

  private format(level: string, message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString()
    const log: LogContext = {
      timestamp,
      level,
      module: this.module,
      message,
      ...(data && { data }),
    }
    return JSON.stringify(log)
  }

  info(message: string, data?: Record<string, unknown>) {
    if (this.level >= LogLevel.INFO) {
      console.log(this.format('INFO', message, data))
    }
  }

  warn(message: string, data?: Record<string, unknown>) {
    if (this.level >= LogLevel.WARN) {
      console.warn(this.format('WARN', message, data))
    }
  }

  error(message: string, data?: Record<string, unknown>) {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.format('ERROR', message, data))
    }
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(this.format('DEBUG', message, data))
    }
  }
}

export const createLogger = (module: string) => new Logger(module)
export { LogLevel }
