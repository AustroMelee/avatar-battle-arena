// CONTEXT: Battle Logger Service
// RESPONSIBILITY: Handle debug logging and diagnostics for battle operations

/**
 * @description Log levels for battle operations
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * @description Configuration for battle logging
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFileLogging?: boolean;
  logFilePath?: string;
}

/**
 * @description Battle logger service
 */
export class BattleLogger {
  private config: LoggerConfig;
  
  constructor(config: LoggerConfig = { level: LogLevel.INFO, enableConsole: true }) {
    this.config = config;
  }
  
  /**
   * @description Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }
  
  /**
   * @description Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, context);
    }
  }
  
  /**
   * @description Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, context);
    }
  }
  
  /**
   * @description Log an error message
   */
  error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.log(LogLevel.ERROR, message, context);
    }
  }
  
  /**
   * @description Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levelOrder = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configLevelIndex = levelOrder.indexOf(this.config.level);
    const messageLevelIndex = levelOrder.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }
  
  /**
   * @description Output the log message
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    
    if (this.config.enableConsole) {
      const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                           level === LogLevel.WARN ? 'warn' : 
                           level === LogLevel.INFO ? 'info' : 'log';
      
      console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}`, context || '');
    }
    
    // Future: Add file logging support
    if (this.config.enableFileLogging && this.config.logFilePath) {
      // TODO: Implement file logging
    }
  }
}

/**
 * @description Global battle logger instance
 */
export const battleLogger = new BattleLogger({
  level: LogLevel.DEBUG,
  enableConsole: true
});

/**
 * @description Log tactical move execution details
 */
export function logTacticalMove(
  characterName: string,
  moveName: string,
  damage: number,
  context: string,
  additionalData?: Record<string, unknown>
): void {
  battleLogger.debug(
    `${characterName} ${context} ${moveName}: ${damage} damage`,
    { moveName, damage, ...additionalData }
  );
}

/**
 * @description Log escalation mechanics
 */
export function logEscalation(
  characterName: string,
  damage: number,
  multiplier: number
): void {
  battleLogger.debug(
    `${characterName} escalation damage: ${damage} (${multiplier}x multiplier)`,
    { characterName, damage, multiplier }
  );
}

/**
 * @description Log punishment mechanics
 */
export function logPunishment(
  characterName: string,
  damage: number,
  multiplier: number,
  reason: string
): void {
  battleLogger.debug(
    `${characterName} PUNISHING VULNERABLE ENEMY: ${damage} damage (${multiplier}x multiplier)`,
    { characterName, damage, multiplier, reason }
  );
}

/**
 * @description Log narrative generation
 */
export function logNarrative(
  characterName: string,
  narrative: string,
  type: 'enhanced' | 'fallback'
): void {
  battleLogger.debug(
    `${type} ${characterName} narrative: "${narrative}"`,
    { characterName, narrative, type }
  );
}

/**
 * @description Log move usage tracking
 */
export function logMoveUsage(
  characterName: string,
  moveName: string,
  usesLeft: number,
  context: string
): void {
  battleLogger.debug(
    `${characterName} ${context} ${moveName}, uses left: ${usesLeft}`,
    { characterName, moveName, usesLeft, context }
  );
}

/**
 * @description Log charge mechanics
 */
export function logCharge(
  characterName: string,
  moveName: string,
  progress: number,
  context: string
): void {
  battleLogger.debug(
    `${characterName} ${context} ${moveName}, progress: ${progress}%`,
    { characterName, moveName, progress, context }
  );
} 