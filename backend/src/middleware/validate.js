// Validation de Input

const REACTION_TYPES = ['like', 'dislike', 'love', 'wow', 'haha', 'sad', 'angry'];

function validate(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      let value = req.body[field];

      // Trim string values before validation
      if (typeof value === 'string') {
        value = value.trim();
        req.body[field] = value;
      }

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} requiré`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} string requiré`);
          continue;
        }

        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push(`${field} doit avoir au moins ${rule.minLength} caractères`);
        }

        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push(`${field} doit avoir au maximum ${rule.maxLength} caractères`);
        }

        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`${field} doit être parmi: ${rule.enum.join(', ')}`);
        }

        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push(`${field} format invalide`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join('; ') });
    }

    next();
  };
}

function validateId(...paramNames) {
  return (req, res, next) => {
    for (const name of paramNames) {
      const value = req.params[name];
      if (value !== undefined && (!/^\d+$/.test(value) || parseInt(value) < 1)) {
        return res.status(400).json({ success: false, error: `${name} invalide` });
      }
    }
    next();
  };
}

module.exports = { validate, validateId, REACTION_TYPES };
