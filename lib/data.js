
import { AceBase } from 'acebase';
import { people } from './data/schema.js';
import InvitesData from './data/invites.js';

export default class Data {
  constructor (storeDir) {
    this.storeDir = storeDir;
    this.db = new AceBase('polypod', {
      // logLevel: 'verbose', // for debugging
      storage: { path: this.storeDir },
      // sponsor: true, // set this when we sponsor, makes the banner go away
    });
    this.invites = new InvitesData(this.db);
  }
  async open () {
    // XXX prone to failing silently, need to look at where to listen to errors
    await this.db.ready();
    await this.db.schema.set('people', people);
  }
  async close () {
    await this.db.close();
  }
}
