

function validator (schema) {
  return (val) => {
    const errors = [];
    if (schema.required && typeof val === 'undefined') errors.push(`Required.`);
    if (schema.notNull && val === null) errors.push(`Should not be null.`);
    if (schema.type && typeof val !== schema.type) errors.push(`Wrong type, should be ${schema.type}.`);
    if (schema.maxLength && typeof val?.length === 'number' && val.length > schema.maxLength) errors.push(`Max length ${schema.maxLength}.`);
    if (schema.minLength && typeof val?.length === 'number' && val.length < schema.minLength) errors.push(`Min length ${schema.minLength}.`);
    if (schema.other) errors.push(...schema.other(val));
    if (errors.length) return errors;
    return false;
  };
}

// actually move this to a lib for reuse
const validConfig = {
  jwtSecret: validator({
    required: true,
    notNull: true,
    type: 'string',
    minLength: 20,
  }),
  didPLC: validator({
    required: true,
    notNull: true,
    type: 'string',
    other: (val) => {
      const url = new URL(val);
      return [!/^https?$/.test(url.protocol) && !url.hostname && `Does not look like a PLC URL: "${val}"`].filter(Boolean);
    },
  }),
  appViewDomain: validator({
    required: true,
    notNull: true,
    type: 'string',
    other: (val) => [!/\w\.\w/.test(val) && `Does not look like a domain: "${val}".`].filter(Boolean),
  }),
  privateKeyPath: validator({
    required: true,
    notNull: true,
    type: 'string',
    minLength: 1,
  }),
  handle: validator({
    required: true,
    notNull: true,
    type: 'string',
    other: (val) => [!/\w\.\w/.test(val) && `Does not look like a handle: "${val}".`].filter(Boolean),
  }),
  password: validator({
    required: true,
    notNull: true,
    type: 'string',
    minLength: 1, // you do you
  }),
  // lol yeah
  email: validator({
    required: true,
    notNull: true,
    type: 'string',
    other: (val) => [!/@/.test(val) && `Does not look like an email address: "${val}"`].filter(Boolean),
  }),
};

export const configurationKeys = new Set(Object.keys(validConfig));

export function findErrorsInKey (key, value) {
  if (!configurationKeys.has(key)) return [`Unknown configuration key "${key}".`];
  try {
    return validConfig[key](value);
  }
  catch (e) {
    return [e.message || 'Value invalid for unknown reasons.'];
  }
}

// note that this does not give you a fully functional configuration
export function defaultConfiguration () {
  return {
    jwtSecret: '',
    didPLC: 'https://plc.bsky-sandbox.dev/',
    appViewDomain: 'api.bsky-sandbox.dev',
  };
}
