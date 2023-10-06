
import { AuthRequiredError } from '@atproto/xrpc-server';
import lexicons from '../../../lexicons.js';

export default function makeCreateInviteCode (pds) {
  return {
    nsid: 'com.atproto.server.createInviteCode',
    lexicon: lexicons.com.atproto.server.createInviteCode,
    auth: pds.ctx.auth.makeAdminVerifier(),
    handler: async ({ input, auth }) => {
      console.warn(`creds`, auth);
      if (!auth.admin) throw new AuthRequiredError('Insufficient privileges');
      // we disregard useCount for now
      const { forAccount = 'admin' } = input.body;
      console.warn(`forAccount: ${forAccount}`);
      console.warn(`calling pds.data.invites.createInvite: pds=${!!pds} ctx=${!!pds?.ctx} data=${!!pds?.ctx?.data} invites=${!!pds?.ctx?.data?.invites} method=${!!pds?.ctx?.data?.invites?.createInvite}`);
      const code = await pds.ctx.data.invites.createInvite({ forAccount, createdBy: 'admin' });
      console.warn(`createInviteCode: ${code} for ${forAccount}`);
      return {
        encoding: 'application/json',
        body: { code },
      };
    },
  };
}
