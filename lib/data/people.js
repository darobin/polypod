
import crypto from 'node:crypto';

const PEOPLE_IDX = 'people/*';

export default class PeopleData {
  constructor (db) {
    this.db = db;
  }
  async init () {
    await this.db.indexes.create(PEOPLE_IDX, 'handle');
    await this.db.indexes.create(PEOPLE_IDX, 'email');
  }
  async getPerson (did, getOptions) {
    const p = await this.db.ref(`people/${did}`).get(getOptions);
    if (!p.exists()) return null;
    return p.val();
  }
  async resolveOne (key, value) {
    const snaps = await this.db.query(PEOPLE_IDX).filter(key, '==', value).get();
    if (!snaps.length) return null;
    return snaps[0].key;
  }
  async resolveHandle (handle) {
    return this.resolveOne('handle', handle);
  }
  async resolveEmail (email) {
    return this.resolveOne('email', email);
  }
  // note that indexing is not unique, we have to enforce unique handles ourselves here
  async register ({ email, handle, did, password }) {
    const [emailDID, handleDID, p] = await Promise.all([
      this.resolveEmail(email),
      this.resolveHandle(handle),
      this.getPerson(did, { include: ['email', 'handle'] }),
    ]);
    if (emailDID) throw new Error(`Email already taken: ${email}`);
    if (handleDID) throw new Error(`Handle already taken: ${handle}`);
    if (p && p.email) throw new Error(`DID ${did} already exists with a different email.`);
    if (p && p.handle) throw new Error(`DID ${did} already exists with a different handle.`);
    const passwordScrypt = await genSaltAndHash(password);
    await this.db.ref(`people/${did}`).update({
      email,
      handle,
      passwordScrypt,
    });
  }
}

async function genSaltAndHash (password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, hash) => {
      if (err) return reject(err);
      resolve(salt + ':' + hash.toString('hex'));
    });
  });
}
