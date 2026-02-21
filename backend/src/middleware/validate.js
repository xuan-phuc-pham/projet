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
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
          continue;
        }

        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} characters`);
        }

        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push(`${field} must be at most ${rule.maxLength} characters`);
        }

        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
        }

        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
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
        return res.status(400).json({ success: false, error: `Invalid ${name}` });
      }
    }
    next();
  };
}

module.exports = { validate, validateId, REACTION_TYPES };
