
import { AuthRequiredError } from '@atproto/xrpc-server';
import { schemaDict } from '@atproto/pds/dist/lexicon/lexicons.js';

export default function makeCreateInviteCode (pds) {
  return {
    nsid: 'com.atproto.server.createInviteCode',
    lexicon: schemaDict.ComAtprotoServerCreateInviteCode,
    auth: pds.ctx.roleVerifier,
    handler: async ({ input, auth }) => {
      if (!auth.credentials.admin) throw new AuthRequiredError('Insufficient privileges');
      // we disregard useCount for now
      const { forAccount = 'admin' } = input.body;
      const code = await pds.data.invites.createInvite({ forAccount, createdBy: 'admin' });
      console.warn(`createInviteCode: ${code} for ${forAccount}`);
    },
  };
}
