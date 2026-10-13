// Sensitive fields that should be redacted from logs
const SENSITIVE_FIELDS = ['password', 'token', 'authorization', 'cookie'];

/**
 * Redacts sensitive fields from an object
 * @param {Object} obj - Object to redact
 * @returns {Object} - Object with sensitive fields replaced with '[REDACTED]'
 */
function redactSensitiveFields(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const redacted = { ...obj };
  
  SENSITIVE_FIELDS.forEach(field => {
    if (redacted.hasOwnProperty(field)) {
      redacted[field] = '[REDACTED]';
    }
  });

  return redacted;
}

function info(message, meta = {}) {
  const redactedMeta = redactSensitiveFields(meta);
  console.log(JSON.stringify({ level: 'info', message, ...redactedMeta, timestamp: new Date().toISOString() }));
}

function error(message, meta = {}) {
  const redactedMeta = redactSensitiveFields(meta);
  console.error(JSON.stringify({ level: 'error', message, ...redactedMeta, timestamp: new Date().toISOString() }));
}

function warn(message, meta = {}) {
  const redactedMeta = redactSensitiveFields(meta);
  console.warn(JSON.stringify({ level: 'warn', message, ...redactedMeta, timestamp: new Date().toISOString() }));
}

module.exports = {
  info,
  error,
  warn,
};
