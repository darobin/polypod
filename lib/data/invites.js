
import { nanoid } from 'nanoid';

export default class InvitesData {
  constructor (db) {
    this.db = db;
    this.open = db.sublevel('open-invitations', { valueEncoding: 'json' });
    this.used = db.sublevel('used-invitations', { valueEncoding: 'json' });
  }
  async createInvite ({ forAccount, createdBy, useCount }) {
    const code = `polypod-${nanoid()}`;
    await this.open.put(
      code,
      {
        code,
        availableUses: useCount,
        disabled: false,
        forAccount,
        createdBy,
        createdAt: new Date().toISOString(),
      }
    );
    return code;
  }
  async isAvailable (inviteCode) {
    return !!await this.open.get(inviteCode);
  }
  // async listOpenInvites () {
  //   await this.open.open();
  //   const res = [];
  //   for await (const val of this.open.iterator()) res.push(val);
  //   console.warn(`res ${JSON.stringify(res)}`);
  //   for await (const k of this.open.keys()) console.warn(`• ${k}`);
  //   return res;
  // }
}
