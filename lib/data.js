
import { AceBase } from 'acebase';
import { people, dids } from './data/schema.js';
import InvitesData from './data/invites.js';
import DIDData from './data/did.js';
import PeopleData from './data/people.js';

export default class Data {
  constructor (storeDir) {
    this.storeDir = storeDir;
    this.db = new AceBase('polypod', {
      // logLevel: 'verbose', // for debugging
      storage: { path: this.storeDir },
      // sponsor: true, // set this when we sponsor, makes the banner go away
    });
    this.invites = new InvitesData(this.db);
    this.did = new DIDData(this.db);
    this.people = new PeopleData(this.db);
  }
  async open () {
    // XXX prone to failing silently, need to look at where to listen to errors
    await this.db.ready();
    await this.db.schema.set('people', people);
    await this.db.schema.set('dids', dids);
    await this.invites.init();
    await this.people.init();
  }
  async close () {
    await this.db.close();
  }
}
