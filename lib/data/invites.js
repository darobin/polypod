
import { nanoid } from 'nanoid';

const INVITE_IDX = 'people/*/invitations/$code';

export default class InvitesData {
  constructor (db) {
    this.db = db;
  }
  async init () {
    await this.db.indexes.create(INVITE_IDX, '$code');
  }
  async createInvite ({ forAccount, createdBy, useCount }) {
    const code = `polypod-${nanoid()}`;
    await this.db.ref(`people/${forAccount}/invitations/${code}`).set({
      availableUses: useCount || 1,
      disabled: false,
      createdBy,
      createdAt: new Date().toISOString(),
    });
    return code;
  }
  async isAvailable (inviteCode) {
    const snaps = await this.db.query(INVITE_IDX).filter('$code', '==', inviteCode).get();
    return !!snaps.length;
  }
}
