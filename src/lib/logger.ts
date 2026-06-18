type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LEVEL_RANK: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function currentLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw === 'error' || raw === 'warn' || raw === 'info' || raw === 'debug') {
    return raw;
  }
  return 'warn';
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANK[level] <= LEVEL_RANK[currentLevel()];
}

/** App logger — defaults to warnings and errors only. Set LOG_LEVEL=info|debug for more detail. */
export const logger = {
  /** Always logged — use for operational events worth seeing in a quiet console. */
  important(message: string, ...details: unknown[]) {
    console.info(`[info] ${message}`, ...details);
  },
  error(message: string, ...details: unknown[]) {
    if (shouldLog('error')) console.error(`[error] ${message}`, ...details);
  },
  warn(message: string, ...details: unknown[]) {
    if (shouldLog('warn')) console.warn(`[warn] ${message}`, ...details);
  },
  info(message: string, ...details: unknown[]) {
    if (shouldLog('info')) console.info(`[info] ${message}`, ...details);
  },
  debug(message: string, ...details: unknown[]) {
    if (shouldLog('debug')) console.debug(`[debug] ${message}`, ...details);
  },
};
