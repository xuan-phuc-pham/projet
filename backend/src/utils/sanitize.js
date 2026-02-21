function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeObject(obj, fields) {
  const sanitized = {};
  for (const field of fields) {
    if (obj[field] !== undefined) {
      sanitized[field] = escapeHtml(obj[field]);
    }
  }
  return sanitized;
}

module.exports = { escapeHtml, sanitizeObject };
