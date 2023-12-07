
export const people = {
  '$did': {
    'email?': 'string',
    'password?': 'string',
    'handle?': 'string',
    'didDocument?': 'object',
    'invitations?': {
      '$code': {
        availableUses: 'number',
        disabled: 'boolean',
        createdBy: 'string',
        createdAt: 'string',
      },
    },
  },
};

export const dids = {
  '$did': {
    createdAt: 'string',
  },
};
