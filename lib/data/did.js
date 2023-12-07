
import { nanoid } from 'nanoid';

export default class DIDData {
  constructor (db) {
    this.db = db;
  }
  createDID () {
    return `did:polypod:${nanoid()}`;
  }
  async createDIDDocument (did) {
    const doc = {
      createdAt: new Date().toISOString(),
    };
    await this.db.ref(`dids/${did}`).set(doc);
    return doc;
  }
  async resolveDID (did) {
    const snap = await this.db.ref(`dids/${did}`).get();
    if (snap.exists()) return snap.val();
    return null;
  }
}
