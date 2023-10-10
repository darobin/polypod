
import { AuthRequiredError } from '@atproto/xrpc-server';
import lexicons from '../../../lexicons.js';

export default function makeCreateAccount (pds) {
  return {
    nsid: 'com.atproto.server.createAccount',
    lexicon: lexicons.com.atproto.server.createAccount,
    // auth: pds.ctx.auth.makeAdminVerifier(),
    handler: async ({ input, auth }) => {
      // if (!auth.admin) throw new AuthRequiredError('Insufficient privileges');
      // // we disregard useCount for now
      // const { forAccount = 'admin' } = input.body;
      // const code = await pds.ctx.data.invites.createInvite({ forAccount, createdBy: 'admin' });
      // console.warn(`createAccount: ${code} for ${forAccount}`);
      // return {
      //   encoding: 'application/json',
      //   body: { code },
      // };
    },
  };
}
