
import basicAuth from 'basic-auth';

export default class Auth {
  constructor (opts) {
    this.adminPassword = opts.adminPassword;
  }
  async adminVerifier ({ req }) {
    const { name, pass } = basicAuth(req);
    if (name === 'admin' && pass === this.adminPassword) return { admin: true };
    return { status: 401, message: 'Restricted to admin.' };
  }
}
