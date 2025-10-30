/**
 * Logger Utility
 * Centralized logging for the application
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugAI = process.env.DEBUG_AI === 'true';

/**
 * Color codes for console
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Format timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Log levels
 */
const logger = {
  /**
   * Info log
   */
  info: (message, data = null) => {
    if (!isDevelopment) return;
    console.log(
      `${colors.blue}ℹ [INFO]${colors.reset} ${colors.gray}[${getTimestamp()}]${colors.reset} ${message}`
    );
    if (data) console.log(data);
  },

  /**
   * Success log
   */
  success: (message, data = null) => {
    if (!isDevelopment) return;
    console.log(
      `${colors.green}✓ [SUCCESS]${colors.reset} ${colors.gray}[${getTimestamp()}]${colors.reset} ${message}`
    );
    if (data) console.log(data);
  },

  /**
   * Warning log
   */
  warn: (message, data = null) => {
    console.warn(
      `${colors.yellow}⚠ [WARN]${colors.reset} ${colors.gray}[${getTimestamp()}]${colors.reset} ${message}`
    );
    if (data) console.warn(data);
  },

  /**
   * Error log
   */
  error: (message, error = null) => {
    console.error(
      `${colors.red}✗ [ERROR]${colors.reset} ${colors.gray}[${getTimestamp()}]${colors.reset} ${message}`
    );
    if (error) {
      if (error.stack) {
        console.error(colors.red + error.stack + colors.reset);
      } else {
        console.error(error);
      }
    }
  },

  /**
   * Debug log (only in development or when DEBUG_AI=true)
   */
  debug: (message, data = null) => {
    if (!isDevelopment && !isDebugAI) return;
    console.log(
      `${colors.magenta}🐛 [DEBUG]${colors.reset} ${colors.gray}[${getTimestamp()}]${colors.reset} ${message}`
    );
    if (data) console.log(data);
  },

  /**
   * AI-specific log (only when DEBUG_AI=true)
   */
  ai: (message, data = null) => {
    if (!isDebugAI) return;
    console.log(
      `${colors.cyan}🤖 [AI]${colors.reset} ${colors.gray}[${getTimestamp()}]${colors.reset} ${message}`
    );
    if (data) console.log(data);
  },

  /**
   * Database query log
   */
  query: (sql, params = null) => {
    if (!isDevelopment && !isDebugAI) return;
    console.log(
      `${colors.cyan}🗃️  [QUERY]${colors.reset} ${colors.gray}[${getTimestamp()}]${colors.reset}`
    );
    console.log(colors.cyan + sql + colors.reset);
    if (params) {
      console.log(`${colors.gray}Params:${colors.reset}`, params);
    }
  },

  /**
   * HTTP request log
   */
  request: (method, url, statusCode = null) => {
    if (!isDevelopment) return;
    const statusColor =
      statusCode >= 500
        ? colors.red
        : statusCode >= 400
        ? colors.yellow
        : statusCode >= 200
        ? colors.green
        : colors.gray;

    console.log(
      `${colors.blue}→ [${method}]${colors.reset} ${url} ${statusCode ? statusColor + statusCode + colors.reset : ''} ${colors.gray}[${getTimestamp()}]${colors.reset}`
    );
  },

  /**
   * PostgreSQL error log
   */
  pgError: (error) => {
    console.error(
      `${colors.red}🐘 [PG ERROR]${colors.reset} ${colors.gray}[${getTimestamp()}]${colors.reset}`
    );
    console.error({
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      table: error.table,
      constraint: error.constraint,
      severity: error.severity,
    });
    if (isDevelopment || isDebugAI) {
      console.error(colors.red + error.stack + colors.reset);
    }
  },
};

export default logger;

