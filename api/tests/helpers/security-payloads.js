/**
 * Security payloads for testing injection and XSS vulnerabilities
 */

const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "admin'--",
  "' OR '1'='1' --",
  "1' UNION SELECT NULL--",
  "'; DROP TABLE users--",
];

const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<svg/onload=alert("XSS")>',
];

const WEAK_PASSWORDS = [
  'short',
  'nouppercase123!',
  'NOLOWERCASE123!',
  'NoDigits!',
  'NoSpecial123',
  'abc',
  '1234',
  'Aa1!aaaa', // Less than 12 characters but meets other requirements
];

const LONG_STRINGS = {
  OVERSIZED_FIRSTNAME: 'a'.repeat(101),
  OVERSIZED_EMAIL: 'a'.repeat(250) + '@test.com',
  OVERSIZED_BODY_DATA: 'a'.repeat(12000), // > 10kb
};

module.exports = {
  SQLI_PAYLOADS,
  XSS_PAYLOADS,
  WEAK_PASSWORDS,
  LONG_STRINGS,
};