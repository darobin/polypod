
import { AuthRequiredError } from '@atproto/xrpc-server';
import lexicons from '../../../lexicons.js';

export default function makeCreateInviteCode (pds) {
  return {
    nsid: 'com.atproto.server.createInviteCode',
    lexicon: lexicons.com.atproto.server.createInviteCode,
    auth: pds.ctx.auth.adminVerifier,
    handler: async ({ input, auth }) => {
      if (!auth.credentials.admin) throw new AuthRequiredError('Insufficient privileges');
      // we disregard useCount for now
      const { forAccount = 'admin' } = input.body;
      const code = await pds.data.invites.createInvite({ forAccount, createdBy: 'admin' });
      console.warn(`createInviteCode: ${code} for ${forAccount}`);
    },
  };
}
