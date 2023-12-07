
import { join } from 'node:path';
import { AceBase } from 'acebase';
import { people } from './data/schema.js';
import InvitesData from './data/invites.js';

export default class Data {
  constructor (storeDir) {
    this.storeDir = join(storeDir, 'acebase');
    this.db = new AceBase('polypod', { storage: { path: this.storeDir } });
    this.invites = new InvitesData(this.db);
  }
  async open () {
    await this.db.ready();
    await this.db.schema.set('people', people);
  }
}
