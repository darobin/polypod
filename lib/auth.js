
import basicAuth from 'basic-auth';

export default class Auth {
  constructor (opts) {
    this.adminPassword = opts.adminPassword;
  }
  makeAdminVerifier () {
    return async ({ req }) => {
      console.warn(`admin verification`);
      try {
        const { name, pass } = basicAuth(req);
        console.warn(`  • ${name}:${pass} (matches: ${name === 'admin' && pass === this.adminPassword})`);
        if (name === 'admin' && pass === this.adminPassword) return { admin: true };
        return { status: 401, message: 'Restricted to admin.' };
      }
      catch (err) {
        req.log.error(err);
      }
    };
  }
}
