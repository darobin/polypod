
import { Level } from 'level';
import InvitesData from './data/invites.js';

export default class Data {
  constructor (storeDir) {
    this.storeDir = storeDir;
    this.db = new Level(storeDir, { valueEncoding: 'json' });
    this.invites = new InvitesData(this.db);
  }
}
