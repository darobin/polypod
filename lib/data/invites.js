
import { nanoid } from 'nanoid';

export default class InvitesData {
  constructor (db) {
    this.db = db;
    this.open = db.sublevel('open-invitations');
    this.used = db.sublevel('used-invitations');
  }
  async createInvite ({ forAccount, createdBy }) {
    const code = `polypod-${nanoid()}`;
    await this.open.put(
      code,
      {
        code,
        availableUses: 1,
        disabled: false,
        forAccount,
        createdBy,
        createdAt: new Date().toISOString(),
      }
    );
    return code;
  }
}
