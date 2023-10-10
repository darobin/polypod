
import { AuthRequiredError } from '@atproto/xrpc-server';
import lexicons from '../../../lexicons.js';

export default function makeCreateInviteCode (pds) {
  return {
    nsid: 'com.atproto.server.createInviteCode',
    lexicon: lexicons.com.atproto.server.createInviteCode,
    auth: pds.ctx.auth.makeAdminVerifier(),
    handler: async ({ input, auth }) => {
      if (!auth.admin) throw new AuthRequiredError('Insufficient privileges');
      const { forAccount = 'admin', useCount = 1 } = input.body;
      const code = await pds.ctx.data.invites.createInvite({ forAccount, createdBy: 'admin', useCount });
      console.warn(`createInviteCode: ${code} for ${forAccount}`);
      return {
        encoding: 'application/json',
        body: { code },
      };
    },
  };
}
