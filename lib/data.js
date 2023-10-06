
import { join } from 'node:path';
import { Level } from 'level';
import InvitesData from './data/invites.js';

export default class Data {
  constructor (storeDir) {
    this.storeDir = join(storeDir, 'level-data');
    this.db = new Level(this.storeDir, { valueEncoding: 'json' });
    this.invites = new InvitesData(this.db);
  }
  async open () {
    await this.db.open();
  }
}
